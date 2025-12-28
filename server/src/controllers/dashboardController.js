import pool from '../config/database.js';

/**
 * 주문 통계 조회
 */
export async function getOrderStats(req, res, next) {
  try {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('received', 'preparing', 'completed', 'cancelled')) as "totalOrders",
        COUNT(*) FILTER (WHERE status = 'received') as "receivedOrders",
        COUNT(*) FILTER (WHERE status = 'preparing') as "preparingOrders",
        COUNT(*) FILTER (WHERE status = 'completed') as "completedOrders"
      FROM orders
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0] || {};
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(stats.totalOrders || 0) || 0,
        receivedOrders: parseInt(stats.receivedOrders || 0) || 0,
        preparingOrders: parseInt(stats.preparingOrders || 0) || 0,
        completedOrders: parseInt(stats.completedOrders || 0) || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

