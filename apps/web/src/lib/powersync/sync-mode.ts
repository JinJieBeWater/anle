const SYNC_KEY = "syncEnabled";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getSyncEnabled = (dbName: string) => {
  if (!canUseStorage()) {
    return false;
  }

  const key = `${SYNC_KEY}-${dbName}`;
  const value = window.localStorage.getItem(key);

  if (!value) {
    window.localStorage.setItem(key, "FALSE");
    return false;
  }

  return value === "TRUE";
};

export const setSyncEnabled = (dbName: string, enabled: boolean) => {
  if (!canUseStorage()) {
    return;
  }

  const key = `${SYNC_KEY}-${dbName}`;
  window.localStorage.setItem(key, enabled ? "TRUE" : "FALSE");
};
