import express from 'express';
import menuRoutes from './menus.js';
import orderRoutes from './orders.js';
import adminRoutes from './admin.js';

const router = express.Router();

// 메뉴 라우트
router.use('/menus', menuRoutes);

// 주문 라우트
router.use('/orders', orderRoutes);

// 관리자 라우트
router.use('/admin', adminRoutes);

export default router;



