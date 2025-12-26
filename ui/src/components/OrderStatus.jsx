import './OrderStatus.css';

function OrderStatus({ orders, onOrderStatusChange }) {
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

  return (
    <div className="order-status">
      <h2 className="order-status-title">주문 현황</h2>
      {orders.length === 0 ? (
        <div className="order-empty">주문이 없습니다.</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
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

