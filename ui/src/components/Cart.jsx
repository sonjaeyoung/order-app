import { useMemo } from 'react';
import './Cart.css';

function Cart({ cartItems, onOrder, onQuantityChange, onRemoveItem }) {
  const calculateTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const formatItemName = (item) => {
    const options = item.selectedOptions || [];
    if (options.length > 0) {
      const optionsText = options
        .filter(opt => opt && (opt.optionName || opt.name))
        .map(opt => opt.optionName || opt.name)
        .join(', ');
      if (optionsText) {
        return `${item.menuName} (${optionsText})`;
      }
    }
    return item.menuName;
  };

  const handleIncrease = (itemId) => {
    onQuantityChange(itemId, 1);
  };

  const handleDecrease = (itemId) => {
    onQuantityChange(itemId, -1);
  };

  const handleRemove = (itemId) => {
    onRemoveItem(itemId);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <h2 className="cart-title">장바구니</h2>
        <div className="cart-empty">장바구니가 비어있습니다.</div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-content">
        <div className="cart-left">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">
                    {formatItemName(item)}
                  </span>
                  <div className="cart-item-details">
                    <span className="cart-item-price">{item.totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="cart-item-controls">
                  <button 
                    className="quantity-btn decrease-btn" 
                    onClick={() => handleDecrease(item.id)}
                    aria-label="수량 감소"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display" aria-label={`수량: ${item.quantity}`}>{item.quantity}</span>
                  <button 
                    className="quantity-btn increase-btn" 
                    onClick={() => handleIncrease(item.id)}
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                  <button 
                    className="remove-btn" 
                    onClick={() => handleRemove(item.id)}
                    aria-label="아이템 삭제"
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cart-right">
          <div className="cart-summary">
            <div className="cart-total">
              <span className="total-label">총 금액</span>
              <span className="total-amount">{calculateTotal.toLocaleString()}원</span>
            </div>
            <button className="order-btn" onClick={onOrder}>
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

