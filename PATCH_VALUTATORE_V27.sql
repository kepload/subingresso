-- Valutatore v2.7: resa giornaliera e giornate effettive, revisione approvata 27/11/2026.
-- Richiede v2.6 e lo schema data_quality. Nessuna riscrittura dei report storici.
BEGIN;
CREATE OR REPLACE FUNCTION data_quality.valuation_v27_curve(p_daily double precision, p_strong boolean)
RETURNS double precision LANGUAGE plpgsql IMMUTABLE SET search_path TO '' AS $curve$
DECLARE
    x double precision[] := ARRAY[0,100,200,340,400,580,1000];
    y double precision[];
    h double precision[]; d double precision[]; m double precision[];
    i integer; j integer; w1 double precision; w2 double precision;
    v double precision; t double precision; t2 double precision; t3 double precision; rate double precision;
BEGIN
    y := CASE WHEN p_strong THEN ARRAY[1000,5000,15000,28250,33500,50000,95000]::double precision[]
        ELSE ARRAY[1000,3000,10000,20400,24000,40000,74000]::double precision[] END;
    y[1] := 0;
    FOR i IN 2..7 LOOP y[i] := (y[i]-1000)/x[i]; END LOOP;
    FOR i IN 1..6 LOOP h[i] := x[i+1]-x[i]; d[i] := (y[i+1]-y[i])/h[i]; END LOOP;
    m[1] := ((2*h[1]+h[2])*d[1]-h[1]*d[2])/(h[1]+h[2]);
    m[1] := CASE WHEN sign(m[1])<>sign(d[1]) THEN 0 ELSE LEAST(m[1],3*d[1]) END;
    m[7] := ((2*h[6]+h[5])*d[6]-h[6]*d[5])/(h[6]+h[5]);
    m[7] := CASE WHEN sign(m[7])<>sign(d[6]) THEN 0 ELSE LEAST(m[7],3*d[6]) END;
    FOR i IN 2..6 LOOP
        w1 := 2*h[i]+h[i-1]; w2 := h[i]+2*h[i-1];
        m[i] := CASE WHEN d[i-1]*d[i]<=0 THEN 0 ELSE (w1+w2)/(w1/d[i-1]+w2/d[i]) END;
    END LOOP;
    v := LEAST(1000,GREATEST(0,p_daily)); i := 6;
    FOR j IN 1..6 LOOP IF v<=x[j+1] THEN i:=j; EXIT; END IF; END LOOP;
    t := (v-x[i])/h[i]; t2 := t*t; t3 := t2*t;
    rate := (2*t3-3*t2+1)*y[i] + (t3-2*t2+t)*h[i]*m[i]
        + (-2*t3+3*t2)*y[i+1] + (t3-t2)*h[i]*m[i+1];
    RETURN 1000+v*rate;
END;
$curve$;
REVOKE ALL ON FUNCTION data_quality.valuation_v27_curve(double precision,boolean) FROM PUBLIC,anon,authenticated;

