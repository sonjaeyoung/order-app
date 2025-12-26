import './AdminDashboard.css';

function AdminDashboard({ stats }) {
  const statCards = [
    { label: '총 주문', value: stats.totalOrders, color: '#333' },
    { label: '주문 접수', value: stats.receivedOrders, color: '#1976d2' },
    { label: '제조 중', value: stats.preparingOrders, color: '#e65100' },
    { label: '제조 완료', value: stats.completedOrders, color: '#2e7d32' }
  ];

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">관리자 대시보드</h2>
      <div className="dashboard-stats">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;

