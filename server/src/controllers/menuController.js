import pool from '../config/database.js';
import { validateMenu } from '../utils/validators.js';

/**
 * 이미지 URL 정규화 함수
 * 파일명만 입력된 경우 전체 경로로 변환
 */
function normalizeImageUrl(imageUrl) {
  // undefined, null, 빈 문자열 처리
  if (imageUrl === undefined || imageUrl === null || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
    return null;
  }
  
  const trimmed = String(imageUrl).trim();
  
  // 이미 전체 경로인 경우 (http://, https://, /images/로 시작)
  if (trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') || 
      trimmed.startsWith('/images/')) {
    return trimmed;
  }
  
  // 파일명만 입력한 경우 전체 경로로 변환
  return `/images/${trimmed}`;
}

/**
 * 모든 메뉴 목록 조회
 */
export async function getAllMenus(req, res, next) {
  try {
    const query = `
      SELECT 
        m.id,
        m.name,
        m.price,
        m.description,
        m.image_url as "imageUrl",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM menus m
      ORDER BY m.created_at DESC
    `;
    
    const menusResult = await pool.query(query);
    const menus = menusResult.rows;
    
    // 각 메뉴의 옵션 조회
    for (const menu of menus) {
      const optionsQuery = `
        SELECT 
          id,
          name,
          additional_price as "additionalPrice"
        FROM menu_options
        WHERE menu_id = $1
        ORDER BY id
      `;
      const optionsResult = await pool.query(optionsQuery, [menu.id]);
      menu.options = optionsResult.rows || [];
    }
    
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 메뉴 상세 조회
 */
export async function getMenuById(req, res, next) {
  try {
    const { id } = req.params;
    
    const menuQuery = `
      SELECT 
        m.id,
        m.name,
        m.price,
        m.description,
        m.image_url as "imageUrl",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM menus m
      WHERE m.id = $1
    `;
    
    const menuResult = await pool.query(menuQuery, [id]);
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    const menu = menuResult.rows[0];
    
    // 옵션 조회
    const optionsQuery = `
      SELECT 
        id,
        name,
        additional_price as "additionalPrice"
      FROM menu_options
      WHERE menu_id = $1
      ORDER BY id
    `;
    const optionsResult = await pool.query(optionsQuery, [id]);
    menu.options = optionsResult.rows;
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 새 메뉴 추가 (관리자)
 */
export async function createMenu(req, res, next) {
  try {
    const validation = validateMenu(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      });
    }
    
    const { name, price, description, imageUrl, options } = req.body;
    
    // 이미지 URL 정규화 (전체 경로로 변환)
    const normalizedImageUrl = normalizeImageUrl(imageUrl);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 메뉴 삽입
      const menuQuery = `
        INSERT INTO menus (name, price, description, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, price, description, image_url as "imageUrl", 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      const menuResult = await client.query(menuQuery, [name, price, description || null, normalizedImageUrl || null]);
      const menu = menuResult.rows[0];
      
      // 옵션 삽입
      if (options && Array.isArray(options) && options.length > 0) {
        for (const opt of options) {
          if (opt.name && opt.name.trim()) {
            await client.query(
              'INSERT INTO menu_options (menu_id, name, additional_price) VALUES ($1, $2, $3)',
              [menu.id, opt.name.trim(), opt.additionalPrice || 0]
            );
          }
        }
        
        // 옵션 조회
        const optionsResult = await client.query(
          'SELECT id, name, additional_price as "additionalPrice" FROM menu_options WHERE menu_id = $1 ORDER BY id',
          [menu.id]
        );
        menu.options = optionsResult.rows || [];
      } else {
        menu.options = [];
      }
      
      // 재고 초기화
      await client.query(
        'INSERT INTO inventory (menu_id, current_stock) VALUES ($1, 0)',
        [menu.id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: menu
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_MENU',
          message: '이미 존재하는 메뉴명입니다.'
        }
      });
    }
    next(error);
  }
}

/**
 * 메뉴 정보 수정 (관리자)
 */
export async function updateMenu(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, description, imageUrl } = req.body;
    
    // 메뉴 존재 확인
    const checkQuery = 'SELECT id FROM menus WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    // 업데이트할 필드만 구성
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (imageUrl !== undefined) {
      const normalizedUrl = normalizeImageUrl(imageUrl);
      // null이면 이미지 제거, 값이 있으면 업데이트
      updates.push(`image_url = $${paramCount++}`);
      values.push(normalizedUrl);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '수정할 필드가 없습니다.'
        }
      });
    }
    
    values.push(id);
    const updateQuery = `
      UPDATE menus 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, price, description, image_url as "imageUrl",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(updateQuery, values);
    const menu = result.rows[0];
    
    // 옵션 조회
    const optionsResult = await pool.query(
      'SELECT id, name, additional_price as "additionalPrice" FROM menu_options WHERE menu_id = $1 ORDER BY id',
      [id]
    );
    menu.options = optionsResult.rows;
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_MENU',
          message: '이미 존재하는 메뉴명입니다.'
        }
      });
    }
    next(error);
  }
}

/**
 * 메뉴 삭제 (관리자)
 */
export async function deleteMenu(req, res, next) {
  try {
    const { id } = req.params;
    
    // 메뉴 존재 확인
    const checkQuery = 'SELECT id FROM menus WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    // 주문에 포함된 메뉴인지 확인
    const orderCheckQuery = `
      SELECT COUNT(*) as count
      FROM order_items
      WHERE menu_id = $1
    `;
    const orderCheckResult = await pool.query(orderCheckQuery, [id]);
    
    if (parseInt(orderCheckResult.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'MENU_IN_USE',
          message: '주문에 포함된 메뉴는 삭제할 수 없습니다.'
        }
      });
    }
    
    // 메뉴 삭제 (CASCADE로 관련 데이터도 삭제됨)
    await pool.query('DELETE FROM menus WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: '메뉴가 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
}

