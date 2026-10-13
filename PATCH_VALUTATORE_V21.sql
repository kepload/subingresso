-- Valutatore v2.1: premio alimentare e incassi elevati.
-- RPC separata: le pagine v2.0 gia aperte continuano a funzionare.
-- Nessun report storico viene ricalcolato o modificato.
BEGIN;
CREATE OR REPLACE FUNCTION public.save_valutazione_v21(p_input jsonb, p_session_token text, p_request_id uuid, p_context jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_uid uuid := auth.uid();
    v_old public.valutatore_logs;
    v_row public.valutatore_logs;
    v_key text; v_allowed jsonb; v_data jsonb;
    v_incasso numeric; v_days integer; v_turnover numeric; v_profit numeric;
    v_surplus numeric; v_base numeric; v_value numeric; v_cap numeric;
    v_adjust numeric; v_sun numeric; v_certainty numeric; v_uncertainty numeric;
    v_tourism numeric; v_flow numeric; v_front numeric; v_years numeric; v_months integer;
    v_min numeric; v_max numeric; v_avg numeric; v_rent numeric; v_unknown integer;
    v_count integer; v_context jsonb; v_elapsed integer;
    v_sector numeric; v_revenue_premium numeric;
BEGIN
    IF p_input IS NULL OR jsonb_typeof(p_input) <> 'object' OR octet_length(p_input::text) > 4000
       OR p_context IS NULL OR jsonb_typeof(p_context) <> 'object' OR octet_length(p_context::text) > 5000
       OR p_session_token IS NULL OR p_session_token !~ '^[a-f0-9]{64}$' OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Dati della valutazione non validi' USING ERRCODE = '22023';
    END IF;
    v_allowed := '{"baseIncasso":["giorno","anno"],"frequenza":["settimanale","giornaliero","fiera"],"zona":["mare_lago","turistica","interna"],"clientela":["residenti","mista","turisti","non_so"],"passaggio":["alto","medio","laterale","non_so"],"posizione":["angolare","linea"],"sole":["riparato","frontale","variabile","non_so"],"settore":["alimentare","non_alimentare"],"concessione":["stabile","breve","non_so","temporanea"]}'::jsonb;
    v_data := '{}'::jsonb;
    FOR v_key IN SELECT jsonb_object_keys(v_allowed) LOOP
        IF NOT (p_input ? v_key) OR jsonb_typeof(p_input->v_key) <> 'string'
            OR NOT ((v_allowed->v_key) ? (p_input->>v_key)) THEN
            RAISE EXCEPTION 'Risposta non valida: %', v_key USING ERRCODE = '22023';
        END IF;
        v_data := v_data || jsonb_build_object(v_key, p_input->v_key);
    END LOOP;
    IF p_input->>'concessione' = 'temporanea' THEN
        RAISE EXCEPTION 'Verifica prima il titolo cedibile con il Comune' USING ERRCODE = '22023';
    END IF;
    IF NOT (p_input ? 'incasso') OR jsonb_typeof(p_input->'incasso') <> 'number'
       OR (p_input->>'incasso') !~ '^[0-9]+(\.[0-9]{1,2})?$'
       OR NOT (p_input ? 'giornate') OR jsonb_typeof(p_input->'giornate') <> 'number'
       OR (p_input->>'giornate') !~ '^[0-9]{1,3}$' THEN
        RAISE EXCEPTION 'Incasso o giornate non validi' USING ERRCODE = '22023';
    END IF;
    v_incasso := (p_input->>'incasso')::numeric; v_days := (p_input->>'giornate')::integer;
    IF v_days < 1 OR v_days > 366 OR (p_input->>'frequenza' = 'settimanale' AND v_days > 53)
       OR v_incasso <= 0 OR v_incasso > (CASE WHEN p_input->>'baseIncasso' = 'giorno' THEN 50000 ELSE 2000000 END) THEN
        RAISE EXCEPTION 'Incasso e giornate fuori intervallo' USING ERRCODE = '22023';
    END IF;
    v_turnover := CASE WHEN p_input->>'baseIncasso' = 'giorno' THEN v_incasso * v_days ELSE v_incasso END;
    IF v_turnover < 100 OR v_turnover > 2000000 OR v_turnover / v_days > 50000 THEN
        RAISE EXCEPTION 'Incasso e giornate non coerenti' USING ERRCODE = '22023';
    END IF;
    IF p_input->'utileGiorno' IS NOT NULL AND p_input->'utileGiorno' <> 'null'::jsonb THEN
        IF jsonb_typeof(p_input->'utileGiorno') <> 'number' OR (p_input->>'utileGiorno') !~ '^[0-9]+(\.[0-9]{1,2})?$' THEN
            RAISE EXCEPTION 'Margine non valido' USING ERRCODE = '22023';
        END IF;
        v_profit := (p_input->>'utileGiorno')::numeric;
        IF v_profit > v_turnover / v_days THEN RAISE EXCEPTION 'Il margine supera gli incassi' USING ERRCODE = '22023'; END IF;
    END IF;
    IF p_input->>'concessione' = 'breve' THEN
        IF p_input->>'mesiResidui' IS NULL OR jsonb_typeof(p_input->'mesiResidui') <> 'number' OR p_input->>'mesiResidui' !~ '^[0-9]{1,2}$' THEN
            RAISE EXCEPTION 'Indica i mesi residui' USING ERRCODE = '22023';
        END IF;
        v_months := (p_input->>'mesiResidui')::integer;
        IF v_months < 1 OR v_months > 35 THEN RAISE EXCEPTION 'Mesi residui non validi' USING ERRCODE = '22023'; END IF;
        v_years := v_months::numeric / 12;
    END IF;
    v_data := v_data || jsonb_build_object('incasso',v_incasso,'giornate',v_days,'fatturato',v_turnover,'utileGiorno',v_profit,'mesiResidui',v_months,'anniResidui',v_years);
    -- Serializza richieste della stessa identità: limite resistente a concorrenza.
    PERFORM pg_advisory_xact_lock(hashtextextended(COALESCE(v_uid::text, p_session_token), 0));
    SELECT * INTO v_old FROM public.valutatore_logs WHERE request_id = p_request_id;
    IF FOUND THEN
        IF v_old.algoritmo_version IS DISTINCT FROM '2.1' OR v_old.session_token <> p_session_token OR (v_old.user_id IS NOT NULL AND v_old.user_id IS DISTINCT FROM v_uid)
            OR v_old.dettagli_calcolo->'input' IS DISTINCT FROM v_data THEN
            RAISE EXCEPTION 'Richiesta già utilizzata' USING ERRCODE = '22023';
        END IF;
        RETURN jsonb_build_object('id',v_old.id,'prezzo_min',v_old.prezzo_min,'prezzo_avg',v_old.prezzo_avg,'prezzo_max',v_old.prezzo_max);
    END IF;
    SELECT count(*) INTO v_count FROM public.valutatore_logs
      WHERE created_at > now() - interval '1 hour'
        AND (session_token = p_session_token OR (v_uid IS NOT NULL AND user_id = v_uid));
    IF v_count >= 30 THEN RAISE EXCEPTION 'Troppe valutazioni: riprova più tardi' USING ERRCODE = 'P0001'; END IF;
    v_surplus := COALESCE(v_profit * v_days, v_turnover * 0.20);
    v_base := CASE WHEN v_profit IS NULL THEN v_turnover * 0.5 ELSE LEAST(v_surplus * 2.5, v_turnover * 0.9) END;
    -- Ipotesi commerciale: alimentare +30%, incassi elevati con crescita continua.
    v_sector := CASE WHEN p_input->>'settore' = 'alimentare' THEN 1.3 ELSE 1 END;
    v_revenue_premium := CASE WHEN p_input->>'settore' = 'alimentare'
        THEN 1 + LEAST(0.3, GREATEST(0, (v_turnover / v_days - 1000) / 1000 * 0.15)) ELSE 1 END;
    v_tourism := CASE WHEN p_input->>'zona' <> 'interna' AND p_input->>'clientela' = 'mista' THEN 1.05 ELSE 1 END;
    v_flow := CASE p_input->>'passaggio' WHEN 'alto' THEN 1.1 WHEN 'laterale' THEN 0.85 ELSE 1 END;
    v_front := CASE WHEN p_input->>'posizione' = 'angolare' THEN 1.05 ELSE 1 END;
    v_adjust := LEAST(1.3,GREATEST(0.7,v_tourism*v_flow*v_front));
    v_sun := CASE p_input->>'sole' WHEN 'frontale' THEN 0.9 WHEN 'variabile' THEN 0.95 ELSE 1 END;
    v_certainty := CASE WHEN p_input->>'concessione' = 'non_so' THEN 0.85 ELSE 1 END;
    v_value := v_base * v_sector * v_revenue_premium * v_adjust * v_certainty;
    IF v_years IS NOT NULL THEN
        v_cap := v_surplus * (1 - power(1.15, -v_years)) / 0.15;
        v_value := LEAST(v_value,v_cap);
    END IF;
    v_value := v_value * v_sun;
    v_cap := v_cap * v_sun;
    SELECT count(*) INTO v_unknown FROM unnest(ARRAY['clientela','passaggio','sole']) AS k WHERE p_input->>k = 'non_so';
    v_uncertainty := LEAST(0.55,CASE WHEN v_profit IS NULL THEN 0.35 ELSE 0.25 END + v_unknown*0.05
        + CASE WHEN p_input->>'clientela' = 'turisti' THEN 0.05 ELSE 0 END
        + CASE WHEN p_input->>'concessione' = 'non_so' THEN 0.1 ELSE 0 END);
    v_value := round(v_value,6);
    v_min := floor(round(v_value*(1-v_uncertainty),6));
    v_max := ceil(round(LEAST(v_value*(1+v_uncertainty),COALESCE(v_cap,v_value*(1+v_uncertainty))),6));
    v_avg := round(v_value); v_rent := floor(round(LEAST(v_value*0.18,v_surplus*0.30),6));
    v_context := jsonb_build_object(
        'referrer',left(p_context->>'referrer',300), 'utm_source',left(p_context->>'utm_source',300),
        'utm_medium',left(p_context->>'utm_medium',300),'utm_campaign',left(p_context->>'utm_campaign',300),
        'landing_path',left(p_context->>'landing_path',300), 'device_type',CASE WHEN p_context->>'device_type' IN ('mobile','tablet','desktop') THEN p_context->>'device_type' ELSE NULL END);
    v_elapsed := CASE WHEN (p_context->>'tempo_compilazione_sec') ~ '^[0-9]{1,5}$' THEN LEAST(86400,(p_context->>'tempo_compilazione_sec')::integer) ELSE NULL END;
    INSERT INTO public.valutatore_logs(session_token,request_id,user_id,user_linked_at,fatturato,frequenza,stagionalita,zona,settore,posizione,
        prezzo_min,prezzo_avg,prezzo_max,affitto_annuo,affitto_mensile,algoritmo_version,dettagli_calcolo,
        referrer,utm_source,utm_medium,utm_campaign,landing_path,device_type,tempo_compilazione_sec)
    VALUES(p_session_token,p_request_id,v_uid,CASE WHEN v_uid IS NOT NULL THEN now() END,v_turnover,p_input->>'frequenza',
        CASE WHEN (p_input->>'frequenza' = 'settimanale' AND v_days >= 45) OR (p_input->>'frequenza' = 'giornaliero' AND v_days >= 220) THEN 'annuale' ELSE 'stagionale' END,
        p_input->>'zona',p_input->>'settore',p_input->>'posizione',v_min,v_avg,v_max,v_rent,round(v_rent/12),'2.1',
        jsonb_build_object('input',v_data,'base',round(v_base),'surplus',round(v_surplus),'uncertainty',v_uncertainty,'knownProfit',v_profit IS NOT NULL,'sectorMultiplier',v_sector,'revenueMultiplier',v_revenue_premium),
        v_context->>'referrer',v_context->>'utm_source',v_context->>'utm_medium',v_context->>'utm_campaign',v_context->>'landing_path',v_context->>'device_type',v_elapsed)
    RETURNING * INTO v_row;
    RETURN jsonb_build_object('id',v_row.id,'prezzo_min',v_min,'prezzo_avg',v_avg,'prezzo_max',v_max);
END;
$function$;
REVOKE ALL ON FUNCTION public.save_valutazione_v21(jsonb,text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_valutazione_v21(jsonb,text,uuid,jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.link_valutatore_to_user(p_session_token text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_count integer;
BEGIN
    IF auth.uid() IS NULL OR p_session_token IS NULL OR p_session_token !~ '^[a-f0-9]{64}$' THEN RETURN 0; END IF;
    UPDATE public.valutatore_logs SET user_id = auth.uid(), user_linked_at = now()
      WHERE session_token = p_session_token AND user_id IS NULL AND algoritmo_version IN ('2.0','2.1')
        AND created_at > now() - interval '1 day';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$function$;
REVOKE ALL ON FUNCTION public.link_valutatore_to_user(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_valutatore_to_user(text) TO authenticated;

-- Allinea solo il contatore della versione corrente, conservando la funzione live.
DO $counter$
DECLARE v_definition text;
BEGIN
    v_definition := pg_get_functiondef('public.admin_control_room(integer,text)'::regprocedure);
    IF strpos(v_definition, 'algoritmo_version IS DISTINCT FROM ''2.0''') > 0 THEN
        EXECUTE replace(v_definition, 'algoritmo_version IS DISTINCT FROM ''2.0''', 'algoritmo_version IS DISTINCT FROM ''2.1''');
    ELSIF strpos(v_definition, 'algoritmo_version IS DISTINCT FROM ''2.1''') = 0 THEN
        RAISE EXCEPTION 'Contatore versione valutatore da verificare';
    END IF;
END;
$counter$;
COMMIT;
