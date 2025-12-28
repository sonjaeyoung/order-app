const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * API 요청 헬퍼 함수
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeout = 30000; // 30초 타임아웃
  
  // 타임아웃 컨트롤러 생성
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    signal: controller.signal,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId); // 타임아웃 취소
    
    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || '서버에서 오류가 발생했습니다.');
    }

    if (!response.ok) {
      const errorMessage = data.error?.message || `요청에 실패했습니다. (${response.status})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data.error?.code;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId); // 에러 발생 시에도 타임아웃 취소
    
    // 네트워크 에러 처리
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    
    console.error('API Error:', {
      endpoint,
      error: error.message,
      status: error.status,
      code: error.code
    });
    
    throw error;
  }
}

/**
 * 메뉴 API
 */
export const menuAPI = {
  // 모든 메뉴 조회
  getAll: () => request('/menus'),
  
  // 특정 메뉴 조회
  getById: (id) => request(`/menus/${id}`),
  
  // 메뉴 추가 (관리자)
  create: (menuData) => request('/admin/menus', {
    method: 'POST',
    body: menuData,
  }),
  
  // 메뉴 수정 (관리자)
  update: (id, menuData) => request(`/admin/menus/${id}`, {
    method: 'PUT',
    body: menuData,
  }),
  
  // 메뉴 삭제 (관리자)
  delete: (id) => request(`/admin/menus/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * 주문 API
 */
export const orderAPI = {
  // 주문 생성
  create: (orderData) => request('/orders', {
    method: 'POST',
    body: orderData,
  }),
  
  // 모든 주문 조회 (관리자)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  // 특정 주문 조회 (관리자)
  getById: (id) => request(`/admin/orders/${id}`),
  
  // 주문 상태 변경 (관리자)
  updateStatus: (id, status) => request(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
  
  // 주문 접수 (관리자)
  receive: (id) => request(`/admin/orders/${id}/receive`, {
    method: 'PATCH',
  }),
};

/**
 * 재고 API
 */
export const inventoryAPI = {
  // 모든 재고 조회 (관리자)
  getAll: () => request('/admin/inventory'),
  
  // 재고 증가 (관리자)
  increase: (menuId, amount = 1) => request(`/admin/inventory/${menuId}/increase`, {
    method: 'PATCH',
    body: { amount },
  }),
  
  // 재고 감소 (관리자)
  decrease: (menuId, amount = 1) => request(`/admin/inventory/${menuId}/decrease`, {
    method: 'PATCH',
    body: { amount },
  }),
  
  // 재고 수정 (관리자)
  update: (menuId, currentStock) => request(`/admin/inventory/${menuId}`, {
    method: 'PUT',
    body: { currentStock },
  }),
};

/**
 * 대시보드 API
 */
export const dashboardAPI = {
  // 주문 통계 조회 (관리자)
  getStats: () => request('/admin/dashboard/stats'),
};

