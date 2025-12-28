#커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트 명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리 할 수 있는 풀스텍 웹 앱

### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능, 수량 선택)
- 관리자 화면(재고 관리 및 주문 상태 관리 및 매출 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스텍
- 프런트앤드 : HTML, CSS, REACT, JAVASCRIPT
- 백엔드 : Node.Js, Express
- 데이터베이스 : PostgreSQL

## 3. 기본사항
- 프런트앤드와 백앤드 따로 개발
- 메뉴는 커피만 있고 관리자에서 메뉴 추가할 수 있음

## 4. 주문하기 화면 상세 명세

### 4.1 화면 구성

#### 4.1.1 헤더 영역
- **위치**: 화면 최상단
- **구성 요소**:
  - **브랜드 로고**: 좌측에 "COZY" 텍스트가 포함된 다크 그린 배경의 박스
  - **주문하기 버튼**: 헤더 우측, 현재 화면을 나타내는 버튼
  - **관리자 버튼**: 헤더 우측, 관리자 화면으로 이동하는 버튼

#### 4.1.2 메뉴 아이템 영역
- **위치**: 헤더 하단, 화면 중앙
- **레이아웃**: 메뉴 아이템들을 카드 형태로 가로로 배치 (반응형 그리드)
- **카드 구성 요소**:
  - **메뉴 이미지**: 상단에 메뉴 이미지 영역 (플레이스홀더 지원)
  - **메뉴 이름**: 메뉴명 표시 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
  - **가격**: 원화 표기로 가격 표시 (예: "4,000원", "5,000원")
  - **설명**: "간단한 설명..." 형태의 메뉴 설명 텍스트
  - **옵션 선택**:
    - 체크박스 형태의 옵션 선택 UI
    - 각 옵션은 옵션명과 추가 가격 표시 (예: "샷 추가 (+500원)", "시럽 추가 (+0원)")
    - 옵션 선택 시 해당 옵션이 장바구니에 반영됨
  - **담기 버튼**: 카드 하단에 회색 배경의 "담기" 버튼

#### 4.1.3 장바구니 영역
- **위치**: 화면 하단
- **구성 요소**:
  - **제목**: "장바구니" 텍스트
  - **주문 목록**:
    - 선택한 메뉴 아이템 목록 표시
    - 각 아이템은 다음 정보 포함:
      - 메뉴명과 선택한 옵션 (예: "아메리카노(ICE) (샷 추가)")
      - 수량 (예: "X 1", "X 2")
      - 개별 가격 (옵션 포함 가격)
  - **총 금액**:
    - "총 금액" 레이블과 함께 총 주문 금액을 굵은 글씨로 표시
    - 모든 아이템의 가격 합계 자동 계산
  - **주문하기 버튼**: 총 금액 하단에 회색 배경의 "주문하기" 버튼

### 4.2 기능 명세

#### 4.2.1 메뉴 조회
- 관리자가 등록한 모든 커피 메뉴를 카드 형태로 표시
- 메뉴는 가로 스크롤 또는 그리드 레이아웃으로 배치
- 각 메뉴 카드에는 이미지, 이름, 가격, 설명이 표시됨

#### 4.2.2 옵션 선택
- 각 메뉴 카드에서 옵션을 체크박스로 선택 가능
- 옵션 선택 시 추가 가격이 표시됨
- 옵션은 메뉴별로 다를 수 있으며, 관리자가 설정 가능
- 옵션 선택 여부는 "담기" 버튼 클릭 시 장바구니에 반영됨

#### 4.2.3 장바구니 담기
- "담기" 버튼 클릭 시:
  - 선택한 메뉴와 옵션이 장바구니에 추가됨
  - 동일한 메뉴+옵션 조합이 이미 장바구니에 있으면 수량이 증가함
  - 장바구니에 추가된 아이템은 하단 장바구니 영역에 표시됨

#### 4.2.4 장바구니 관리
- 장바구니에 담긴 아이템 목록 표시
- 각 아이템의 수량과 가격 표시
- 총 금액 자동 계산 및 표시
- (추가 기능) 아이템 삭제 또는 수량 조절 기능 고려 가능

#### 4.2.5 주문하기
- "주문하기" 버튼 클릭 시:
  - 장바구니에 담긴 모든 아이템을 주문으로 전송
  - 주문 정보는 백엔드 API를 통해 저장됨
  - 주문 완료 후 장바구니 초기화 또는 주문 확인 화면 표시

### 4.3 UI/UX 요구사항

#### 4.3.1 디자인
- 깔끔하고 미니멀한 디자인
- 화이트 배경에 다크 그레이 텍스트 및 아웃라인
- 브랜드 컬러: 다크 그린 (COZY 로고)
- 버튼: 회색 배경

#### 4.3.2 반응형 디자인
- 다양한 화면 크기에 대응 가능한 레이아웃
- 모바일, 태블릿, 데스크톱 환경 지원

#### 4.3.3 사용자 경험
- 직관적인 메뉴 선택 및 장바구니 추가 프로세스
- 실시간 총 금액 계산 및 표시
- 명확한 옵션 선택 UI (체크박스)
- 장바구니에 담긴 아이템의 옵션 정보 명확히 표시

### 4.4 데이터 구조

#### 4.4.1 메뉴 아이템 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  options: [
    {
      id: number,
      name: string,
      additionalPrice: number
    }
  ]
}
```

#### 4.4.2 장바구니 아이템 데이터
```javascript
{
  menuId: number,
  menuName: string,
  basePrice: number,
  selectedOptions: [
    {
      optionId: number,
      optionName: string,
      additionalPrice: number
    }
  ],
  quantity: number,
  totalPrice: number
}
```

### 4.5 API 요구사항

#### 4.5.1 메뉴 조회
- **엔드포인트**: `GET /api/menus`
- **응답**: 메뉴 목록 배열

#### 4.5.2 주문 생성
- **엔드포인트**: `POST /api/orders`
- **요청 본문**: 장바구니 아이템 배열 및 총 금액
- **응답**: 생성된 주문 정보

## 5. 관리자 화면 상세 명세

### 5.1 화면 구성

#### 5.1.1 헤더 영역
- **위치**: 화면 최상단
- **구성 요소**:
  - **브랜드 로고**: 좌측에 "COZY" 텍스트가 포함된 다크 그린 배경의 박스
  - **주문하기 버튼**: 헤더 우측, 주문하기 화면으로 이동하는 버튼
  - **관리자 버튼**: 헤더 우측, 현재 화면을 나타내는 버튼

#### 5.1.2 관리자 대시보드 영역
- **위치**: 헤더 하단, 화면 최상단
- **기능**: 주문 현황 요약 통계 표시
- **구성 요소**:
  - **제목**: "관리자 대시보드" 텍스트
  - **통계 요약**: 한 줄로 표시되는 주문 통계
    - 총 주문 수
    - 주문 접수 수
    - 제조 중 수
    - 제조 완료 수
  - **표시 형식**: "총 주문 1 / 주문 접수 1 / 제조 중 0 / 제조 완료 0" 형태
  - **배경**: 연한 회색 박스 형태

#### 5.1.3 재고 현황 영역
- **위치**: 관리자 대시보드 하단
- **기능**: 메뉴별 재고 수량 조회 및 수정
- **구성 요소**:
  - **제목**: "재고 현황" 텍스트
  - **재고 카드**: 각 메뉴별로 카드 형태로 표시
    - 메뉴명 표시 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
    - 현재 재고 수량 표시 (예: "10개")
    - **재고 조절 버튼**:
      - "+" 버튼: 재고 증가
      - "-" 버튼: 재고 감소
  - **레이아웃**: 재고 카드들을 가로로 배치
  - **배경**: 연한 회색 박스 형태

#### 5.1.4 주문 현황 영역
- **위치**: 재고 현황 하단, 화면 하단
- **기능**: 주문 목록 조회 및 주문 상태 변경
- **구성 요소**:
  - **제목**: "주문 현황" 텍스트
  - **주문 목록**: 주문 항목들을 리스트 형태로 표시
  - **주문 항목 구성 요소**:
    - **주문 시간**: 날짜와 시간 표시 (예: "7월 31일 13:00")
    - **주문 메뉴**: 메뉴명과 수량 표시 (예: "아메리카노(ICE) x 1")
    - **주문 금액**: 가격 표시 (예: "4,000원")
    - **주문 접수 버튼**: "주문 접수" 버튼으로 주문 상태 변경
  - **배경**: 연한 회색 박스 형태

### 5.2 기능 명세

#### 5.2.1 관리자 대시보드
- **주문 통계 조회**: 실시간 주문 현황 통계 표시
  - 총 주문 수: 전체 주문 건수
  - 주문 접수 수: 주문 접수 상태인 주문 건수
  - 제조 중 수: 제조 중 상태인 주문 건수
  - 제조 완료 수: 제조 완료 상태인 주문 건수
- **실시간 업데이트**: 주문 상태 변경 시 통계 자동 업데이트

#### 5.2.2 재고 관리
- **메뉴별 재고 조회**: 등록된 모든 메뉴의 현재 재고 수량 조회
- **재고 수량 표시**: 각 메뉴별로 현재 재고 수량을 "개" 단위로 표시
- **재고 증가**: "+" 버튼 클릭 시 해당 메뉴의 재고 수량 1 증가
- **재고 감소**: "-" 버튼 클릭 시 해당 메뉴의 재고 수량 1 감소
- **재고 실시간 반영**: 재고 수정 시 즉시 화면에 반영

#### 5.2.3 주문 관리
- **주문 목록 조회**: 모든 주문을 시간순으로 표시
- **주문 정보 표시**:
  - 주문 시간: 날짜와 시간 (예: "7월 31일 13:00")
  - 주문 메뉴: 메뉴명과 수량 (예: "아메리카노(ICE) x 1")
  - 주문 금액: 해당 주문의 총 금액
- **주문 접수**: "주문 접수" 버튼 클릭 시
  - 주문 상태를 "주문 접수"로 변경
  - 관리자 대시보드의 "주문 접수" 수 증가
  - 주문 현황 목록에서 상태 업데이트
- **주문 상태 흐름**: 주문 접수 → 제조 중 → 제조 완료

### 5.3 UI/UX 요구사항

#### 5.3.1 디자인
- 주문하기 화면과 일관된 디자인 시스템
- 깔끔하고 직관적인 관리자 인터페이스
- 각 섹션은 연한 회색 배경의 박스 형태로 구분
- 정보 밀도가 높은 레이아웃 (관리 효율성 고려)
- 상태별 색상 구분 (주문 상태, 재고 부족 등)
- 버튼은 명확한 테두리로 구분

#### 5.3.2 반응형 디자인
- 다양한 화면 크기에 대응 가능한 레이아웃
- 모바일, 태블릿, 데스크톱 환경 지원
- 관리자 화면은 주로 데스크톱 환경에서 사용될 것으로 예상

#### 5.3.3 사용자 경험
- 빠른 데이터 조회 및 수정
- 실시간 업데이트 (주문 상태 변경 시)
- 명확한 피드백 (저장 성공/실패, 삭제 확인 등)
- 효율적인 네비게이션 (탭, 사이드바 등)

### 5.4 데이터 구조

#### 5.4.1 메뉴 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  options: [
    {
      id: number,
      name: string,
      additionalPrice: number
    }
  ],
  createdAt: string,
  updatedAt: string
}
```

