import express from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";

import * as Order from "../data/order.js";
import * as OrderItem from "../data/orderItem.js";
import * as Category from "../data/category.js";

const router = express.Router();

router.get("/reports/revenue/daily", auth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.getOrders();
        const result = [];

        for (const o of orders) {
            const date = new Date(o.orderDate).toISOString().split("T")[0];
            const amount = o.totalAmount || 0;

            let existing = result.find(x => x.date === date);

            if (existing) {
                existing.revenue += amount;
            } else {
                result.push({
                    date,
                    revenue: amount
                });
            }
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba napi bevételnél" });
    }
});



router.get("/reports/revenue/weekly", auth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.getOrders();
        const result = [];

        for (const o of orders) {
            const date = new Date(o.orderDate);
            const week = getWeekNumber(date);
            const key = `${date.getFullYear()}-W${week}`;
            const amount = o.totalAmount || 0;

            let existing = result.find(x => x.week === key);

            if (existing) {
                existing.revenue += amount;
            } else {
                result.push({
                    week: key,
                    revenue: amount
                });
            }
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba heti bevételnél" });
    }
});



router.get("/reports/revenue/monthly", auth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.getOrders();
        const result = [];

        for (const o of orders) {
            const date = new Date(o.orderDate);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const amount = o.totalAmount || 0;

            let existing = result.find(x => x.month === key);

            if (existing) {
                existing.revenue += amount;
            } else {
                result.push({
                    month: key,
                    revenue: amount
                });
            }
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba havi bevételnél" });
    }
});



router.get("/reports/top-products-by-category", auth, isAdmin, async (req, res) => {
    try {
        const categories = await Category.getCategories();
        const items = await OrderItem.getAllOrderItemsWithProduct();

        const result = [];

        for (const item of items) {
            const categoryId = item.categoryId;
            const productId = item.productId;
            const name = item.name;
            const quantity = item.quantity || 0;

            let category = result.find(x => x.categoryId === categoryId);

            if (!category) {
                const categoryName =
                    categories.find(c => c.categoryId === categoryId)?.name
                    || "Ismeretlen kategória";

                category = {
                    categoryId,
                    categoryName,
                    products: []
                };

                result.push(category);
            }

            let product = category.products.find(p => p.productId === productId);

            if (product) {
                product.totalSold += quantity;
            } else {
                category.products.push({
                    productId,
                    productName: name,
                    totalSold: quantity
                });
            }
        }

        for (const cat of result) {
            cat.products.sort((a, b) => b.totalSold - a.totalSold);
            cat.products = cat.products.slice(0, 5);
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba top termékeknél" });
    }
});


function getWeekNumber(date) {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

export default router;