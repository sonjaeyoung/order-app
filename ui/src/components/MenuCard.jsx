import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart, inventoryStock = 0 }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const isOutOfStock = inventoryStock <= 0;

  const handleOptionChange = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }
    const selectedOptionsData = menu.options.filter(opt => selectedOptions.includes(opt.id));
    onAddToCart(menu, selectedOptionsData);
    setSelectedOptions([]);
  };

  return (
    <div className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="menu-image">
        <div className="image-placeholder">이미지</div>
        {isOutOfStock && <div className="stock-overlay">품절</div>}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        {!isOutOfStock && inventoryStock < 5 && (
          <p className="stock-warning">재고 부족 (남은 수량: {inventoryStock}개)</p>
        )}
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-checkbox">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
                disabled={isOutOfStock}
                aria-label={`${option.name} 옵션 선택`}
              />
              <span>
                {option.name} {option.additionalPrice > 0 ? `(+${option.additionalPrice.toLocaleString()}원)` : '(+0원)'}
              </span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={`${menu.name} 장바구니에 담기`}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  );
}

export default MenuCard;

