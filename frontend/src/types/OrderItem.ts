export type OrderItem = {
    orderItemId: number;
    orderId: number;
    productId: number;
    quantity: number;
    productPrice: number;
    name: string;
    imageUrl: string;
    message : string | null;
};
