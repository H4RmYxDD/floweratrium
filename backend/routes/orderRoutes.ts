import express, { Request, Response } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";
import * as Order from "../data/order.js";
import * as OrderItem from "../data/orderItem.js";
import { sendMail } from "../middleware/sendMail.js";

const router = express.Router();

router.post(
  "/orders",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userId,
        customerName,
        email,
        phoneNumber,
        postalCode,
        city,
        address,
        message,
        totalAmount,
        status,
        items,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: "At least one item is required" });
        return;
      }

      const orderUserId = userId || null;

      const orderId = await Order.createOrder(
        orderUserId,
        customerName,
        email,
        phoneNumber,
        postalCode,
        city,
        address,
        message,
        totalAmount,
        status || "Pending",
      );

      for (const item of items) {
        const { productId, quantity, productPrice } = item;
        if (!productId || !quantity || !productPrice) continue;
        await OrderItem.createOrderItem(
          orderId,
          productId,
          quantity,
          productPrice,
        );
      }

      const orderItems = await OrderItem.getOrderItemsByOrderId(orderId);

      res.status(201).json({
        orderId,
        userId: orderUserId,
        customerName,
        email,
        phoneNumber,
        postalCode,
        address,
        message,
        totalAmount,
        status: status || "Pending",
        items: orderItems,
      });

      if (email) {
        try {
          await sendMail(
            email,
            `Rendelése a következő azonosítóval: ${orderId} sikeresen létrehozva. Fizetendő: ${totalAmount}.`,
          );
          console.log("Email sent to:", email);
        } catch (mailErr) {
          console.error("Email sending failed:", mailErr);
        }
      }
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: "Error creating order" });
    }
  },
);

router.get(
  "/orders",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await Order.getOrders();
      res.json(orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: "Error fetching orders" });
    }
  },
);

router.get(
  "/orders/:orderId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(String(req.params.orderId));
      if (isNaN(orderId)) {
        res.status(400).json({ message: "Invalid orderId" });
        return;
      }

      const user = req.user as { userId: number; role: string } | undefined;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const order = await Order.getOrderByOrderId(orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      if (order.userId !== user.userId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const items = await OrderItem.getOrderItemsByOrderId(orderId);
      res.json({ ...order, items });
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({ message: "Error fetching order" });
    }
  },
);

router.put("/orders/:orderId/status", auth, isAdmin, async (req, res) => {
  try {
    const orderId = parseInt(String(req.params.orderId));
    const { status } = req.body;

    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid orderId" });
    if (!status) return res.status(400).json({ message: "Status is required" });

    const existing = await Order.getOrderByOrderId(orderId);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    await Order.updateOrderStatus(orderId, status);
    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Error updating order status" });
  }
});

router.delete(
  "/orders/:orderId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(String(req.params.orderId));
      if (isNaN(orderId)) {
        res.status(400).json({ message: "Invalid orderId" });
        return;
      }

      const existing = await Order.getOrderByOrderId(orderId);
      if (!existing) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      await Order.deleteOrder(orderId);
      res.json({ message: "Order deleted" });
    } catch (err) {
      console.error("Error deleting order:", err);
      res.status(500).json({ message: "Error deleting order" });
    }
  },
);

router.get(
  "/orders/user/:userId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(String(req.params.userId));
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid userId" });
        return;
      }

      const result = await Order.getOrdersByUserId(userId);
      res.json(result);
    } catch (err) {
      console.error("Error fetching orders by userId:", err);
      res.status(500).json({ message: "Error fetching orders by userId" });
    }
  },
);

export default router;
