export const baseUrl = "http://localhost:3456/api";
export const imageUrl = "http://localhost:3456";

export const api = {
  getProducts: async () => {
    const response = await fetch(`${baseUrl}/products`);
    if (!response.ok) throw new Error("Hiba a termékek betöltésekor");
    return response.json();
  },

  getProduct: async (id: number) => {
    const response = await fetch(`${baseUrl}/products/${id}`);
    if (!response.ok) throw new Error("Hiba a termék betöltésekor");
    return response.json();
  },
  getCategories: async () => {
    const response = await fetch(`${baseUrl}/categories`);
    if (!response.ok) throw new Error("Hiba a kategóriák betöltésekor");
    return response.json();
  },
  getImages: async () => {
    const response = await fetch(`${imageUrl}/images`);
    if (!response.ok) throw new Error("Hiba a képek betöltésekor");
    return response.json();
  },

  tryLogin: async (request: { email: string; password: string }) => {
        const response = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: request.email,
            password: request.password,
          }),
        });
        if (!response.ok) throw new Error("Hiba a bejelentkezés során");
        return response.json();
  },
};

export default api;
