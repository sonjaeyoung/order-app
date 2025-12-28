import express from 'express';
import {
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  receiveOrder
} from '../controllers/orderController.js';
import {
  getAllInventory,
  increaseInventory,
  decreaseInventory,
  updateInventory
} from '../controllers/inventoryController.js';
import { getOrderStats } from '../controllers/dashboardController.js';

const router = express.Router();

// 관리자 메뉴 관리
router.post('/menus', createMenu);
router.put('/menus/:id', updateMenu);
router.delete('/menus/:id', deleteMenu);

// 관리자 주문 관리
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/receive', receiveOrder);

// 관리자 재고 관리
router.get('/inventory', getAllInventory);
router.patch('/inventory/:menuId/increase', increaseInventory);
router.patch('/inventory/:menuId/decrease', decreaseInventory);
router.put('/inventory/:menuId', updateInventory);

// 관리자 대시보드
router.get('/dashboard/stats', getOrderStats);

export default router;

