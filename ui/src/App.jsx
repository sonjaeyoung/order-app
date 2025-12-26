import { useState } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import Cart from './components/Cart';
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
    
    // 주문 처리 (추후 API 연동)
    alert('주문이 완료되었습니다!');
    setCartItems([]);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // 관리자 페이지는 추후 구현
    if (page === 'admin') {
      alert('관리자 페이지는 추후 구현 예정입니다.');
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
    </div>
  );
}

export default App;
