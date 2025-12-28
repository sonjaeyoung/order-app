# 이미지 폴더

이 폴더에 커피 메뉴 이미지를 저장하세요.

## 사용 방법

1. 이미지 파일을 이 폴더에 복사합니다.
   - 예: `americano-ice.jpg`, `cafe-latte.png` 등

2. 이미지 파일명 규칙 (권장):
   - 소문자와 하이픈 사용: `americano-ice.jpg`
   - 공백 대신 하이픈 사용
   - 파일 확장자: `.jpg`, `.jpeg`, `.png`, `.webp` 등

3. 데이터베이스에 이미지 경로 저장:
   - 파일명만 저장: `americano-ice.jpg`
   - 또는 전체 경로: `/images/americano-ice.jpg`

## 예시

```
public/
  images/
    americano-ice.jpg
    americano-hot.jpg
    cafe-latte.jpg
    cappuccino.jpg
    vanilla-latte.jpg
```

## 참고

- `public` 폴더의 파일은 빌드 시 그대로 복사됩니다.
- `/images/파일명.jpg` 형식으로 접근할 수 있습니다.
- 외부 URL도 사용 가능합니다 (http:// 또는 https://로 시작).

