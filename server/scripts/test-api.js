import pool from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 데이터베이스 스키마 테스트
 */
async function testDatabaseSchema() {
  console.log('\n📊 데이터베이스 스키마 테스트 시작...\n');
  
  const client = await pool.connect();
  
  try {
    // 테이블 존재 확인
    const tables = ['menus', 'menu_options', 'inventory', 'orders', 'order_items', 'order_item_options'];
    
    for (const table of tables) {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      const result = await client.query(query, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ ${table} 테이블 존재`);
        
        // 컬럼 확인
        const columnsQuery = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `;
        const columnsResult = await client.query(columnsQuery, [table]);
        console.log(`   컬럼 수: ${columnsResult.rows.length}`);
      } else {
        console.log(`❌ ${table} 테이블 없음`);
      }
    }
    
    // 인덱스 확인
    console.log('\n📑 인덱스 확인:');
    const indexesQuery = `
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('menus', 'orders', 'inventory')
      ORDER BY tablename, indexname;
    `;
    const indexesResult = await client.query(indexesQuery);
    if (indexesResult.rows.length > 0) {
      indexesResult.rows.forEach(idx => {
        console.log(`   ${idx.tablename}.${idx.indexname}`);
      });
    } else {
      console.log('   인덱스 없음');
    }
    
    console.log('\n✅ 데이터베이스 스키마 테스트 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 스키마 테스트 실패:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 샘플 데이터 삽입 테스트
 */
async function testSampleData() {
  console.log('\n📝 샘플 데이터 테스트 시작...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 기존 테스트 데이터 삭제
    await client.query("DELETE FROM menus WHERE name LIKE '테스트%'");
    
    // 테스트 메뉴 추가
    const menuQuery = `
      INSERT INTO menus (name, price, description, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, price, description, image_url;
    `;
    const menuResult = await client.query(menuQuery, [
      '테스트 메뉴',
      5000,
      '테스트용 메뉴입니다',
      '/images/test.jpg'
    ]);
    const menu = menuResult.rows[0];
    console.log(`✅ 테스트 메뉴 생성: ID=${menu.id}, 이름=${menu.name}`);
    
    // 테스트 옵션 추가
    const optionQuery = `
      INSERT INTO menu_options (menu_id, name, additional_price)
      VALUES ($1, $2, $3)
      RETURNING id, name;
    `;
    const optionResult = await client.query(optionQuery, [menu.id, '테스트 옵션', 500]);
    console.log(`✅ 테스트 옵션 생성: ID=${optionResult.rows[0].id}`);
    
    // 테스트 재고 추가
    const inventoryQuery = `
      INSERT INTO inventory (menu_id, current_stock)
      VALUES ($1, $2)
      ON CONFLICT (menu_id) DO UPDATE SET current_stock = $2
      RETURNING menu_id, current_stock;
    `;
    const inventoryResult = await client.query(inventoryQuery, [menu.id, 10]);
    console.log(`✅ 테스트 재고 생성: 메뉴ID=${inventoryResult.rows[0].menu_id}, 재고=${inventoryResult.rows[0].current_stock}`);
    
    await client.query('COMMIT');
    console.log('\n✅ 샘플 데이터 테스트 완료');
    
    // 테스트 데이터 삭제
    await client.query("DELETE FROM menus WHERE name = '테스트 메뉴'");
    console.log('🧹 테스트 데이터 정리 완료');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 샘플 데이터 테스트 실패:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 메인 테스트 실행
 */
async function runTests() {
  try {
    await testDatabaseSchema();
    await testSampleData();
    console.log('\n✅ 모든 테스트 통과!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);
    process.exit(1);
  }
}

runTests();

