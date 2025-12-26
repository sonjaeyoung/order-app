import { useState, useMemo } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import InventoryStatus from './components/InventoryStatus';
import OrderStatus from './components/OrderStatus';
import ToastContainer from './components/ToastContainer';
import './App.css';

// 초기 커피 메뉴 데이터
const initialMenusData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '간단한 설명...',
    imageUrl: '',
    options: [
      { id: 1, name: '샷 추가', additionalPrice: 500 },
      { id: 2, name: '시럽 추가', additionalPrice: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '간단한 설명...',
    imageUrl: '',
    options: [
      { id: 1, name: '샷 추가', additionalPrice: 500 },
      { id: 2, name: '시럽 추가', additionalPrice: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '간단한 설명...',
    imageUrl: '',
    options: [
      { id: 1, name: '샷 추가', additionalPrice: 500 },
      { id: 2, name: '시럽 추가', additionalPrice: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5500,
    description: '간단한 설명...',
    imageUrl: '',
    options: [
      { id: 1, name: '샷 추가', additionalPrice: 500 },
      { id: 2, name: '시럽 추가', additionalPrice: 0 }
    ]
  },
  {
    id: 5,
    name: '바닐라라떼',
    price: 6000,
    description: '간단한 설명...',
    imageUrl: '',
    options: [
      { id: 1, name: '샷 추가', additionalPrice: 500 },
      { id: 2, name: '시럽 추가', additionalPrice: 0 }
    ]
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [menus, setMenus] = useState(initialMenusData);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(() => {
    // 초기 재고는 모든 메뉴에 대해 생성
    return initialMenusData.map(menu => ({
      menuId: menu.id,
      menuName: menu.name,
      stock: 10
    }));
  });
  const [toasts, setToasts] = useState([]);

  // 토스트 메시지 추가 함수
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  // 토스트 제거 함수
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 재고 조회 헬퍼 함수 (useMemo로 최적화)
  const inventoryMap = useMemo(() => {
    const map = new Map();
    inventory.forEach(item => {
      map.set(item.menuId, item.stock);
    });
    return map;
  }, [inventory]);

  const getInventoryStock = (menuId) => {
    return inventoryMap.get(menuId) ?? 0;
  };

  const handleAddToCart = (menu, selectedOptions) => {
    try {
      // 재고 확인
      const currentStock = getInventoryStock(menu.id);
      if (currentStock <= 0) {
        addToast(`${menu.name}의 재고가 부족합니다.`, 'error');
        return;
      }

      const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0);
      const itemPrice = menu.price + optionsPrice;
      
      // 동일한 메뉴+옵션 조합이 있는지 확인
      const existingItemIndex = cartItems.findIndex(item => {
        if (item.menuId !== menu.id) return false;
        if (item.selectedOptions.length !== selectedOptions.length) return false;
        
        const itemOptionIds = item.selectedOptions.map(opt => opt.id).sort().join(',');
        const selectedOptionIds = selectedOptions.map(opt => opt.id).sort().join(',');
        
        return itemOptionIds === selectedOptionIds;
      });

      if (existingItemIndex >= 0) {
        // 기존 아이템 수량 증가 시 재고 확인
        const newQuantity = cartItems[existingItemIndex].quantity + 1;
        if (newQuantity > currentStock) {
          addToast(`재고가 부족합니다. (현재 재고: ${currentStock}개)`, 'warning');
          return;
        }
        
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity = newQuantity;
        updatedCart[existingItemIndex].totalPrice = updatedCart[existingItemIndex].itemPrice * newQuantity;
        setCartItems(updatedCart);
        addToast('장바구니에 추가되었습니다.', 'success', 2000);
      } else {
        // 새 아이템 추가
        const newItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          menuId: menu.id,
          menuName: menu.name,
          itemPrice: itemPrice,
          selectedOptions: selectedOptions,
          quantity: 1,
          totalPrice: itemPrice
        };
        setCartItems([...cartItems, newItem]);
        addToast('장바구니에 추가되었습니다.', 'success', 2000);
      }
    } catch (error) {
      addToast('장바구니에 추가하는 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleQuantityChange = (itemId, change) => {
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const updatedCart = [...cartItems];
    const item = updatedCart[itemIndex];
    const newQuantity = item.quantity + change;
    
    // 최소 수량은 1로 유지
    if (newQuantity < 1) {
      return;
    }

    // 재고 확인 (수량 증가 시)
    if (change > 0) {
      const currentStock = getInventoryStock(item.menuId);
      if (newQuantity > currentStock) {
        addToast(`재고가 부족합니다. (현재 재고: ${currentStock}개)`, 'warning');
        return;
      }
    }
    
    // 수량 변경 및 총 가격 재계산
    updatedCart[itemIndex].quantity = newQuantity;
    updatedCart[itemIndex].totalPrice = item.itemPrice * newQuantity;
    
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleOrder = () => {
    try {
      if (cartItems.length === 0) {
        addToast('장바구니가 비어있습니다.', 'warning');
        return;
      }

      // 재고 확인
      const stockIssues = [];
      cartItems.forEach(item => {
        const currentStock = getInventoryStock(item.menuId);
        if (currentStock < item.quantity) {
          stockIssues.push(`${item.menuName} (재고: ${currentStock}개, 주문: ${item.quantity}개)`);
        }
      });

      if (stockIssues.length > 0) {
        addToast(`재고가 부족한 메뉴가 있습니다: ${stockIssues.join(', ')}`, 'error');
        return;
      }
      
      // 주문 생성
      const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const newOrder = {
        id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        items: cartItems.map(item => ({
          menuId: item.menuId,
          menuName: item.menuName,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        })),
        totalAmount: totalAmount,
        status: 'received',
        createdAt: new Date().toISOString()
      };
      
      setOrders([newOrder, ...orders]);
      setCartItems([]);
      addToast('주문이 완료되었습니다!', 'success');
    } catch (error) {
      addToast('주문 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 관리자 대시보드 통계 계산 (useMemo로 최적화)
  const dashboardStats = useMemo(() => ({
    totalOrders: orders.length,
    receivedOrders: orders.filter(o => o.status === 'received').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  }), [orders]);

  // 재고 변경 핸들러
  const handleInventoryChange = (menuId, change) => {
    setInventory(prev => prev.map(item => {
      if (item.menuId === menuId) {
        const newStock = Math.max(0, item.stock + change);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  // 메뉴 추가 핸들러
  const handleAddMenu = (menuData) => {
    try {
      // 중복 메뉴명 확인
      const duplicateMenu = menus.find(m => m.name === menuData.name);
      if (duplicateMenu) {
        addToast('이미 존재하는 메뉴명입니다.', 'warning');
        return;
      }

      const newMenuId = menus.length > 0 
        ? Math.max(...menus.map(m => m.id), 0) + 1 
        : 1;
      const newMenu = {
        ...menuData,
        id: newMenuId
      };
      
      setMenus(prev => [...prev, newMenu]);
      setInventory(prev => [...prev, {
        menuId: newMenuId,
        menuName: newMenu.name,
        stock: 10
      }]);
      addToast(`${newMenu.name} 메뉴가 추가되었습니다.`, 'success');
    } catch (error) {
      addToast('메뉴 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  // 메뉴 삭제 핸들러
  const handleDeleteMenu = (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) {
      addToast('메뉴를 찾을 수 없습니다.', 'error');
      return;
    }

    // 주문에 포함된 메뉴인지 확인
    const hasOrders = orders.some(order => 
      order.items.some(item => item.menuId === menuId)
    );

    if (hasOrders) {
      addToast('주문에 포함된 메뉴는 삭제할 수 없습니다.', 'error');
      return;
    }

    // 장바구니에 있는지 확인
    const inCart = cartItems.some(item => item.menuId === menuId);
    if (inCart) {
      if (!window.confirm(`${menu.name} 메뉴가 장바구니에 있습니다. 삭제하시겠습니까?`)) {
        return;
      }
    } else {
      if (!window.confirm(`${menu.name} 메뉴를 삭제하시겠습니까?`)) {
        return;
      }
    }

    try {
      setMenus(prev => prev.filter(m => m.id !== menuId));
      setInventory(prev => prev.filter(item => item.menuId !== menuId));
      // 장바구니에서도 제거
      setCartItems(prev => prev.filter(item => item.menuId !== menuId));
      addToast(`${menu.name} 메뉴가 삭제되었습니다.`, 'success');
    } catch (error) {
      addToast('메뉴 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 주문 상태 변경 핸들러
  const handleOrderStatusChange = (orderId, newStatus) => {
    try {
      setOrders(prev => {
        const order = prev.find(o => o.id === orderId);
        if (!order) {
          addToast('주문을 찾을 수 없습니다.', 'error');
          return prev;
        }

        // 상태 변경 검증
        const validTransitions = {
          'received': ['preparing'],
          'preparing': ['completed'],
          'completed': []
        };

        if (!validTransitions[order.status]?.includes(newStatus)) {
          addToast('잘못된 상태 변경입니다.', 'error');
          return prev;
        }

        // 제조 시작 시 재고 감소 (한 번의 상태 업데이트로 처리)
        if (newStatus === 'preparing' && order.status === 'received') {
          // 재고 확인
          const stockIssues = [];
          order.items.forEach(item => {
            const currentStock = getInventoryStock(item.menuId);
            if (currentStock < item.quantity) {
              stockIssues.push(`${item.menuName} (재고: ${currentStock}개, 필요: ${item.quantity}개)`);
            }
          });

          if (stockIssues.length > 0) {
            addToast(`재고가 부족합니다: ${stockIssues.join(', ')}`, 'error');
            return prev;
          }

          setInventory(prevInventory => {
            const inventoryMap = new Map(prevInventory.map(item => [item.menuId, item]));
            
            order.items.forEach(item => {
              const invItem = inventoryMap.get(item.menuId);
              if (invItem) {
                inventoryMap.set(item.menuId, {
                  ...invItem,
                  stock: Math.max(0, invItem.stock - item.quantity)
                });
              }
            });

            return Array.from(inventoryMap.values());
          });
          addToast('제조를 시작했습니다.', 'info', 2000);
        } else if (newStatus === 'completed' && order.status === 'preparing') {
          addToast('제조가 완료되었습니다.', 'success', 2000);
        }

        return prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        );
      });
    } catch (error) {
      addToast('주문 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'order' && (
        <div className="order-page">
          <div className="menu-section">
            <h2 className="section-title">메뉴</h2>
            <div className="menu-grid">
              {menus.map(menu => (
                <MenuCard 
                  key={menu.id} 
                  menu={menu} 
                  onAddToCart={handleAddToCart}
                  inventoryStock={getInventoryStock(menu.id)}
                />
              ))}
            </div>
          </div>
          <Cart 
            cartItems={cartItems} 
            onOrder={handleOrder}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      )}
      {currentPage === 'admin' && (
        <div className="admin-page">
          <AdminDashboard stats={dashboardStats} />
          <InventoryStatus 
            inventory={inventory}
            menus={menus}
            onInventoryChange={handleInventoryChange}
            onAddMenu={handleAddMenu}
            onDeleteMenu={handleDeleteMenu}
          />
          <OrderStatus 
            orders={orders}
            onOrderStatusChange={handleOrderStatusChange}
          />
        </div>
      )}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
