import pool from '../config/database.js';
import { validateInventoryUpdate } from '../utils/validators.js';

/**
 * 모든 메뉴의 재고 정보 조회
 */
export async function getAllInventory(req, res, next) {
  try {
    const query = `
      SELECT 
        i.menu_id as "menuId",
        m.name as "menuName",
        i.current_stock as "currentStock",
        i.unit,
        i.updated_at as "updatedAt"
      FROM inventory i
      INNER JOIN menus m ON i.menu_id = m.id
      ORDER BY m.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 재고 수량 증가
 */
export async function increaseInventory(req, res, next) {
  try {
    const { menuId } = req.params;
    const { amount = 1 } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '증가량은 0보다 큰 숫자여야 합니다.'
        }
      });
    }
    
    // 재고 존재 확인
    const checkQuery = 'SELECT menu_id, current_stock FROM inventory WHERE menu_id = $1';
    const checkResult = await pool.query(checkQuery, [menuId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '재고 정보를 찾을 수 없습니다.'
        }
      });
    }
    
    // 재고 증가
    const updateQuery = `
      UPDATE inventory 
      SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP
      WHERE menu_id = $2
      RETURNING menu_id as "menuId", current_stock as "currentStock", updated_at as "updatedAt"
    `;
    const result = await pool.query(updateQuery, [amount, menuId]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 재고 수량 감소
 */
export async function decreaseInventory(req, res, next) {
  try {
    const { menuId } = req.params;
    const { amount = 1 } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '감소량은 0보다 큰 숫자여야 합니다.'
        }
      });
    }
    
    // 재고 존재 및 수량 확인
    const checkQuery = 'SELECT menu_id, current_stock FROM inventory WHERE menu_id = $1';
    const checkResult = await pool.query(checkQuery, [menuId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '재고 정보를 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStock = checkResult.rows[0]?.current_stock || 0;
    
    if (currentStock < amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `재고가 부족합니다. (현재: ${currentStock}개, 요청: ${amount}개)`
        }
      });
    }
    
    // 재고 감소
    const updateQuery = `
      UPDATE inventory 
      SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP
      WHERE menu_id = $2
      RETURNING menu_id as "menuId", current_stock as "currentStock", updated_at as "updatedAt"
    `;
    const result = await pool.query(updateQuery, [amount, menuId]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 재고 수량 직접 수정
 */
export async function updateInventory(req, res, next) {
  try {
    const { menuId } = req.params;
    const validation = validateInventoryUpdate(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      });
    }
    
    const { currentStock } = req.body;
    
    // 재고 존재 확인
    const checkQuery = 'SELECT menu_id FROM inventory WHERE menu_id = $1';
    const checkResult = await pool.query(checkQuery, [menuId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '재고 정보를 찾을 수 없습니다.'
        }
      });
    }
    
    // 재고 수정
    const updateQuery = `
      UPDATE inventory 
      SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
      WHERE menu_id = $2
      RETURNING menu_id as "menuId", current_stock as "currentStock", updated_at as "updatedAt"
    `;
    const result = await pool.query(updateQuery, [currentStock, menuId]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

