import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'coffee_order_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err);
  // 프로세스 종료 방지
});

// 연결 풀 상태 확인
pool.on('acquire', () => {
  // 연결 획득 시
});

pool.on('remove', () => {
  // 연결 제거 시
});

// 애플리케이션 종료 시 연결 풀 종료
process.on('SIGINT', async () => {
  await pool.end();
  console.log('데이터베이스 연결 풀이 종료되었습니다.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  console.log('데이터베이스 연결 풀이 종료되었습니다.');
  process.exit(0);
});

export default pool;

