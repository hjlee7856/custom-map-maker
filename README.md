# Custom Map Maker

지도 기반 제보/장소 서비스를 빠르게 만들기 위한 CMS 템플릿 입니다.

## 요약

- 목표: 공개 지도 화면과 운영자 승인 화면을 빠르게 구축한다.
- 현재 스택: `Next.js 16` + `TypeScript` + `MapLibre GL JS`
- 현재 범위: 장소 목록, 동적 카테고리, 공개/승인대기/반려 상태, 공개 지도, 제보 화면, 관리자 대시보드
- 제품 방향: 제보형/장소형 지도를 빠르게 운영하는 도구에 집중한다.

## 현재 구현 상태

### 공개 지도

- 한국 중심 좌표 사용
- 장소 목록과 지도 동시 표시
- 카테고리별 필터 및 검색
- 공개 상태(`published`) 장소만 노출
- 마커 클릭 시 팝업 표시
- 로그인 사용자 제보 진입 가능
- 관리자 화면으로 이동 가능

### 제보 화면

- 로그인 사용자만 접근 가능
- 새 장소를 `pending` 상태로 등록
- 지도 클릭으로 좌표 선택
- 관리자 승인 후 공개 지도 반영

### 관리자 화면

- 총 장소 수
- 승인 대기 수
- 공개 중 수
- 반려 수
- 검색/상태/카테고리 필터
- 카테고리 추가
- 지도 클릭 기반 좌표 선택
- 승인/반려 상태 전환

## 로컬 실행

```bash
yarn install
yarn dev
```

- 공개 화면: `http://localhost:3000`
- 제보 화면: `http://localhost:3000/report`
- 관리자 화면: `http://localhost:3000/admin`

## Supabase 연결

1. Supabase 프로젝트를 생성한다.
2. SQL Editor 또는 MCP를 통해 [supabase/migrations/20260428110000_create_places.sql](/abs/path/supabase/migrations/20260428110000_create_places.sql)을 실행한다.
3. [.env.example](/abs/path/.env.example)을 참고해 프로젝트 루트의 `.env` 또는 `.env.local`에 아래 값을 채운다.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
ADMIN_EMAILS=admin@example.com
```

- 현재 기본 연동 테이블은 `public.places` 이다.
- 동적 카테고리 테이블은 `public.place_categories` 이다.
- 환경 변수가 없거나 조회에 실패하면 화면은 샘플 데이터로 폴백한다.
- 환경 변수가 설정되면 홈은 `published` 상태만, 관리자 화면은 전체 상태를 `public.places` 테이블에서 읽는다.
- `/login` 에서 Supabase Auth 이메일/비밀번호 로그인 및 회원가입을 처리한다.
- `/report` 는 로그인한 사용자의 제보 등록 화면이다.
- `/admin` 은 로그인한 사용자만 접근할 수 있다.
- `ADMIN_EMAILS` 를 비워두면 로그인한 사용자 전체가 관리자 화면에 접근할 수 있고, 값을 넣으면 해당 이메일만 허용한다.
- 마이그레이션에는 다음이 포함된다.
  - `places` 테이블 생성
  - `rejected` 상태 추가 마이그레이션
  - `place_categories` 테이블 생성
  - `places.category` 외래키 연결
  - `anon`, `authenticated` 읽기 권한 부여
  - `authenticated` 쓰기 권한 부여
  - RLS 활성화
  - 공개 조회 정책 생성
  - 인증 사용자 CRUD 정책 생성
  - 샘플 데이터 4건 upsert

## 현재 검증 상태

- Supabase MCP로 원격 DB에 `public.places` 생성 완료
- Supabase MCP로 `rejected` 상태 제약조건 반영 완료
- Supabase MCP로 `public.place_categories` 및 카테고리 FK 반영 완료
- Supabase MCP로 카테고리 FK 인덱스 및 RLS 정책 최적화 반영 완료
- 샘플 데이터 4건 입력 완료
- publishable key 기준 `select` 조회 성공
- `/admin` 비로그인 접근 시 `/login` 리다이렉트 확인
- `/report` 비로그인 접근 시 `/login` 리다이렉트 확인
- `security` advisor: Leaked Password Protection 비활성 경고 1건
- `performance` advisor: 새 FK 인덱스 미사용 정보 1건
- `yarn lint` 통과

## 한국 지도 반영 원칙

- 기본값은 한국 중심 좌표와 한국 범위에 맞춘다.
- API 키 없이도 검증 가능하도록 기본 타일은 공개 타일을 사용한다.
- 이후 국내 지도 공급자는 환경 변수 기반으로 교체할 수 있게 확장한다.

## 다음 단계

1. 제보 첨부 이미지 추가
2. 카테고리 삭제/정렬 기능
3. 운영자 역할을 DB 레벨로 분리
4. 지도에서 역지오코딩 주소 보조 입력
