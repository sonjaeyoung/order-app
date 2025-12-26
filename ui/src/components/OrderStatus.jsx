import { useMemo, useState } from 'react';
import './OrderStatus.css';

function OrderStatus({ orders, onOrderStatusChange }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const formatOrderItems = (items) => {
    return items.map(item => {
      const optionsText = item.selectedOptions.length > 0
        ? ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
        : '';
      return `${item.menuName}${optionsText} x ${item.quantity}`;
    }).join(', ');
  };

  const handleStartPreparing = (orderId) => {
    onOrderStatusChange(orderId, 'preparing');
  };

  const handleComplete = (orderId) => {
    onOrderStatusChange(orderId, 'completed');
  };

  // 주문 목록 필터링 및 정렬 (최신순)
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;
    
    if (filterStatus !== 'all') {
      filtered = orders.filter(order => order.status === filterStatus);
    }
    
    // 최신순 정렬 (createdAt 기준 내림차순)
    return [...filtered].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders, filterStatus]);

  return (
    <div className="order-status">
      <div className="order-status-header">
        <h2 className="order-status-title">주문 현황</h2>
        <div className="order-filters">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
            aria-label="전체 주문 보기"
          >
            전체
          </button>
          <button
            className={`filter-btn ${filterStatus === 'received' ? 'active' : ''}`}
            onClick={() => setFilterStatus('received')}
            aria-label="주문 접수 보기"
          >
            주문 접수
          </button>
          <button
            className={`filter-btn ${filterStatus === 'preparing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('preparing')}
            aria-label="제조 중 보기"
          >
            제조 중
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
            aria-label="제조 완료 보기"
          >
            제조 완료
          </button>
        </div>
      </div>
      {filteredAndSortedOrders.length === 0 ? (
        <div className="order-empty">
          {orders.length === 0 ? '주문이 없습니다.' : '해당 상태의 주문이 없습니다.'}
        </div>
      ) : (
        <div className="order-list">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="order-item">
              <div className="order-info">
                <div className="order-time">{formatDate(order.createdAt)}</div>
                <div className="order-details">
                  <span className="order-menu">{formatOrderItems(order.items)}</span>
                  <span className="order-price">{order.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
              {order.status === 'received' && (
                <button
                  className="order-action-btn"
                  onClick={() => handleStartPreparing(order.id)}
                >
                  제조 시작
                </button>
              )}
              {order.status === 'preparing' && (
                <div className="order-actions">
                  <span className="order-status-badge preparing">제조 중</span>
                  <button
                    className="order-action-btn complete-btn"
                    onClick={() => handleComplete(order.id)}
                  >
                    제조 완료
                  </button>
                </div>
              )}
              {order.status === 'completed' && (
                <span className="order-status-badge completed">제조 완료</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderStatus;

