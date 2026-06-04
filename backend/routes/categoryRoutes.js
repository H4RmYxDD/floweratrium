import express from 'express';
import auth from '../middleware/auth.js';
import * as Category from '../data/category.js';
import isAdmin from '../middleware/checkAdmin.js';

const router = express.Router();
router.get('/categories', async (req, res) => {
    const categories = await Category.getCategories();
    return res.json(categories);
});

router.get('/categories/:categoryId', async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) return res.status(400).json({ message: 'Invalid categoryId' });
    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json(category);
});

router.post('/categories', auth, isAdmin, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const categoryId = await Category.createCategory(name);
    return res.status(201).json({ categoryId, name });
});

router.put('/categories/:categoryId', auth, isAdmin, async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) return res.status(400).json({ message: 'Invalid categoryId' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await Category.updateCategory(categoryId, name);
    return res.json({ categoryId, name });
});

router.delete('/categories/:categoryId', auth, isAdmin, async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) return res.status(400).json({ message: 'Invalid categoryId' });
    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await Category.deleteCategory(categoryId);
    return res.json({ message: 'Category deleted successfully' });
});
export default router;
