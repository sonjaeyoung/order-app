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

  // 이미지 경로 처리
  // 데이터베이스에 전체 경로로 저장되므로 그대로 사용
  const getImageUrl = () => {
    if (!menu.imageUrl || menu.imageUrl.trim() === '') {
      return null;
    }
    
    // 외부 URL인 경우 그대로 사용
    if (menu.imageUrl.startsWith('http://') || menu.imageUrl.startsWith('https://')) {
      return menu.imageUrl;
    }
    
    // 전체 경로로 저장되어 있으므로 그대로 사용
    // /images/로 시작하는 경로는 public 폴더 기준으로 자동 처리됨
    return menu.imageUrl;
  };

  const imageUrl = getImageUrl();

  return (
    <div className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="menu-image">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={menu.name}
            className="menu-image-img"
            onError={(e) => {
              // 이미지 로딩 실패 시 placeholder 표시
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
          이미지
        </div>
        {isOutOfStock && <div className="stock-overlay">품절</div>}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        {!isOutOfStock && inventoryStock < 5 && (
          <p className="stock-warning">재고 부족 (남은 수량: {inventoryStock}개)</p>
        )}
        <p className="menu-description">{menu.description}</p>
        {menu.options && menu.options.length > 0 && (
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
        )}
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

