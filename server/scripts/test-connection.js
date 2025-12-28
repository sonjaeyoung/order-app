import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'coffee_order_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function testConnection() {
  try {
    console.log('데이터베이스 연결 시도 중...');
    console.log(`호스트: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`포트: ${process.env.DB_PORT || '5432'}`);
    console.log(`데이터베이스: ${process.env.DB_NAME || 'coffee_order_db'}`);
    console.log(`사용자: ${process.env.DB_USER || 'postgres'}`);
    
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!');
    
    // 간단한 쿼리 테스트
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('\n📊 데이터베이스 정보:');
    console.log(`현재 시간: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL 버전: ${result.rows[0].version.split(',')[0]}`);
    
    await client.end();
    console.log('\n✅ 연결 테스트 완료!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 데이터베이스 연결 실패:');
    console.error('에러 메시지:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 해결 방법:');
      console.error('1. PostgreSQL 서비스가 실행 중인지 확인하세요.');
      console.error('2. .env 파일의 DB_HOST와 DB_PORT가 올바른지 확인하세요.');
    } else if (error.code === '28P01') {
      console.error('\n💡 해결 방법:');
      console.error('1. .env 파일의 DB_USER와 DB_PASSWORD가 올바른지 확인하세요.');
    } else if (error.code === '3D000') {
      console.error('\n💡 해결 방법:');
      console.error('1. 데이터베이스가 존재하지 않습니다.');
      console.error('2. 먼저 데이터베이스를 생성하세요: npm run db:create');
    }
    
    process.exit(1);
  }
}

testConnection();

