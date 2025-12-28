import { useState } from 'react';
import './InventoryStatus.css';

function InventoryStatus({ inventory, menus, onInventoryChange, onAddMenu, onDeleteMenu, onUpdateMenu }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    description: '간단한 설명...',
    imageUrl: ''
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

  // 이미지 경로를 전체 경로로 변환
  const formatImageUrl = (imageUrl) => {
    // 빈 문자열이나 공백만 있는 경우 빈 문자열 반환 (백엔드에서 null로 변환됨)
    if (!imageUrl || imageUrl.trim() === '') {
      return '';
    }
    
    const trimmed = imageUrl.trim();
    
    // 이미 전체 경로인 경우 (http://, https://, /images/로 시작)
    if (trimmed.startsWith('http://') || 
        trimmed.startsWith('https://') || 
        trimmed.startsWith('/images/')) {
      return trimmed;
    }
    
    // 파일명만 입력한 경우 전체 경로로 변환
    return `/images/${trimmed}`;
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
      imageUrl: formatImageUrl(newMenu.imageUrl),
      options: [
        { id: 1, name: '샷 추가', additionalPrice: 500 },
        { id: 2, name: '시럽 추가', additionalPrice: 0 }
      ]
    };

    onAddMenu(menuData);
    setNewMenu({ name: '', price: '', description: '간단한 설명...', imageUrl: '' });
    setShowAddForm(false);
  };

  const handleEditMenu = (menu) => {
    console.log('메뉴 수정 시작:', menu);
    setEditingMenuId(menu.id);
    // 이미지 URL에서 /images/ 접두사 제거하여 표시 (사용자가 파일명만 보도록)
    let displayImageUrl = menu.imageUrl || '';
    if (displayImageUrl && displayImageUrl.startsWith('/images/')) {
      displayImageUrl = displayImageUrl.replace('/images/', '');
    }
    setNewMenu({
      name: menu.name,
      price: menu.price.toString(),
      description: menu.description || '간단한 설명...',
      imageUrl: displayImageUrl
    });
    setShowAddForm(true);
  };

  const handleUpdateMenuSubmit = async (e) => {
    e.preventDefault();
    if (!newMenu.name.trim() || !newMenu.price) {
      return;
    }

    const price = parseInt(newMenu.price);
    if (isNaN(price) || price < 0) {
      return;
    }

    const formattedImageUrl = formatImageUrl(newMenu.imageUrl);
    const menuData = {
      name: newMenu.name.trim(),
      price: price,
      description: newMenu.description.trim() || '간단한 설명...',
      // imageUrl은 항상 포함 (빈 문자열이면 null로 저장됨)
      imageUrl: formattedImageUrl
    };

    if (onUpdateMenu) {
      try {
        await onUpdateMenu(editingMenuId, menuData);
        setNewMenu({ name: '', price: '', description: '간단한 설명...', imageUrl: '' });
        setEditingMenuId(null);
        setShowAddForm(false);
      } catch (error) {
        // 에러는 onUpdateMenu에서 처리됨
        console.error('메뉴 수정 오류:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setNewMenu({ name: '', price: '', description: '간단한 설명...', imageUrl: '' });
    setEditingMenuId(null);
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
      currentStock: 0
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
        <form className="add-menu-form" onSubmit={editingMenuId ? handleUpdateMenuSubmit : handleAddMenuSubmit}>
          <div className="form-header">
            <h3>{editingMenuId ? '메뉴 수정' : '메뉴 추가'}</h3>
            {editingMenuId && (
              <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                취소
              </button>
            )}
          </div>
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
            <input
              type="text"
              placeholder="이미지 파일명 (예: americano-ice.jpg) 또는 전체 경로"
              value={newMenu.imageUrl}
              onChange={(e) => setNewMenu({ ...newMenu, imageUrl: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <div className="form-help-text">
              이미지 파일은 <code>ui/public/images/</code> 폴더에 저장하세요.
              <br />
              파일명만 입력하면 자동으로 <code>/images/파일명</code>으로 변환됩니다.
            </div>
            <button type="submit" className="form-submit-btn">
              {editingMenuId ? '수정' : '추가'}
            </button>
          </div>
        </form>
      )}

      {syncedInventory.length === 0 ? (
        <div className="inventory-empty">등록된 메뉴가 없습니다.</div>
      ) : (
        <div className="inventory-cards">
          {syncedInventory.map((item) => {
            const stock = item.currentStock || 0;
            const status = getStatus(stock);
            return (
              <div key={item.menuId} className="inventory-card">
                <div className="inventory-card-header">
                  <div className="inventory-menu-name">{item.menuName}</div>
                  <div className="inventory-card-actions">
                    {menus.find(m => m.id === item.menuId) && (
                      <button
                        className="inventory-btn edit-btn"
                        onClick={() => handleEditMenu(menus.find(m => m.id === item.menuId))}
                        aria-label="메뉴 수정"
                        title="메뉴 수정"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="inventory-btn delete-btn"
                      onClick={() => handleDelete(item.menuId)}
                      aria-label="메뉴 삭제"
                      title="메뉴 삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="inventory-stock-info">
                  <span className="inventory-stock">{stock}개</span>
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
                  <span className="inventory-quantity">{stock}</span>
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

