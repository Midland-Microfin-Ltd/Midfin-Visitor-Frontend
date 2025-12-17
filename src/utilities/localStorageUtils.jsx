export const storeInLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export const retrieveFromLocalStorage = (key) => {
  return localStorage.getItem(key);
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const storeObjectInLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const retrieveObjectFromLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};