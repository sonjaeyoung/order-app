import express from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController.js';

const router = express.Router();

// 공개 API
router.get('/', getAllMenus);
router.get('/:id', getMenuById);

export default router;

