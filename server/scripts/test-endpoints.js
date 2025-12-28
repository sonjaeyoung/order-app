import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

/**
 * API 엔드포인트 테스트
 */
async function testEndpoints() {
  console.log('🧪 API 엔드포인트 테스트 시작...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // 테스트 헬퍼 함수
  async function testEndpoint(name, method, url, body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, options);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ ${name}: 성공`);
        results.passed++;
        return { success: true, data };
      } else {
        console.log(`❌ ${name}: 실패 - ${data.error?.message || '알 수 없는 오류'}`);
        results.failed++;
        results.errors.push({ name, error: data.error?.message || '알 수 없는 오류' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log(`❌ ${name}: 네트워크 오류 - ${error.message}`);
      results.failed++;
      results.errors.push({ name, error: error.message });
      return { success: false, error: error.message };
    }
  }
  
  // 1. Health check
  console.log('1. Health Check 테스트');
  await testEndpoint('Health Check', 'GET', '/health');
  
  // 2. 메뉴 조회
  console.log('\n2. 메뉴 API 테스트');
  const menusResult = await testEndpoint('메뉴 목록 조회', 'GET', '/menus');
  
  if (menusResult.success && menusResult.data.data && menusResult.data.data.length > 0) {
    const firstMenu = menusResult.data.data[0];
    await testEndpoint('메뉴 상세 조회', 'GET', `/menus/${firstMenu.id}`);
  }
  
  // 3. 관리자 대시보드
  console.log('\n3. 관리자 대시보드 API 테스트');
  await testEndpoint('주문 통계 조회', 'GET', '/admin/dashboard/stats');
  
  // 4. 재고 조회
  console.log('\n4. 재고 API 테스트');
  await testEndpoint('재고 목록 조회', 'GET', '/admin/inventory');
  
  // 5. 주문 조회
  console.log('\n5. 주문 API 테스트');
  await testEndpoint('주문 목록 조회', 'GET', '/admin/orders');
  
  // 결과 출력
  console.log('\n' + '='.repeat(50));
  console.log('📊 테스트 결과');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${results.passed}개`);
  console.log(`❌ 실패: ${results.failed}개`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ 실패한 테스트:');
    results.errors.forEach(err => {
      console.log(`  - ${err.name}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (results.failed === 0) {
    console.log('✅ 모든 테스트 통과!');
    process.exit(0);
  } else {
    console.log('❌ 일부 테스트 실패');
    process.exit(1);
  }
}

// 서버 연결 확인
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (response.ok) {
      console.log('✅ 서버 연결 확인\n');
      return true;
    }
  } catch (error) {
    console.error('❌ 서버에 연결할 수 없습니다.');
    console.error('   서버가 실행 중인지 확인하세요: npm run dev (in server folder)');
    process.exit(1);
  }
}

async function runTests() {
  await checkServer();
  await testEndpoints();
}

runTests();

