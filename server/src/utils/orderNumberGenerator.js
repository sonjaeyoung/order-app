/**
 * 주문 번호 생성기
 * 형식: ORD-YYYYMMDD-XXX (예: ORD-20240101-001)
 */
export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // 시퀀스 번호는 데이터베이스에서 가져오거나 랜덤으로 생성
  // 간단하게 타임스탬프의 마지막 3자리 사용
  const sequence = String(now.getTime()).slice(-3).padStart(3, '0');
  
  return `ORD-${dateStr}-${sequence}`;
}

/**
 * 더 정확한 주문 번호 생성 (데이터베이스의 주문 수 기반)
 */
export async function generateOrderNumberWithCount(client, dateStr) {
  const query = `
    SELECT COUNT(*) as count 
    FROM orders 
    WHERE order_number LIKE $1
  `;
  
  const pattern = `ORD-${dateStr}-%`;
  const result = await client.query(query, [pattern]);
  const count = parseInt(result.rows[0]?.count || 0) + 1;
  const sequence = String(count).padStart(3, '0');
  
  return `ORD-${dateStr}-${sequence}`;
}

