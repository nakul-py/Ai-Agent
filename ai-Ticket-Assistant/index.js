import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import user from './models/user';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('MongoDB connected successfully ✅');
    app.listen(PORT, () => console.log(`Server is running on port ${process.env.PORT || 3000} 🚀`));
})
.catch((err) => console.error('❗❗MongoDB connection error :', err));