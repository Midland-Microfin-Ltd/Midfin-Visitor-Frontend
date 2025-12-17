export const storeInSessionStorage = (key, value) => {
  sessionStorage.setItem(key, value);
};

export const retrieveFromSessionStorage = (key) => {
  return sessionStorage.getItem(key);
};

export const removeFromSessionStorage = (key) => {
  sessionStorage.removeItem(key);
};

export const storeObjectInSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const retrieveObjectFromSessionStorage = (key) => {
  const value = sessionStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};