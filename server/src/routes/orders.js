import express from 'express';
import { createOrder } from '../controllers/orderController.js';

const router = express.Router();

// 공개 API
router.post('/', createOrder);

export default router;

