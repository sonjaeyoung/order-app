import './Header.css';

function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="header-logo">COZY</div>
      <nav className="header-nav" aria-label="주요 네비게이션">
        <button 
          className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
          aria-label="주문하기 페이지로 이동"
          aria-current={currentPage === 'order' ? 'page' : undefined}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
          aria-label="관리자 페이지로 이동"
          aria-current={currentPage === 'admin' ? 'page' : undefined}
        >
          관리자
        </button>
      </nav>
    </header>
  );
}

export default Header;

