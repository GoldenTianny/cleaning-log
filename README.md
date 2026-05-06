# 클리닝 기록 (cleaning-log)

무인매장 클리닝 결과를 사진으로 기록하고 관리하는 간단한 웹앱입니다.

## 페이지

- `index.html` — 의뢰인 메인 (오늘 받은 결과물 보기, 추가 요청 작성, 기본 체크리스트 설정)
- `upload.html` — 클리닝업체 업로드 페이지 (체크리스트 보고 항목별 사진 업로드)
- `history.html` — 과거 기록 (날짜별)

## 스택

- 프론트: 정적 HTML/JS (GitHub Pages 호스팅)
- 백엔드/저장소: Supabase 무료 (DB + Storage)
- 사진은 업로드 직전 클라이언트에서 자동 압축

## 설정

`config.js` 파일에 Supabase URL과 anon key를 넣어주세요. (`config.example.js` 참고)

## 사용 흐름

1. 의뢰인: 처음 한 번 기본 체크리스트 설정 (예: 화장실, 진열대, 바닥)
2. 클리닝업체: `upload.html` 즐겨찾기 → 클리닝 후 항목별 사진 업로드
3. 의뢰인: `index.html`에서 오늘 결과물 확인, 필요시 추가 요청 작성
