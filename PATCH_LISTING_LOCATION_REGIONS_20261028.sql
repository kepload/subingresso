-- Accetta i nomi regionali brevi del selettore e i valori bilingui storici.
-- Anagrafica, annunci e profili restano invariati.
BEGIN;
CREATE OR REPLACE FUNCTION data_quality.listing_issues(a jsonb) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE issues text[]:='{}'; p numeric; s numeric; loc record; e jsonb;
BEGIN
    IF NOT data_quality.valid_text(a->>'titolo',3,110) THEN issues:=array_append(issues,'titolo'); END IF;
    IF NOT data_quality.valid_text(a->>'descrizione',40,10000,true) THEN issues:=array_append(issues,'descrizione'); END IF;
    IF NOT data_quality.valid_text(a->>'contatto',1,100) THEN issues:=array_append(issues,'contatto'); END IF;
    IF data_quality.phone_digits(a->>'tel') IS NULL THEN issues:=array_append(issues,'telefono'); END IF;
    IF nullif(trim(a->>'email'),'') IS NOT NULL AND NOT data_quality.valid_email(a->>'email') THEN issues:=array_append(issues,'email'); END IF;
    IF coalesce(a->>'stato','') NOT IN ('Vendita','Affitto mensile') THEN issues:=array_append(issues,'stato'); END IF;
    IF coalesce(a->>'tipo','') NOT IN ('Mercato settimanale','Fiera') THEN issues:=array_append(issues,'tipo'); END IF;
    IF coalesce(a->>'settore','') NOT IN ('Frutta e verdura','Pesce','Carne','Formaggi e salumi','Pane e prodotti da forno','Gastronomia / cibi pronti','Dolci e pasticceria','Biologico e km0','Altro alimentare','Abbigliamento e accessori','Calzature','Biancheria e tessuti','Fiori e piante','Casalinghi','Libri e giocattoli','Gioielli e bigiotteria','Elettronica','Antiquariato','Altro non alimentare') THEN issues:=array_append(issues,'settore'); END IF;
    BEGIN p:=(a->>'prezzo')::numeric; EXCEPTION WHEN OTHERS THEN p:=NULL; END;
    IF p IS NULL OR NOT(p BETWEEN 101 AND 400000) OR p<>round(p,2) THEN issues:=array_append(issues,'prezzo'); END IF;
    BEGIN s:=(a->>'superficie')::numeric; EXCEPTION WHEN OTHERS THEN s:=NULL; END;
    IF s IS NULL OR NOT(s>0 AND s<=10000) OR s<>round(s,2) THEN issues:=array_append(issues,'superficie'); END IF;
    IF a->>'tipo'='Mercato settimanale' AND (coalesce(a->>'giorni','') !~ '^(Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica)(, (Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica))*$'
      OR (SELECT count(*)<>count(DISTINCT d) FROM unnest(string_to_array(a->>'giorni',', ')) d)) THEN issues:=array_append(issues,'giorni'); END IF;
    IF a->>'tipo'='Fiera' AND NOT data_quality.valid_text(a->>'giorni',1,500,true) THEN issues:=array_append(issues,'giorni'); END IF;
    IF NOT EXISTS(SELECT 1 FROM data_quality.locations l WHERE l.name=a->>'comune'
      AND l.regione=CASE a->>'regione'
        WHEN 'Trentino-Alto Adige' THEN 'Trentino-Alto Adige/Südtirol'
        WHEN 'Valle d''Aosta' THEN 'Valle d''Aosta/Vallée d''Aoste'
        ELSE a->>'regione' END
      AND l.provincia=a->>'provincia') THEN issues:=array_append(issues,'localita'); END IF;
    e:=a->'dettagli_extra';
    IF e IS NOT NULL AND e<>'null'::jsonb AND jsonb_typeof(e)<>'object' THEN issues:=array_append(issues,'dettagli'); END IF;
    IF octet_length(coalesce(e::text,''))>50000 THEN issues:=array_append(issues,'dettagli'); END IF;
    IF e ? 'nome_fiera' AND NOT data_quality.valid_text(e->>'nome_fiera',0,150) THEN issues:=array_append(issues,'fiera'); END IF;
    IF e ? 'note_fiera' AND NOT data_quality.valid_text(e->>'note_fiera',0,500,true) THEN issues:=array_append(issues,'fiera'); END IF;
    IF jsonb_typeof(a->'img_urls')='array' THEN
      IF jsonb_array_length(a->'img_urls')>5 OR EXISTS(SELECT 1 FROM jsonb_array_elements(a->'img_urls') v WHERE jsonb_typeof(v)<>'string' OR length(v#>>'{}')>2000 OR (v#>>'{}') !~ '^https://[^[:space:]<>]+$') THEN issues:=array_append(issues,'foto'); END IF;
    END IF;
    IF e ? 'images' AND e->'images' IS DISTINCT FROM coalesce(a->'img_urls','[]'::jsonb) THEN issues:=array_append(issues,'foto'); END IF;
    RETURN issues;
END $$;
COMMIT;