#### 5.4.2 주문 데이터
```javascript
{
  id: number,
  orderNumber: string,
  items: [
    {
      menuId: number,
      menuName: string,
      basePrice: number,
      selectedOptions: [
        {
          optionId: number,
          optionName: string,
          additionalPrice: number
        }
      ],
      quantity: number,
      totalPrice: number
    }
  ],
  totalAmount: number,
  status: 'pending' | 'received' | 'preparing' | 'completed' | 'cancelled',
  createdAt: string,
  updatedAt: string
}
```

#### 5.4.3 재고 데이터 (메뉴별 재고)
```javascript
{
  menuId: number,
  menuName: string,
  currentStock: number,
  unit: string, // "개"
  updatedAt: string
}
```

#### 5.4.4 주문 통계 데이터
```javascript
{
  totalOrders: number,
  receivedOrders: number,
  preparingOrders: number,
  completedOrders: number
}
```

#### 5.4.5 매출 통계 데이터 (향후 확장)
```javascript
{
  period: string,
  totalSales: number,
  orderCount: number,
  averageOrderValue: number,
  topMenuItems: [
    {
      menuId: number,
      menuName: string,
      salesCount: number,
      totalRevenue: number
    }
  ]
}
```

### 5.5 API 요구사항

#### 5.5.1 관리자 대시보드 API
- **주문 통계 조회**: `GET /api/admin/dashboard/stats`
  - **응답**: 주문 통계 데이터 (총 주문, 주문 접수, 제조 중, 제조 완료 수)

