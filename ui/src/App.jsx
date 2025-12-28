import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import InventoryStatus from './components/InventoryStatus';
import OrderStatus from './components/OrderStatus';
import ToastContainer from './components/ToastContainer';
import { menuAPI, orderAPI, inventoryAPI, dashboardAPI } from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [menus, setMenus] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    receivedOrders: 0,
    preparingOrders: 0,
    completedOrders: 0
  });
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 토스트 메시지 추가 함수
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  // 토스트 제거 함수
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 관리자 페이지로 이동 시 데이터 새로고침
  useEffect(() => {
    if (currentPage === 'admin') {
      loadAdminData();
    }
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMenus(),
        loadInventory()
      ]);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      addToast(error.message || '데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.success && response.data) {
        setMenus(response.data);
      } else {
        throw new Error('메뉴 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('메뉴 로드 오류:', error);
      addToast(error.message || '메뉴를 불러오는 중 오류가 발생했습니다.', 'error');
      setMenus([]); // 빈 배열로 설정하여 에러 상태 표시
    }
  };

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      if (response.success && response.data) {
        setInventory(response.data);
      } else {
        throw new Error('재고 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('재고 로드 오류:', error);
      addToast(error.message || '재고 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      setInventory([]);
    }
  };

  const loadAdminData = async () => {
    try {
      await Promise.all([
        loadOrders(),
        loadDashboardStats(),
        loadInventory()
      ]);
    } catch (error) {
      addToast('관리자 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        throw new Error('주문 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('주문 로드 오류:', error);
      addToast(error.message || '주문 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      setOrders([]);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      } else {
        setDashboardStats({
          totalOrders: 0,
          receivedOrders: 0,
          preparingOrders: 0,
          completedOrders: 0
        });
      }
    } catch (error) {
      console.error('통계 로드 오류:', error);
      addToast(error.message || '통계를 불러오는 중 오류가 발생했습니다.', 'error');
      setDashboardStats({
        totalOrders: 0,
        receivedOrders: 0,
        preparingOrders: 0,
        completedOrders: 0
      });
    }
  };

  // 재고 조회 헬퍼 함수 (useMemo로 최적화)
  const inventoryMap = useMemo(() => {
    const map = new Map();
    inventory.forEach(item => {
      map.set(item.menuId, item.currentStock);
    });
    return map;
  }, [inventory]);

  const getInventoryStock = (menuId) => {
    return inventoryMap.get(menuId) ?? 0;
  };

  const handleAddToCart = (menu, selectedOptions) => {
    try {
      // 메뉴 옵션 검증
      if (!menu.options || !Array.isArray(menu.options)) {
        menu.options = [];
      }
      
      // 선택된 옵션 검증
      const validOptions = (selectedOptions || []).filter(opt => 
        opt && opt.id && menu.options.some(mOpt => mOpt.id === opt.id)
      );
      
      // 재고 확인
      const currentStock = getInventoryStock(menu.id);
      if (currentStock <= 0) {
        addToast(`${menu.name}의 재고가 부족합니다.`, 'error');
        return;
      }

      const optionsPrice = validOptions.reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);
      const itemPrice = menu.price + optionsPrice;
      
      // 동일한 메뉴+옵션 조합이 있는지 확인
      const existingItemIndex = cartItems.findIndex(item => {
        if (item.menuId !== menu.id) return false;
        const itemOptions = item.selectedOptions || [];
        if (itemOptions.length !== validOptions.length) return false;
        
        const itemOptionIds = itemOptions.map(opt => opt.optionId || opt.id).sort().join(',');
        const selectedOptionIds = validOptions.map(opt => opt.optionId || opt.id).sort().join(',');
        
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
          basePrice: menu.price,
          itemPrice: itemPrice,
          selectedOptions: validOptions.map(opt => ({
            optionId: opt.id,
            optionName: opt.name,
            additionalPrice: opt.additionalPrice || 0
          })),
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

  const handleOrder = async () => {
    try {
      if (cartItems.length === 0) {
        addToast('장바구니가 비어있습니다.', 'warning');
        return;
      }

      // 재고 최종 확인
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

      // 주문 데이터 구성
      const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const orderData = {
        items: cartItems.map(item => ({
          menuId: item.menuId,
          menuName: item.menuName,
          basePrice: item.basePrice,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        })),
        totalAmount: totalAmount
      };

      // API 호출
      const response = await orderAPI.create(orderData);
      
      if (response.success) {
        setCartItems([]);
        addToast('주문이 완료되었습니다!', 'success');
        
        // 재고 정보 새로고침
        await loadInventory();
        
        // 관리자 페이지에서 주문 목록 새로고침
        if (currentPage === 'admin') {
          await Promise.all([
            loadOrders(),
            loadDashboardStats()
          ]);
        }
      }
    } catch (error) {
      console.error('주문 오류:', error);
      addToast(error.message || '주문 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 재고 변경 핸들러
  const handleInventoryChange = async (menuId, change) => {
    try {
      if (change > 0) {
        await inventoryAPI.increase(menuId, change);
      } else {
        await inventoryAPI.decrease(menuId, Math.abs(change));
      }
      
      // 재고 목록 새로고침
      await loadInventory();
      addToast('재고가 변경되었습니다.', 'success', 2000);
    } catch (error) {
      addToast(error.message || '재고 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  // 메뉴 추가 핸들러
  const handleAddMenu = async (menuData) => {
    try {
      const response = await menuAPI.create(menuData);
      
      if (response.success) {
        addToast(`${menuData.name} 메뉴가 추가되었습니다.`, 'success');
        // 메뉴 및 재고 목록 새로고침
        await Promise.all([
          loadMenus(),
          loadInventory()
        ]);
      }
    } catch (error) {
      addToast(error.message || '메뉴 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  // 메뉴 수정 핸들러
  const handleUpdateMenu = async (menuId, menuData) => {
    try {
      console.log('메뉴 수정 요청:', { menuId, menuData });
      const response = await menuAPI.update(menuId, menuData);
      console.log('메뉴 수정 응답:', response);
      
      if (response.success) {
        addToast(`${menuData.name} 메뉴가 수정되었습니다.`, 'success');
        // 메뉴 목록 새로고침
        await loadMenus();
      } else {
        throw new Error(response.error?.message || '메뉴 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 수정 오류:', error);
      const errorMessage = error.message || error.status 
        ? `메뉴 수정 중 오류가 발생했습니다. (${error.status || '알 수 없는 오류'})`
        : '메뉴 수정 중 오류가 발생했습니다.';
      addToast(errorMessage, 'error');
      throw error; // 상위 컴포넌트에서도 에러를 처리할 수 있도록
    }
  };

  // 메뉴 삭제 핸들러
  const handleDeleteMenu = async (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) {
      addToast('메뉴를 찾을 수 없습니다.', 'error');
      return;
    }

    // 주문에 포함된 메뉴인지 확인
    const hasOrders = orders.some(order => 
      order.items && order.items.some(item => item.menuId === menuId)
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
      await menuAPI.delete(menuId);
      addToast(`${menu.name} 메뉴가 삭제되었습니다.`, 'success');
      
      // 메뉴 및 재고 목록 새로고침
      await Promise.all([
        loadMenus(),
        loadInventory()
      ]);
      
      // 장바구니에서도 제거
      setCartItems(prev => prev.filter(item => item.menuId !== menuId));
    } catch (error) {
      addToast(error.message || '메뉴 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 주문 상태 변경 핸들러
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      
      // 주문 목록 및 통계 새로고침
      await Promise.all([
        loadOrders(),
        loadDashboardStats(),
        loadInventory()
      ]);
      
      if (newStatus === 'preparing') {
        addToast('제조를 시작했습니다.', 'info', 2000);
      } else if (newStatus === 'completed') {
        addToast('제조가 완료되었습니다.', 'success', 2000);
      }
    } catch (error) {
      addToast(error.message || '주문 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
      </div>
    );
  }

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
            onUpdateMenu={handleUpdateMenu}
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
