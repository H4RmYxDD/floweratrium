import express, { Request, Response } from "express";
import * as OrderItem from '../data/orderItem.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/order-items/:orderId', auth, async (req: Request, res: Response): Promise<void> => {
    const orderId = parseInt(String(req.params.orderId));
    if (isNaN(orderId)){
            res.status(400).json({ message: 'Invalid orderId' });
            return;
    }

    const items = await OrderItem.getOrderItemsByOrderId(orderId);
    res.json(items);
});

export default router;
