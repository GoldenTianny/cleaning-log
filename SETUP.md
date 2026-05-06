# 설치 가이드

전체 30분이면 끝나요. 순서대로 따라가시면 됩니다.

---

## 1단계. Supabase 프로젝트 만들기 (10분)

1. https://supabase.com 가입 (GitHub 계정으로 로그인 가능)
2. **New project** 클릭
3. 프로젝트 이름: `cleaning-log` (아무 이름이나 OK)
4. Database Password: 아무거나 생성 (안 까먹게 메모)
5. Region: **Northeast Asia (Seoul)** 선택
6. **Create new project** 클릭 후 1~2분 대기

### 1-1. SQL 실행
1. 좌측 메뉴 **SQL Editor** → **New query**
2. 프로젝트 폴더의 `supabase-schema.sql` 내용 전체 복사 붙여넣기
3. 우측 하단 **Run** 클릭 → "Success. No rows returned" 나오면 완료

### 1-2. URL과 Key 복사
1. 좌측 메뉴 **Project Settings**(톱니바퀴) → **API**
2. 다음 두 가지를 메모장에 복사:
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** 키 (긴 문자열)

---

## 2단계. config.js 만들기 (1분)

`config.example.js` 를 같은 폴더에 `config.js` 라는 이름으로 복사하고, 위에서 복사한 URL과 key 를 넣어주세요.

```js
window.CONFIG = {
  SUPABASE_URL: 'https://abcd1234.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJI...실제 키...'
};
```

이제 `index.html` 을 브라우저로 열면 작동합니다. 로컬에서 먼저 테스트해보세요.

---

## 3단계. GitHub Pages 에 배포 (10분)

daily-news 와 똑같은 방식이에요.

1. https://github.com/new 에서 새 repo 생성:
   - Repository name: `cleaning-log` (또는 원하는 이름)
   - **Public** 으로 (Pages 무료 사용)
   - **Create repository**

2. 터미널에서:
   ```bash
   cd /Users/tiannysmacmini/Downloads/cleaning-log
   git add .
   git commit -m "초기 커밋"
   git branch -M main
   git remote add origin https://github.com/GoldenTianny/cleaning-log.git
   git push -u origin main
   ```
   *주의: `config.js` 는 `.gitignore` 에 의해 자동으로 제외됩니다. 이게 정상이에요. (3-1단계에서 별도 처리)*

3. GitHub repo 페이지 → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)** → **Save**
   - 1~2분 후 `https://goldentianny.github.io/cleaning-log/` 로 접속 가능

### 3-1. config.js 를 GitHub Pages 에서도 작동시키기

GitHub Pages 에서도 Supabase 에 연결되려면 `config.js` 가 필요한데, anon key 는 RLS 로 보호되므로 공개돼도 안전합니다. 두 가지 방법 중 편한 것 선택:

**방법 A (간단·추천)**: `.gitignore` 에서 `config.js` 줄을 지우고 `config.js` 도 같이 push
```bash
# .gitignore 에서 config.js 줄 삭제 후
git add .gitignore config.js
git commit -m "config 추가"
git push
```

**방법 B (안전)**: Supabase 대시보드에서 anon key 만 별도로 GitHub Secrets 등을 통해 주입
- 정적 호스팅에서는 복잡하므로, pilot 단계에서는 방법 A 권장

---

## 4단계. 사용 시작

- 의뢰인: `https://goldentianny.github.io/cleaning-log/` 접속 → 기본 체크리스트 설정
- 클리닝업체: `https://goldentianny.github.io/cleaning-log/upload.html` 즐겨찾기 → 매일 사진 업로드
- 의뢰인: 메인 페이지 또는 `/history.html` 에서 확인

---

## 자주 묻는 질문

**Q. anon key 가 공개되면 누가 막 데이터를 넣을 수 있지 않나?**
- 이론적으로는 가능합니다. pilot 단계라 단순화한 것이고, 본격 운영 전 다음 중 하나를 추가하세요:
  - 업로드 페이지에 간단한 비밀번호 (URL 쿼리 파라미터로 체크)
  - Supabase Auth 로그인
  - URL을 추측 어려운 경로로 (예: `cleaning-log/x9a2k7/upload.html`)

**Q. 사진 용량이 1GB(Supabase 무료 한도) 넘으면?**
- 클라이언트 자동 압축으로 1매장 매일 클리닝해도 1년에 1GB 이하입니다.
- 한도에 가까워지면 Cloudflare R2 (10GB 무료) 로 마이그레이션 하세요. 그때 도와드릴 수 있어요.

**Q. 사진을 영영 보관해야 하나?**
- 1년 이상 된 사진은 자동 삭제하는 스크립트를 추가할 수 있습니다 (필요시 요청).
