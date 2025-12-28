import pool from '../config/database.js';
import { validateOrder, validateOrderStatus, validateStatusTransition } from '../utils/validators.js';
import { generateOrderNumberWithCount } from '../utils/orderNumberGenerator.js';

/**
 * 새 주문 생성
 */
export async function createOrder(req, res, next) {
  try {
    const validation = validateOrder(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      });
    }
    
    const { items, totalAmount } = req.body;
    
    // 총 금액 검증
    const calculatedTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (Math.abs(calculatedTotal - totalAmount) > 1) { // 1원 오차 허용
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '총 금액이 일치하지 않습니다.'
        }
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 주문 번호 생성
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const orderNumber = await generateOrderNumberWithCount(client, dateStr);
      
      // 메뉴 존재 및 재고 확인 (주문 생성 시에는 재고만 확인, 실제 차감은 제조 시작 시)
      for (const item of items) {
        // 메뉴 존재 확인
        const menuQuery = 'SELECT id, name FROM menus WHERE id = $1';
        const menuResult = await client.query(menuQuery, [item.menuId]);
        
        if (menuResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `메뉴 ID ${item.menuId}를 찾을 수 없습니다.`
            }
          });
        }
        
        // 재고 확인
        const stockQuery = 'SELECT current_stock FROM inventory WHERE menu_id = $1';
        const stockResult = await client.query(stockQuery, [item.menuId]);
        
        if (stockResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${item.menuName}에 대한 재고 정보를 찾을 수 없습니다.`
            }
          });
        }
        
        const currentStock = stockResult.rows[0].current_stock;
        if (currentStock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `${item.menuName}의 재고가 부족합니다. (현재: ${currentStock}개, 요청: ${item.quantity}개)`
            }
          });
        }
      }
      
      // 주문 생성
      const orderQuery = `
        INSERT INTO orders (order_number, total_amount, status)
        VALUES ($1, $2, 'received')
        RETURNING id, order_number as "orderNumber", total_amount as "totalAmount",
                  status, created_at as "createdAt", updated_at as "updatedAt"
      `;
      const orderResult = await client.query(orderQuery, [orderNumber, totalAmount]);
      const order = orderResult.rows[0];
      
      // 주문 아이템 및 옵션 저장
      order.items = [];
      
      for (const item of items) {
        // 주문 아이템 삽입
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_id, menu_name, base_price, quantity, item_total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, menu_id as "menuId", menu_name as "menuName", base_price as "basePrice",
                    quantity, item_total_price as "totalPrice"
        `;
        const itemResult = await client.query(itemQuery, [
          order.id,
          item.menuId,
          item.menuName,
          item.basePrice,
          item.quantity,
          item.totalPrice
        ]);
        const orderItem = itemResult.rows[0];
        
        // 옵션 저장
        orderItem.selectedOptions = [];
        if (item.selectedOptions && Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0) {
          for (const option of item.selectedOptions) {
            if (option && option.optionId && option.optionName !== undefined) {
              const optionQuery = `
                INSERT INTO order_item_options (order_item_id, option_id, option_name, additional_price)
                VALUES ($1, $2, $3, $4)
                RETURNING option_id as "optionId", option_name as "optionName", additional_price as "additionalPrice"
              `;
              const optionResult = await client.query(optionQuery, [
                orderItem.id,
                option.optionId,
                option.optionName,
                option.additionalPrice || 0
              ]);
              if (optionResult.rows.length > 0) {
                orderItem.selectedOptions.push(optionResult.rows[0]);
              }
            }
          }
        }
        
        order.items.push(orderItem);
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 모든 주문 목록 조회 (관리자)
 */
export async function getAllOrders(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.total_amount as "totalAmount",
        o.status,
        o.created_at as "createdAt",
        o.updated_at as "updatedAt"
      FROM orders o
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND o.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (startDate) {
      query += ` AND o.created_at >= $${paramCount++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND o.created_at <= $${paramCount++}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const ordersResult = await pool.query(query, params);
    const orders = ordersResult.rows;
    
    // 각 주문의 아이템 조회
    for (const order of orders) {
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.menu_id as "menuId",
          oi.menu_name as "menuName",
          oi.base_price as "basePrice",
          oi.quantity,
          oi.item_total_price as "totalPrice"
        FROM order_items oi
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `;
      const itemsResult = await pool.query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
      
      // 각 아이템의 옵션 조회
      for (const item of order.items) {
        const optionsQuery = `
          SELECT 
            option_id as "optionId",
            option_name as "optionName",
            additional_price as "additionalPrice"
          FROM order_item_options
          WHERE order_item_id = $1
        `;
        const optionsResult = await pool.query(optionsQuery, [item.id]);
        item.selectedOptions = optionsResult.rows || [];
      }
    }
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 주문 상세 조회 (관리자)
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    
    const orderQuery = `
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.total_amount as "totalAmount",
        o.status,
        o.created_at as "createdAt",
        o.updated_at as "updatedAt"
      FROM orders o
      WHERE o.id = $1
    `;
    const orderResult = await pool.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const order = orderResult.rows[0];
    
    // 아이템 조회
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.menu_id as "menuId",
        oi.menu_name as "menuName",
        oi.base_price as "basePrice",
        oi.quantity,
        oi.item_total_price as "totalPrice"
      FROM order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);
    order.items = itemsResult.rows;
    
    // 각 아이템의 옵션 조회
    for (const item of order.items) {
      const optionsQuery = `
        SELECT 
          option_id as "optionId",
          option_name as "optionName",
          additional_price as "additionalPrice"
        FROM order_item_options
        WHERE order_item_id = $1
      `;
      const optionsResult = await pool.query(optionsQuery, [item.id]);
      item.selectedOptions = optionsResult.rows;
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 주문 상태 변경 (관리자)
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !validateOrderStatus(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '유효하지 않은 주문 상태입니다.'
        }
      });
    }
    
    // 주문 조회
    const orderQuery = 'SELECT id, status FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStatus = orderResult.rows[0].status;
    
    // 상태 전환 검증
    if (!validateStatusTransition(currentStatus, status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `'${currentStatus}' 상태에서 '${status}' 상태로 변경할 수 없습니다.`
        }
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 제조 시작 시 재고 차감
      if (currentStatus === 'received' && status === 'preparing') {
        // 주문 아이템 조회 (메뉴명 포함)
        const itemsQuery = `
          SELECT oi.menu_id, oi.quantity, oi.menu_name
          FROM order_items oi
          WHERE oi.order_id = $1
        `;
        const itemsResult = await client.query(itemsQuery, [id]);
        
        if (itemsResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_ORDER',
              message: '주문에 아이템이 없습니다.'
            }
          });
        }
        
        // 각 메뉴의 재고 확인 및 차감
        const stockIssues = [];
        for (const item of itemsResult.rows) {
          const stockQuery = 'SELECT current_stock FROM inventory WHERE menu_id = $1';
          const stockResult = await client.query(stockQuery, [item.menu_id]);
          
          if (stockResult.rows.length === 0) {
            stockIssues.push(`${item.menu_name} (재고 정보 없음)`);
            continue;
          }
          
          const currentStock = stockResult.rows[0].current_stock;
          if (currentStock < item.quantity) {
            stockIssues.push(`${item.menu_name} (재고: ${currentStock}개, 필요: ${item.quantity}개)`);
            continue;
          }
          
          // 재고 차감
          await client.query(
            'UPDATE inventory SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE menu_id = $2',
            [item.quantity, item.menu_id]
          );
        }
        
        if (stockIssues.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `재고가 부족합니다: ${stockIssues.join(', ')}`
            }
          });
        }
      }
      
      // 주문 상태 업데이트
      const updateQuery = `
        UPDATE orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, status, updated_at as "updatedAt"
      `;
      const updateResult = await client.query(updateQuery, [status, id]);
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        data: updateResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 주문 접수 (관리자) - received 상태로 변경
 */
export async function receiveOrder(req, res, next) {
  req.body = { status: 'received' };
  return updateOrderStatus(req, res, next);
}