#### 5.5.2 재고 관리 API
- **메뉴별 재고 목록 조회**: `GET /api/admin/inventory`
  - **응답**: 모든 메뉴의 재고 정보 배열
- **재고 수량 증가**: `PATCH /api/admin/inventory/:menuId/increase`
  - **요청 본문**: `{ amount: number }` (기본값: 1)
- **재고 수량 감소**: `PATCH /api/admin/inventory/:menuId/decrease`
  - **요청 본문**: `{ amount: number }` (기본값: 1)
- **재고 수량 직접 수정**: `PUT /api/admin/inventory/:menuId`
  - **요청 본문**: `{ currentStock: number }`

#### 5.5.3 주문 관리 API
- **주문 목록 조회**: `GET /api/admin/orders`
  - **응답**: 모든 주문 목록 (시간순 정렬)
- **주문 상세 조회**: `GET /api/admin/orders/:id`
- **주문 접수**: `PATCH /api/admin/orders/:id/receive`
  - 주문 상태를 "주문 접수"로 변경
- **주문 상태 변경**: `PATCH /api/admin/orders/:id/status`
  - **요청 본문**: `{ status: 'received' | 'preparing' | 'completed' }`

## 6. 백엔드 개발 명세

### 6.1 데이터베이스 스키마

#### 6.1.1 메뉴 테이블 (menus)
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.2 메뉴 옵션 테이블 (menu_options)
```sql
CREATE TABLE menu_options (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0 CHECK (additional_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.3 재고 테이블 (inventory)
```sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL UNIQUE REFERENCES menus(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  unit VARCHAR(10) DEFAULT '개',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.4 주문 테이블 (orders)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'received' 
    CHECK (status IN ('received', 'preparing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.5 주문 아이템 테이블 (order_items)
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL,
  base_price INTEGER NOT NULL CHECK (base_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  item_total_price INTEGER NOT NULL CHECK (item_total_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.1.6 주문 아이템 옵션 테이블 (order_item_options)
```sql
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES menu_options(id),
  option_name VARCHAR(100) NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0 CHECK (additional_price >= 0)
);
```

### 6.2 API 상세 명세

#### 6.2.1 메뉴 관리 API

##### GET /api/menus
- **설명**: 모든 메뉴 목록 조회
- **응답 상태 코드**: 200 OK
- **응답 본문**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "price": 4000,
      "description": "간단한 설명...",
      "imageUrl": "",
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "additionalPrice": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "additionalPrice": 0
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

##### GET /api/menus/:id
- **설명**: 특정 메뉴 상세 조회
- **응답 상태 코드**: 200 OK, 404 Not Found
- **응답 본문**: 메뉴 객체 (위와 동일한 형식)

##### POST /api/admin/menus
- **설명**: 새 메뉴 추가
- **요청 본문**:
```json
{
  "name": "에스프레소",
  "price": 3500,
  "description": "진한 에스프레소",
  "imageUrl": "",
  "options": [
    {
      "name": "샷 추가",
      "additionalPrice": 500
    }
  ]
}
```
- **응답 상태 코드**: 201 Created, 400 Bad Request, 409 Conflict (중복 메뉴명)
- **응답 본문**:
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "에스프레소",
    "price": 3500,
    "description": "진한 에스프레소",
    "imageUrl": "",
    "options": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### PUT /api/admin/menus/:id
- **설명**: 메뉴 정보 수정
- **요청 본문**: 수정할 필드만 포함 (PATCH 방식)
- **응답 상태 코드**: 200 OK, 404 Not Found, 400 Bad Request

##### DELETE /api/admin/menus/:id
- **설명**: 메뉴 삭제
- **응답 상태 코드**: 200 OK, 404 Not Found, 409 Conflict (주문에 포함된 경우)
- **응답 본문**:
```json
{
  "success": true,
  "message": "메뉴가 삭제되었습니다."
}
```

#### 6.2.2 주문 관리 API

##### POST /api/orders
- **설명**: 새 주문 생성
- **요청 본문**:
```json
{
  "items": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "basePrice": 4000,
      "selectedOptions": [
        {
          "optionId": 1,
          "optionName": "샷 추가",
          "additionalPrice": 500
        }
      ],
      "quantity": 1,
      "totalPrice": 4500
    }
  ],
  "totalAmount": 4500
}
```
- **응답 상태 코드**: 201 Created, 400 Bad Request (재고 부족 등)
- **응답 본문**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-20240101-001",
    "items": [...],
    "totalAmount": 4500,
    "status": "received",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### GET /api/admin/orders
- **설명**: 모든 주문 목록 조회 (관리자용)
- **쿼리 파라미터**: 
  - `status`: 필터링할 주문 상태 (선택)
  - `startDate`: 시작 날짜 (선택)
  - `endDate`: 종료 날짜 (선택)
- **응답 상태 코드**: 200 OK
- **응답 본문**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-20240101-001",
      "items": [...],
      "totalAmount": 4500,
      "status": "received",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

##### GET /api/admin/orders/:id
- **설명**: 특정 주문 상세 조회
- **응답 상태 코드**: 200 OK, 404 Not Found

##### PATCH /api/admin/orders/:id/status
- **설명**: 주문 상태 변경
- **요청 본문**:
```json
{
  "status": "preparing"
}
```
- **응답 상태 코드**: 200 OK, 400 Bad Request (잘못된 상태 전환), 404 Not Found
- **응답 본문**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "preparing",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 6.2.3 재고 관리 API

##### GET /api/admin/inventory
- **설명**: 모든 메뉴의 재고 정보 조회
- **응답 상태 코드**: 200 OK
- **응답 본문**:
```json
{
  "success": true,
  "data": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "currentStock": 10,
      "unit": "개",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

##### PATCH /api/admin/inventory/:menuId/increase
- **설명**: 재고 수량 증가
- **요청 본문**:
```json
{
  "amount": 1
}
```
- **응답 상태 코드**: 200 OK, 404 Not Found
- **응답 본문**:
```json
{
  "success": true,
  "data": {
    "menuId": 1,
    "currentStock": 11,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### PATCH /api/admin/inventory/:menuId/decrease
- **설명**: 재고 수량 감소
- **요청 본문**:
```json
{
  "amount": 1
}
```
- **응답 상태 코드**: 200 OK, 400 Bad Request (재고가 0 이하가 되는 경우), 404 Not Found

##### PUT /api/admin/inventory/:menuId
- **설명**: 재고 수량 직접 수정
- **요청 본문**:
```json
{
  "currentStock": 20
}
```
- **응답 상태 코드**: 200 OK, 400 Bad Request, 404 Not Found

#### 6.2.4 관리자 대시보드 API

##### GET /api/admin/dashboard/stats
- **설명**: 주문 통계 조회
- **응답 상태 코드**: 200 OK
- **응답 본문**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "receivedOrders": 3,
    "preparingOrders": 2,
    "completedOrders": 5
  }
}
```

### 6.3 에러 처리

#### 6.3.1 에러 응답 형식
모든 에러 응답은 다음 형식을 따릅니다:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}
  }
}
```

#### 6.3.2 HTTP 상태 코드
- **200 OK**: 성공적인 조회/수정
- **201 Created**: 리소스 생성 성공
- **400 Bad Request**: 잘못된 요청 (검증 실패 등)
- **404 Not Found**: 리소스를 찾을 수 없음
- **409 Conflict**: 충돌 (중복, 제약 조건 위반 등)
- **500 Internal Server Error**: 서버 내부 오류

#### 6.3.3 주요 에러 코드
- `VALIDATION_ERROR`: 입력 데이터 검증 실패
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `DUPLICATE_MENU`: 중복된 메뉴명
- `INSUFFICIENT_STOCK`: 재고 부족
- `INVALID_STATUS_TRANSITION`: 잘못된 상태 전환
- `MENU_IN_USE`: 주문에 포함된 메뉴 (삭제 불가)
- `INVALID_ORDER`: 잘못된 주문 데이터

### 6.4 데이터 검증 규칙

#### 6.4.1 메뉴 검증
- **name**: 필수, 1-100자, 중복 불가
- **price**: 필수, 0 이상의 정수
- **description**: 선택, 최대 500자
- **imageUrl**: 선택, 유효한 URL 형식

#### 6.4.2 주문 검증
- **items**: 필수, 배열, 최소 1개 이상
- **totalAmount**: 필수, 0 이상의 정수
- **items[].menuId**: 필수, 존재하는 메뉴 ID
- **items[].quantity**: 필수, 1 이상의 정수
- **items[].totalPrice**: 필수, 0 이상의 정수
- 주문 시 재고 확인 필수

#### 6.4.3 재고 검증
- **currentStock**: 0 이상의 정수
- 재고 감소 시 0 이하로 내려가지 않도록 검증

### 6.5 비즈니스 로직

#### 6.5.1 주문 생성 시
1. 주문 번호 자동 생성 (예: "ORD-YYYYMMDD-XXX")
2. 재고 확인 (주문 수량이 재고보다 많으면 에러)
3. 주문 아이템 및 옵션 저장
4. 주문 상태는 기본값 'received'

#### 6.5.2 주문 상태 변경 시
1. 상태 전환 검증:
   - `received` → `preparing` (제조 시작)
   - `preparing` → `completed` (제조 완료)
   - 그 외 전환은 불가
2. 제조 시작 시 (`received` → `preparing`):
   - 재고 재확인
   - 주문에 포함된 메뉴의 재고 차감
   - 재고가 부족하면 에러 반환

#### 6.5.3 메뉴 삭제 시
1. 주문에 포함된 메뉴인지 확인
2. 포함된 경우 삭제 불가 (409 Conflict)
3. 포함되지 않은 경우 삭제 가능
4. 관련 재고 정보도 함께 삭제 (CASCADE)

#### 6.5.4 재고 관리 시
1. 재고 증가/감소 시 0 이하로 내려가지 않도록 검증
2. 재고 수정 시 `updated_at` 자동 업데이트

### 6.6 백엔드 아키텍처

#### 6.6.1 프로젝트 구조
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── inventoryController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── Menu.js
│   │   ├── MenuOption.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── OrderItemOption.js
│   │   └── Inventory.js
│   ├── routes/
│   │   ├── menus.js
│   │   ├── orders.js
│   │   ├── inventory.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validator.js
│   │   └── logger.js
│   ├── utils/
│   │   ├── orderNumberGenerator.js
│   │   └── validators.js
│   └── app.js
├── migrations/
├── seeds/
├── .env
├── package.json
└── README.md
```

#### 6.6.2 환경 변수
```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=postgres
DB_PASSWORD=password

# 서버
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### 6.6.3 미들웨어
- **CORS**: 프런트엔드와의 통신을 위한 CORS 설정
- **Body Parser**: JSON 요청 본문 파싱
- **Error Handler**: 통일된 에러 응답 처리
- **Validator**: 요청 데이터 검증
- **Logger**: 요청/응답 로깅

### 6.7 보안 고려사항

#### 6.7.1 입력 검증
- 모든 사용자 입력 검증 (SQL Injection 방지)
- 파라미터화된 쿼리 사용
- XSS 방지를 위한 데이터 이스케이프

#### 6.7.2 CORS 설정
- 프런트엔드 도메인만 허용
- 필요한 HTTP 메서드만 허용

#### 6.7.3 데이터 무결성
- 트랜잭션 사용 (주문 생성 시)
- 외래 키 제약 조건
- 체크 제약 조건 (가격, 수량 등)

### 6.8 성능 최적화

#### 6.8.1 데이터베이스
- 인덱스 추가:
  - `menus.name` (UNIQUE)
  - `orders.created_at` (정렬 최적화)
  - `orders.status` (필터링 최적화)
  - `inventory.menu_id` (UNIQUE)
- 쿼리 최적화 (JOIN 최소화, 필요한 컬럼만 선택)

#### 6.8.2 API 응답
- 페이지네이션 (주문 목록 등)
- 캐싱 고려 (메뉴 목록 등 자주 변경되지 않는 데이터)

### 6.9 테스트 요구사항

#### 6.9.1 단위 테스트
- 각 컨트롤러 함수 테스트
- 비즈니스 로직 테스트
- 검증 함수 테스트

#### 6.9.2 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 에러 케이스 테스트

### 6.10 배포 및 운영

#### 6.10.1 환경
- 개발 환경: 로컬 개발
- 프로덕션 환경: 서버 배포

#### 6.10.2 로깅
- 요청/응답 로깅
- 에러 로깅
- 중요한 비즈니스 로직 로깅 (주문 생성, 상태 변경 등)