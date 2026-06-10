// tokenStore.ts — csak ezt az egy fájlt kell módosítani
let memoryToken: string | null = null;

export const tokenStore = {
  get: () => memoryToken ?? sessionStorage.getItem("token"),
  set: (token: string) => {
    memoryToken = token;
    sessionStorage.setItem("token", token);
  },
  clear: () => {
    memoryToken = null;
    sessionStorage.removeItem("token");
  },
};
