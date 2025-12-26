import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

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
    const selectedOptionsData = menu.options.filter(opt => selectedOptions.includes(opt.id));
    onAddToCart(menu, selectedOptionsData);
    setSelectedOptions([]);
  };

  const calculatePrice = () => {
    const basePrice = menu.price;
    const optionsPrice = menu.options
      .filter(opt => selectedOptions.includes(opt.id))
      .reduce((sum, opt) => sum + opt.additionalPrice, 0);
    return basePrice + optionsPrice;
  };

  return (
    <div className="menu-card">
      <div className="menu-image">
        <div className="image-placeholder">이미지</div>
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-checkbox">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
              />
              <span>
                {option.name} {option.additionalPrice > 0 ? `(+${option.additionalPrice.toLocaleString()}원)` : '(+0원)'}
              </span>
            </label>
          ))}
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  );
}

export default MenuCard;

