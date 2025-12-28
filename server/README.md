# 커피 주문 앱 백엔드 서버

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
cp .env.example .env
```

## 실행

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

- `GET /` - 서버 정보
- `GET /health` - 헬스 체크

## 기술 스택

- Node.js
- Express.js
- PostgreSQL
- CORS

