import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// postgres 데이터베이스에 연결 (데이터베이스 생성용)
const adminClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'postgres', // 기본 데이터베이스
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const dbName = process.env.DB_NAME || 'coffee_order_db';

async function createDatabase() {
  try {
    console.log('데이터베이스 생성 시도 중...');
    console.log(`데이터베이스 이름: ${dbName}`);
    
    await adminClient.connect();
    console.log('✅ postgres 데이터베이스에 연결되었습니다.');
    
    // 데이터베이스 존재 여부 확인
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (checkDb.rows.length > 0) {
      console.log(`⚠️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
      await adminClient.end();
      process.exit(0);
    }
    
    // 데이터베이스 생성
    await adminClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ 데이터베이스 '${dbName}'가 성공적으로 생성되었습니다!`);
    
    await adminClient.end();
    console.log('\n다음 단계: npm run db:migrate 를 실행하여 테이블을 생성하세요.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 데이터베이스 생성 실패:');
    console.error('에러 메시지:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 해결 방법:');
      console.error('1. PostgreSQL 서비스가 실행 중인지 확인하세요.');
      console.error('2. .env 파일의 DB_HOST와 DB_PORT가 올바른지 확인하세요.');
    } else if (error.code === '28P01') {
      console.error('\n💡 해결 방법:');
      console.error('1. .env 파일의 DB_USER와 DB_PASSWORD가 올바른지 확인하세요.');
    }
    
    process.exit(1);
  }
}

createDatabase();

