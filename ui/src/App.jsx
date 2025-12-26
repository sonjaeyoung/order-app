import { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import InventoryStatus from './components/InventoryStatus';
import OrderStatus from './components/OrderStatus';
import './App.css';

// 임의의 커피 메뉴 데이터
const initialMenus = [
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
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([
    { menuId: 1, menuName: '아메리카노 (ICE)', stock: 10 },
    { menuId: 2, menuName: '아메리카노 (HOT)', stock: 10 },
    { menuId: 3, menuName: '카페라떼', stock: 10 }
  ]);

  const handleAddToCart = (menu, selectedOptions) => {
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
      // 기존 아이템 수량 증가
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].totalPrice = updatedCart[existingItemIndex].itemPrice * updatedCart[existingItemIndex].quantity;
      setCartItems(updatedCart);
    } else {
      // 새 아이템 추가
      const newItem = {
        menuId: menu.id,
        menuName: menu.name,
        itemPrice: itemPrice,
        selectedOptions: selectedOptions,
        quantity: 1,
        totalPrice: itemPrice
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleQuantityChange = (index, change) => {
    const updatedCart = [...cartItems];
    const newQuantity = updatedCart[index].quantity + change;
    
    // 최소 수량은 1로 유지
    if (newQuantity < 1) {
      return; // 수량이 1 미만이 되지 않도록 처리
    }
    
    // 수량 변경 및 총 가격 재계산
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].totalPrice = updatedCart[index].itemPrice * newQuantity;
    
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
  };

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    
    // 주문 생성
    const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newOrder = {
      id: Date.now(),
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
    alert('주문이 완료되었습니다!');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 관리자 대시보드 통계 계산
  const dashboardStats = {
    totalOrders: orders.length,
    receivedOrders: orders.filter(o => o.status === 'received').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  };

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

  // 주문 상태 변경 핸들러
  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // 제조 시작 시 재고 감소
        if (newStatus === 'preparing' && order.status === 'received') {
          order.items.forEach(item => {
            setInventory(prevInventory => prevInventory.map(invItem => {
              if (invItem.menuId === item.menuId) {
                const newStock = Math.max(0, invItem.stock - item.quantity);
                return { ...invItem, stock: newStock };
              }
              return invItem;
            }));
          });
        }
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'order' && (
        <div className="order-page">
          <div className="menu-section">
            <h2 className="section-title">메뉴</h2>
            <div className="menu-grid">
              {initialMenus.map(menu => (
                <MenuCard 
                  key={menu.id} 
                  menu={menu} 
                  onAddToCart={handleAddToCart}
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
            onInventoryChange={handleInventoryChange}
          />
          <OrderStatus 
            orders={orders}
            onOrderStatusChange={handleOrderStatusChange}
          />
        </div>
      )}
    </div>
  );
}

export default App;
