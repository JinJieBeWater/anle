export const normalizeTableName = (table: string) => {
  const normalized = table.includes(".") ? table.split(".").pop() : table;
  return normalized ?? table;
};
