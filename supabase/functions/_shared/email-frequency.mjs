// A Vetrina offer replaces routine weekly emails for the following seven days.
// Reserved/unknown deliveries count too: never resend because an outcome is unclear.
export async function recentVetrinaRecipients(client, now = Date.now()) {
 const result = await client.from('vetrina_email_log').select('user_id')
  .gte('created_at',new Date(now-7*86400000).toISOString()).neq('status','cancelled');
 if(result.error) throw Error('Impossibile verificare la frequenza delle email.');
 return new Set((result.data||[]).map(row=>row.user_id));
}
