import './InventoryStatus.css';

function InventoryStatus({ inventory, onInventoryChange }) {
  const getStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-out' };
    if (stock < 5) return { text: '주의', className: 'status-warning' };
    return { text: '정상', className: 'status-normal' };
  };

  const handleIncrease = (menuId) => {
    onInventoryChange(menuId, 1);
  };

  const handleDecrease = (menuId) => {
    onInventoryChange(menuId, -1);
  };

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-cards">
        {inventory.map((item) => {
          const status = getStatus(item.stock);
          return (
            <div key={item.menuId} className="inventory-card">
              <div className="inventory-menu-name">{item.menuName}</div>
              <div className="inventory-stock-info">
                <span className="inventory-stock">{item.stock}개</span>
                <span className={`inventory-status-badge ${status.className}`}>
                  {status.text}
                </span>
              </div>
              <div className="inventory-controls">
                <button
                  className="inventory-btn decrease-btn"
                  onClick={() => handleDecrease(item.menuId)}
                  aria-label="재고 감소"
                >
                  -
                </button>
                <button
                  className="inventory-btn increase-btn"
                  onClick={() => handleIncrease(item.menuId)}
                  aria-label="재고 증가"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InventoryStatus;

