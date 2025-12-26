import { useState } from 'react';
import './InventoryStatus.css';

function InventoryStatus({ inventory, menus, onInventoryChange, onAddMenu, onDeleteMenu }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    description: '간단한 설명...'
  });
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

  const handleAddMenuSubmit = (e) => {
    e.preventDefault();
    if (!newMenu.name.trim() || !newMenu.price) {
      return;
    }

    const price = parseInt(newMenu.price);
    if (isNaN(price) || price < 0) {
      return;
    }

    if (price === 0) {
      if (!window.confirm('가격이 0원입니다. 계속하시겠습니까?')) {
        return;
      }
    }

    const menuData = {
      name: newMenu.name.trim(),
      price: price,
      description: newMenu.description.trim() || '간단한 설명...',
      imageUrl: '',
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    };

    onAddMenu(menuData);
    setNewMenu({ name: '', price: '', description: '간단한 설명...' });
    setShowAddForm(false);
  };

  const handleDelete = (menuId) => {
    onDeleteMenu(menuId);
  };

  // 재고 현황에 모든 메뉴가 표시되도록 동기화
  const syncedInventory = menus.map(menu => {
    const invItem = inventory.find(inv => inv.menuId === menu.id);
    return invItem || {
      menuId: menu.id,
      menuName: menu.name,
      stock: 0
    };
  });

  return (
    <div className="inventory-status">
      <div className="inventory-header">
        <h2 className="inventory-title">재고 현황</h2>
        <button
          className="add-menu-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-label="메뉴 추가"
        >
          {showAddForm ? '취소' : '+ 메뉴 추가'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-menu-form" onSubmit={handleAddMenuSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="메뉴명"
              value={newMenu.name}
              onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder="가격"
              value={newMenu.price}
              onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
              required
              min="0"
              className="form-input"
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="설명 (선택)"
              value={newMenu.description}
              onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
              className="form-input"
            />
            <button type="submit" className="form-submit-btn">
              추가
            </button>
          </div>
        </form>
      )}

      {syncedInventory.length === 0 ? (
        <div className="inventory-empty">등록된 메뉴가 없습니다.</div>
      ) : (
        <div className="inventory-cards">
          {syncedInventory.map((item) => {
            const status = getStatus(item.stock);
            return (
              <div key={item.menuId} className="inventory-card">
                <div className="inventory-card-header">
                  <div className="inventory-menu-name">{item.menuName}</div>
                  <button
                    className="inventory-btn delete-btn"
                    onClick={() => handleDelete(item.menuId)}
                    aria-label="메뉴 삭제"
                    title="메뉴 삭제"
                  >
                    ✕
                  </button>
                </div>
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
                  <span className="inventory-quantity">{item.stock}</span>
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
      )}
    </div>
  );
}

export default InventoryStatus;

