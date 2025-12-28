import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'coffee_order_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function runMigrations() {
  try {
    console.log('데이터베이스 마이그레이션 시작...');
    console.log(`데이터베이스: ${process.env.DB_NAME || 'coffee_order_db'}`);
    
    await client.connect();
    console.log('✅ 데이터베이스에 연결되었습니다.');
    
    // migrations 폴더에서 SQL 파일 읽기
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('⚠️  마이그레이션 파일이 없습니다.');
      await client.end();
      process.exit(0);
    }
    
    console.log(`\n📄 발견된 마이그레이션 파일: ${files.length}개`);
    
    // 마이그레이션 실행
    for (const file of files) {
      console.log(`\n실행 중: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query(sql);
      console.log(`✅ ${file} 실행 완료`);
    }
    
    await client.end();
    console.log('\n✅ 모든 마이그레이션이 성공적으로 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:');
    console.error('에러 메시지:', error.message);
    console.error('에러 위치:', error.position);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 해결 방법:');
      console.error('1. PostgreSQL 서비스가 실행 중인지 확인하세요.');
      console.error('2. .env 파일의 설정이 올바른지 확인하세요.');
    } else if (error.code === '3D000') {
      console.error('\n💡 해결 방법:');
      console.error('1. 데이터베이스가 존재하지 않습니다.');
      console.error('2. 먼저 데이터베이스를 생성하세요: npm run db:create');
    }
    
    await client.end();
    process.exit(1);
  }
}

runMigrations();

