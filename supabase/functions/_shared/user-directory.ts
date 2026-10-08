export async function userDirectory(admin: any, max = Infinity): Promise<Record<string, any>[]> {
  const result: Record<string, any>[] = [];
  const ids = new Set<string>();
  let snapshotTotal: number | undefined;
  let offset = 0, total = 1;
  while (offset < total && result.length < max) {
    const { data, error } = await admin.rpc('admin_user_directory', { p_offset: offset, p_limit: Math.min(1000, max - result.length) });
    if (error || !data || !Array.isArray(data.users)) throw new Error('Elenco utenti non disponibile');
    total = Number(data.total);
    if (!Number.isInteger(total) || total < 0 || (offset < total && !data.users.length)) throw new Error('Elenco utenti incompleto');
    if (snapshotTotal !== undefined && snapshotTotal !== total) throw new Error('Elenco utenti aggiornato durante il caricamento: riprova');
    snapshotTotal = total;
    for (const user of data.users) {
      if (!user?.id || ids.has(user.id)) throw new Error('Paginazione utenti incoerente');
      ids.add(user.id);
    }
    result.push(...data.users); offset += data.users.length;
  }
  return result;
}
