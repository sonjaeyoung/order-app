/**
 * 입력 데이터 검증 유틸리티
 */

export function validateMenu(data) {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('메뉴명은 필수입니다.');
  } else if (data.name.length > 100) {
    errors.push('메뉴명은 100자 이하여야 합니다.');
  }
  
  if (data.price === undefined || data.price === null) {
    errors.push('가격은 필수입니다.');
  } else if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('가격은 0 이상의 숫자여야 합니다.');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('설명은 500자 이하여야 합니다.');
  }
  
  if (data.imageUrl && typeof data.imageUrl !== 'string') {
    errors.push('이미지 URL은 문자열이어야 합니다.');
  }
  
  if (data.options && !Array.isArray(data.options)) {
    errors.push('옵션은 배열이어야 합니다.');
  } else if (data.options) {
    data.options.forEach((option, index) => {
      if (!option.name || typeof option.name !== 'string') {
        errors.push(`옵션 ${index + 1}의 이름은 필수입니다.`);
      }
      if (option.additionalPrice === undefined || option.additionalPrice === null) {
        errors.push(`옵션 ${index + 1}의 추가 가격은 필수입니다.`);
      } else if (typeof option.additionalPrice !== 'number' || option.additionalPrice < 0) {
        errors.push(`옵션 ${index + 1}의 추가 가격은 0 이상의 숫자여야 합니다.`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateOrder(data) {
  const errors = [];
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('주문 아이템은 최소 1개 이상이어야 합니다.');
  } else {
    data.items.forEach((item, index) => {
      if (!item.menuId || typeof item.menuId !== 'number') {
        errors.push(`아이템 ${index + 1}의 메뉴 ID는 필수입니다.`);
      }
      if (!item.menuName || typeof item.menuName !== 'string') {
        errors.push(`아이템 ${index + 1}의 메뉴명은 필수입니다.`);
      }
      if (item.basePrice === undefined || typeof item.basePrice !== 'number' || item.basePrice < 0) {
        errors.push(`아이템 ${index + 1}의 기본 가격은 0 이상의 숫자여야 합니다.`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`아이템 ${index + 1}의 수량은 1 이상의 숫자여야 합니다.`);
      }
      if (item.totalPrice === undefined || typeof item.totalPrice !== 'number' || item.totalPrice < 0) {
        errors.push(`아이템 ${index + 1}의 총 가격은 0 이상의 숫자여야 합니다.`);
      }
      if (item.selectedOptions && !Array.isArray(item.selectedOptions)) {
        errors.push(`아이템 ${index + 1}의 선택 옵션은 배열이어야 합니다.`);
      }
    });
  }
  
  if (data.totalAmount === undefined || data.totalAmount === null) {
    errors.push('총 금액은 필수입니다.');
  } else if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    errors.push('총 금액은 0 이상의 숫자여야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateInventoryUpdate(data) {
  const errors = [];
  
  if (data.currentStock === undefined || data.currentStock === null) {
    errors.push('재고 수량은 필수입니다.');
  } else if (typeof data.currentStock !== 'number' || data.currentStock < 0) {
    errors.push('재고 수량은 0 이상의 숫자여야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateOrderStatus(status) {
  const validStatuses = ['received', 'preparing', 'completed', 'cancelled'];
  return validStatuses.includes(status);
}

export function validateStatusTransition(currentStatus, newStatus) {
  // received -> preparing -> completed
  // cancelled 상태는 어느 상태에서든 가능 (취소는 항상 가능)
  const validTransitions = {
    'received': ['preparing', 'cancelled'],
    'preparing': ['completed', 'cancelled'],
    'completed': ['cancelled'], // 완료된 주문도 취소 가능 (환불 등)
    'cancelled': [] // 취소된 주문은 더 이상 변경 불가
  };
  
  // cancelled로의 전환은 항상 허용
  if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
    return true;
  }
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

