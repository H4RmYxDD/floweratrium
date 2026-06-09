const baseUrl = "http://localhost:3456/api";

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
};

export default api;
