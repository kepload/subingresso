begin;
do $$
declare metric_name text; days integer; expected bigint; actual bigint; result json;
begin
 perform set_config('request.jwt.claim.sub',(select id::text from public.profiles where is_admin=true limit 1),true);
 foreach metric_name in array array['view','search'] loop
  insert into public.geo_stats_daily(metric,day,name,regione,provincia,cnt) values
   (metric_name,(now() at time zone 'UTC')::date,'zz-test-geo-history','','',1000001),
   (metric_name,(now() at time zone 'UTC')::date-10,'zz-test-geo-history','','',1000002),
   (metric_name,(now() at time zone 'UTC')::date-60,'zz-test-geo-history','','',1000003),
   (metric_name,(now() at time zone 'UTC')::date-400,'zz-test-geo-history','','',1000004);
  foreach days in array array[7,30,365,0] loop
   result := case when metric_name='view' then public.admin_top_comuni_views(days) else public.admin_top_location_searches(days) end;
   select (r->>'cnt')::bigint into actual from json_array_elements(result) r where coalesce(r->>'slug',r->>'name')='zz-test-geo-history';
   expected := case days when 7 then 1000001 when 30 then 2000003 when 365 then 3000006 else 4000010 end;
   if actual is distinct from expected then raise exception 'Periodo % %: % invece di %',metric_name,days,actual,expected; end if;
  end loop;
 end loop;
 perform set_config('request.jwt.claim.sub','',true);
 if public.admin_top_comuni_views(0)->>'error' <> 'forbidden' or public.admin_top_location_searches(0)->>'error' <> 'forbidden' then raise exception 'Permessi errati'; end if;
 select coalesce(sum(cnt),0) into expected from public.geo_stats_daily where metric='search';
 perform public.track_location_search('00000000-0000-4000-8000-000000000019','Milano','Lombardia','Milano');
 perform public.track_location_search('00000000-0000-4000-8000-000000000019','Milano','Lombardia','Milano');
 select coalesce(sum(cnt),0) into actual from public.geo_stats_daily where metric='search';
 if actual<>expected+1 then raise exception 'Archivio/deduplica non corretti'; end if;
 delete from public.location_search_events where session_id='00000000-0000-4000-8000-000000000019';
 select coalesce(sum(cnt),0) into actual from public.geo_stats_daily where metric='search';
 if actual<>expected+1 then raise exception 'Archivio perso cancellando evento'; end if;
 select coalesce(sum(cnt),0) into expected from public.geo_stats_daily where metric='view';
 insert into public.page_views(path,visitor_id,session_id) values('/annunci/zz-test-geo-history','00000000-0000-4000-8000-000000000019','00000000-0000-4000-8000-000000000019');
 insert into public.page_views(path,visitor_id,session_id) values('/annunci/zz-test-geo-history','00000000-0000-4000-8000-000000000019','00000000-0000-4000-8000-000000000019') on conflict do nothing;
 select coalesce(sum(cnt),0) into actual from public.geo_stats_daily where metric='view';
 if actual<>expected+1 then raise exception 'Archivio visite/deduplica non corretti'; end if;
 delete from public.page_views where session_id='00000000-0000-4000-8000-000000000019';
 select coalesce(sum(cnt),0) into actual from public.geo_stats_daily where metric='view';
 if actual<>expected+1 then raise exception 'Archivio visite perso cancellando evento'; end if;
end $$;
rollback;
select 'OK: 4 periodi per entrambi i grafici, accesso admin, archivio automatico, deduplica e conservazione senza eventi originali. Test annullati.' as result;
