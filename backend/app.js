import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/images', express.static('images'));

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', orderItemRoutes);
app.use('/api', messageRoutes);
app.use("/api", reportRoutes);
app.use("/api", imageRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