-- Solo input normalizzato dalla RPC; nessuna lettura o scrittura di tabelle.
CREATE OR REPLACE FUNCTION data_quality.calculate_valutazione_v27(p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path TO '' AS $calculate$
DECLARE
    days integer := (p_data->>'giornate')::integer;
    turnover double precision := (p_data->>'fatturato')::double precision;
    profit double precision := (p_data->>'utileGiorno')::double precision;
    daily double precision; quality double precision; weak double precision; strong double precision;
    value50 double precision; exponent double precision; factor double precision; sector double precision;
    sun double precision; certainty double precision; surplus double precision; value double precision;
    before_profit double precision; uncapped double precision; cap double precision; unknowns integer;
    uncertainty double precision; base_rent double precision; rent double precision;
    v_min numeric; v_avg numeric; v_max numeric;
BEGIN
    daily := turnover/days;
    IF p_data->>'concessione'='temporanea' THEN
        RAISE EXCEPTION 'Verifica prima il titolo cedibile con il Comune' USING ERRCODE='22023';
    END IF;
    IF daily>1000 OR turnover>250000 OR p_data->>'concessione'='breve' OR profit*days<=200 THEN
        RAISE EXCEPTION 'Per questi dati serve una valutazione specifica' USING ERRCODE='22023';
    END IF;
    quality := LEAST(1,GREATEST(0,
        (CASE p_data->>'passaggio' WHEN 'laterale' THEN 0 WHEN 'alto' THEN 1 ELSE 0.5 END)::double precision*0.8
        + CASE WHEN p_data->>'zona'<>'interna' AND p_data->>'clientela'='mista' THEN 0.2 ELSE 0 END
        + CASE WHEN p_data->>'posizione'='angolare' THEN 0.1 ELSE 0 END));
    weak := data_quality.valuation_v27_curve(daily,false);
    strong := data_quality.valuation_v27_curve(daily,true);
    value50 := weak+quality*(strong-weak);
    exponent := CASE WHEN daily<=100 THEN 1 WHEN daily<200 THEN 1-(daily-100)*0.0025
        WHEN daily<400 THEN 0.75-(daily-200)*0.00275 ELSE 0.20 END;
    factor := CASE WHEN days<=50 THEN power(days::double precision/50,exponent) ELSE 1+ln(days::double precision/50) END;
    sector := CASE WHEN p_data->>'settore'='alimentare' THEN 1.3 ELSE 1 END;
    sun := CASE p_data->>'sole' WHEN 'frontale' THEN 0.95 WHEN 'variabile' THEN 0.98 ELSE 1 END;
    certainty := CASE WHEN p_data->>'concessione'='non_so' THEN 0.85 ELSE 1 END;
    surplus := COALESCE(profit*days,turnover*0.20);
    value := 1000+(value50-1000)*(50*factor)/50*sector*sun*certainty;
    before_profit := value;
    IF profit IS NOT NULL THEN value := 1000+LEAST((value-1000)*1.5,
        sqrt(GREATEST(0,value-1000)*GREATEST(0,5*surplus-1000))); END IF;
    cap := floor(LEAST(GREATEST(1000,2*turnover),CASE WHEN profit IS NOT NULL THEN GREATEST(1000,5*surplus) ELSE 'Infinity'::double precision END));
    uncapped := value;
    value := GREATEST(1000,LEAST(value,cap));
    SELECT count(*) INTO unknowns FROM unnest(ARRAY['passaggio','clientela','sole']) k WHERE p_data->>k='non_so';
    uncertainty := LEAST(0.55,(CASE WHEN profit IS NULL THEN 0.35 ELSE 0.25 END)::double precision + unknowns*0.05
        + CASE WHEN p_data->>'clientela'='turisti' THEN 0.05 ELSE 0 END
        + CASE WHEN p_data->>'concessione'='non_so' THEN 0.1 ELSE 0 END);
    value := round(value::numeric,6)::double precision;
    v_min := floor(round((1000+(value-1000)*(1-uncertainty))::numeric,6));
    v_max := ceil(round(LEAST(1000+(value-1000)*(1+uncertainty),cap)::numeric,6));
    v_avg := round(value::numeric);
    base_rent := LEAST(value*0.18,surplus*0.30); rent := base_rent;
    IF base_rent>0 AND base_rent<3000 THEN
        rent := LEAST(CASE WHEN base_rent<=1000 THEN 500+base_rent*1.8 ELSE 2300+(base_rent-1000)*0.35 END,surplus*0.70,cap*0.18);
    END IF;
    rent := floor(round(GREATEST(500,rent)::numeric,6));
    RETURN jsonb_build_object('min',v_min,'avg',v_avg,'max',v_max,'rent',rent,'monthly',round((rent/12)::numeric),
        'base',round((1000+(value50-1000)*(50*factor)/50)::numeric),'surplus',round(surplus::numeric,6),
        'beforeProfit',round(before_profit::numeric),'uncapped',round(uncapped::numeric),
        'quality',quality,'effectiveDays',50*factor,'uncertainty',uncertainty,'cap',cap,'knownProfit',profit IS NOT NULL,'sectorMultiplier',sector);
END;
$calculate$;
REVOKE ALL ON FUNCTION data_quality.calculate_valutazione_v27(jsonb) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.save_valutazione_v27(p_input jsonb, p_session_token text, p_request_id uuid, p_context jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_calculation jsonb;
    v_uid uuid := auth.uid();
    v_old public.valutatore_logs;
    v_row public.valutatore_logs;
    v_key text; v_allowed jsonb; v_data jsonb;
    v_incasso numeric; v_days integer; v_turnover numeric; v_profit numeric;
    v_years numeric; v_months integer;
    v_min numeric; v_max numeric; v_avg numeric; v_rent numeric;
    v_count integer; v_context jsonb; v_elapsed integer;
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
        IF v_old.algoritmo_version IS DISTINCT FROM '2.7' OR v_old.session_token <> p_session_token OR (v_old.user_id IS NOT NULL AND v_old.user_id IS DISTINCT FROM v_uid)
            OR v_old.dettagli_calcolo->'input' IS DISTINCT FROM v_data THEN
            RAISE EXCEPTION 'Richiesta già utilizzata' USING ERRCODE = '22023';
        END IF;
        RETURN jsonb_build_object('id',v_old.id,'prezzo_min',v_old.prezzo_min,'prezzo_avg',v_old.prezzo_avg,'prezzo_max',v_old.prezzo_max);
    END IF;
    SELECT count(*) INTO v_count FROM public.valutatore_logs
      WHERE created_at > now() - interval '1 hour'
        AND (session_token = p_session_token OR (v_uid IS NOT NULL AND user_id = v_uid));
    IF v_count >= 30 THEN RAISE EXCEPTION 'Troppe valutazioni: riprova più tardi' USING ERRCODE = 'P0001'; END IF;
    v_calculation := data_quality.calculate_valutazione_v27(v_data);
    v_min := (v_calculation->>'min')::numeric; v_avg := (v_calculation->>'avg')::numeric;
    v_max := (v_calculation->>'max')::numeric; v_rent := (v_calculation->>'rent')::numeric;
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
        p_input->>'zona',p_input->>'settore',p_input->>'posizione',v_min,v_avg,v_max,v_rent,round(v_rent/12),'2.7',
        jsonb_build_object('input',v_data) || v_calculation,
        v_context->>'referrer',v_context->>'utm_source',v_context->>'utm_medium',v_context->>'utm_campaign',v_context->>'landing_path',v_context->>'device_type',v_elapsed)
    RETURNING * INTO v_row;
    RETURN jsonb_build_object('id',v_row.id,'prezzo_min',v_min,'prezzo_avg',v_avg,'prezzo_max',v_max);
END;
$function$
;
REVOKE ALL ON FUNCTION public.save_valutazione_v27(jsonb,text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_valutazione_v27(jsonb,text,uuid,jsonb) TO anon,authenticated;
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
      WHERE session_token = p_session_token AND user_id IS NULL AND algoritmo_version IN ('2.0','2.1','2.2','2.3','2.4','2.5','2.6','2.7')
        AND created_at > now() - interval '1 day';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$function$
;
REVOKE ALL ON FUNCTION public.link_valutatore_to_user(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.link_valutatore_to_user(text) TO authenticated;
DO $counter$
DECLARE v_definition text;
BEGIN
    v_definition := pg_get_functiondef('public.admin_control_room(integer,text)'::regprocedure);
    IF strpos(v_definition,'algoritmo_version IS DISTINCT FROM ''2.6''')>0 THEN
        EXECUTE replace(v_definition,'algoritmo_version IS DISTINCT FROM ''2.6''','algoritmo_version IS DISTINCT FROM ''2.7''');
    ELSIF strpos(v_definition,'algoritmo_version IS DISTINCT FROM ''2.7''')=0 THEN
        RAISE EXCEPTION 'Contatore versione valutatore da verificare';
    END IF;
END;
$counter$;
NOTIFY pgrst, 'reload schema';
COMMIT;
