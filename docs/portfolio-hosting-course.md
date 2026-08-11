# 🎓 퍼스널 포트폴리오 호스팅 실습 강의안

> **수강생**: Solhee (Android → AI/microbiome bio-data, Solution Architect Associate지향)
> **환경**: Next.js(App Router)+TS+Tailwind+Framer Motion / 현재 Vercel / graph-heavy / 정적+백엔드 혼합
> **도구**: Claude Code + 디자인(taste) skill
> **목표**: 정적 포폴을 라이브 데모까지 되는 "서버 있는 사이트"로. 첫 캡스톤 = SNP 라이브 데모.
> **방침**: 배포 집중 · 라이트하게 · 각 단계마다 "다른 옵션 & 다음에 배울 것" 프리뷰
> **트랙**: Lambda 먼저 → Fargate 승격

---

## 🧭 전체 지도 (이 강의가 짓는 것)

```
[방문자 브라우저 — 포폴 탭들]
   │
   ├─ 정적 탭  (Vercel, 브라우저에서 실행)                 ← Module 1~2
   │    • Hero / About
   │    • 인터랙티브 그래프 페이지
   │        (기존 정적 그래프 → CSV/JSON 데이터만 로드 → 상호작용 차트)
   │
   └─ 백엔드 탭 (API 필요)                                 ← Module 3~7
        • SNP 라이브 요약  (캡스톤)
        • RAG 앱          (다른 탭, 같은 배포 패턴 재사용)
              │
              ▼
        [FastAPI]
          ├─ Lambda + API Gateway   ← Module 4~6 (1차 배포)
          └─ Docker + Fargate       ← Module 7 (승격)
              │  (API 키는 여기 숨김 🔒)
              ▼
        [NCBI · Ensembl · Gemini · (RAG) 문서 임베딩·벡터검색]
```

**정적 페이지 vs 백엔드 페이지 구분** (이 강의의 핵심 관점):

| 종류 | 예시 | 어디서 도나 | 담당 모듈 |
|---|---|---|---|
| 정적 | Hero, About, 프로젝트 소개, **인터랙티브 그래프(CSV 로드)** | Vercel (브라우저) | M1, M2 |
| 백엔드 필요 | SNP 라이브 요약, **RAG 앱**, 키 감춰야 하는 것 | Lambda→Fargate | M3~M7 |

---

## 📚 커리큘럼 개요

| # | 모듈 | 한 줄 목표 | 산출물 | 예상 비용 |
|---|---|---|---|---|
| 0 | 오리엔테이션 | 멘탈모델 + 계정 준비 | AWS/Cloudflare 계정, 예산 알림 | $0 |
| 1 | 정적 포폴 배포 | Vercel에 라이브로 올리기 | 공개 `*.vercel.app` URL | $0 |
| 2 | 커스텀 도메인 | 내 도메인 연결 + HTTPS | `내이름.dev` 연결 | ~$12/년 |
| 3 | 백엔드 로컬 구동 | FastAPI로 SNP API 만들기 | localhost에서 도는 API | $0 |
| 4 | 서버리스 배포 | Lambda+API Gateway로 첫 배포 | 공개 API URL | ≈$0 |
| 5 | 프론트-백 연결 | 포폴에서 라이브 데모 완성 | 눌러서 되는 SNP 탭 | ≈$0 |
| 6 | 안전 & 관측 | 비용·로그·rate limit | 알림+로그+가드 | ≈$0 |
| 7 | Fargate 승격 | Docker 컨테이너로 재배포 | Fargate에 도는 API | ~$10~15/월 |
| 8 | 캡스톤 & 회고 | end-to-end + 다음 로드맵 | 완성된 프로젝트 탭 | — |

**총 비용 감**: 도메인 ~$12/년이 사실상 전부. Lambda 구간은 ≈$0, Fargate로 승격할 때만 월 $10~15. (예산 OK라 했으니 승격까지 밀어붙여도 부담 적음.)

---

## Module 0 — 오리엔테이션 & 계정 준비

**목표**: 전체 그림 이해 + 사고 안 나게 안전장치부터.

**실습**
1. 위 "전체 지도"를 보고 내 포폴의 어떤 페이지가 정적/백엔드인지 종이에 분류.
2. **일반 AWS 계정** 생성 → **Free 플랜** 선택 (신용카드 등록).
3. **AWS Educate**를 .edu 이메일로 별도 등록 → $100 크레딧 + 랩 확보.
4. **Billing → Budgets**에서 예산 알림 $5 설정 (제일 먼저!).
5. **Cloudflare** 계정 생성 (도메인 등록·DNS용).

**산출물**: 계정 3개(AWS 일반/Educate, Cloudflare) + 예산 알림 활성화.

> 🔎 **다른 옵션 프리뷰**: 지금은 루트 계정으로 시작하지만, 실무에선 **IAM 사용자/역할**을 따로 만들어 루트를 안 씀. → *다음에 배울 것: IAM, 최소권한 원칙 (M6에서 맛보기).*

---

## Module 1 — 정적 페이지 추가 & 배포 (Vercel)

> 메인 페이지는 이미 게시됨. 이 모듈은 **설명 + 인터랙티브 그래프가 있는 "두 번째 정적 페이지"**를 추가하고 배포 루프를 익히는 것.

**목표**: 기존에 만들어둔 정적 그래프를 **CSV/JSON 데이터만 불러와 상호작용되는 차트**로 바꿔 두 번째 페이지에 게시. graph-heavy 톤 유지, 백엔드 없이 브라우저에서.

**사전지식**: Git, GitHub 리포 하나.

**실습**
1. Claude Code로 두 번째 정적 페이지 scaffold (설명 텍스트 + 차트 섹션).
2. 기존 정적 그래프를 **데이터 소스(CSV/JSON)로 분리** → Recharts 등으로 **인터랙티브 차트**(hover·필터·줌) 렌더. (API 없이 정적 데이터 파일만.)
3. 빌드 점검 `npm run build` → GitHub push → **Vercel 자동 배포**.
4. **Preview Deploy** 체험: 브랜치 하나 파서 push → PR마다 미리보기 URL 생기는 것 확인.
5. 디자인(taste) skill로 폴리시 후 다시 push → 자동 재배포 관찰.

**산출물**: 인터랙티브 그래프가 있는 두 번째 정적 페이지 라이브 + "push하면 자동 배포" 루프 체득.

> 🔎 **다른 옵션 프리뷰**: Vercel 대신 **Netlify / Cloudflare Pages / GitHub Pages**도 정적 배포 가능. Next.js는 Vercel이 가장 매끄러움. → *다음에 배울 것: 정적 export vs SSR 차이 (M7 근처).*

---

## Module 2 — 커스텀 도메인 & HTTPS (Cloudflare)

**목표**: `*.vercel.app` → 내 도메인.

**실습**
1. Cloudflare Registrar에서 도메인 구매 (**.dev** 또는 **.com** 추천, 원가·갱신 안정).
2. Vercel 프로젝트에 도메인 추가 → Cloudflare에서 **DNS 레코드** 설정.
3. **HTTPS(자동 SSL)** 적용 확인 — `.dev`는 HTTPS 강제라 자동.
4. `www` → 루트 리다이렉트 정리.

**산출물**: `https://내이름.dev`로 접속되는 포폴.

> 🔎 **다른 옵션 프리뷰**: AWS로 도메인/ DNS를 통일하고 싶으면 **Route 53**(hosted zone 월 $0.50)도 있음. 지금은 Cloudflare가 싸고 쉬움. → *다음에 배울 것: DNS 레코드 타입(A/CNAME/TXT), Route 53.*

---

## Module 3 — 백엔드 로컬 구동 (FastAPI)

**목표**: SNP API를 내 노트북에서 먼저 돌려 성공시키기. (아직 클라우드 X)

**사전지식**: Python 기초 (있음). BIBI 원본 로직 재사용.

> 📌 **병행 작업 (강의 밖, 그러나 필요)**: BIBI 원본 Streamlit UI는 버리고, **프론트를 포폴 톤(dark hero→light body, liquid glass, blue accent)에 맞춰 재작성**. 이건 M5의 SNP 탭으로 흡수됨 — 즉 강의를 따라가는 게 곧 리라이트임. 별도 작업 아님.

**실습**
1. Claude Code로 FastAPI 프로젝트 scaffold: 엔드포인트 `GET /summary?rs=6311`.
2. BIBI의 `get_summary` 로직 이식 — 단, Ensembl은 **HTML 스크래핑 대신 REST JSON API**로 교체 (의존성 축소).
3. **시크릿 분리**: `GEMINI_API_KEY`를 코드가 아닌 `.env`(환경변수)로. `.gitignore` 확인.
4. `uvicorn`으로 로컬 실행 → 브라우저/`curl`로 `rs6311` 응답 확인.
5. 입력 검증 정리 (원본 UI의 blank/isalpha 버그 개선).

**산출물**: localhost에서 요약 JSON 반환하는 API + 키가 코드에 없는 구조.

> 🔎 **다른 옵션 프리뷰**: 백엔드 프레임워크는 **Flask / Node(Express)**도 가능. Python 강점 + bio 스택 정렬 때문에 FastAPI 채택. → *다음에 배울 것: async, Pydantic 스키마, OpenAPI 자동 문서.*

---

## Module 4 — 서버리스 배포 (AWS Lambda + API Gateway) ⭐

**목표**: 첫 클라우드 배포. localhost API를 공개 URL로.

**실습**
1. FastAPI를 Lambda로 올리는 어댑터(**Mangum**) 적용 — Claude Code로 구성.
2. 배포 도구 선택: **AWS SAM** 또는 **Serverless Framework** (템플릿 하나로 Lambda+API Gateway 생성).
3. **환경변수(GEMINI_KEY)**를 Lambda 설정/Secrets에 등록 (코드엔 여전히 없음).
4. 배포 → **API Gateway 공개 URL** 획득 → `?rs=6311` 호출 성공.
5. **CloudWatch 로그**에서 첫 호출 로그 확인.

**산출물**: `https://xxx.execute-api.../summary?rs=6311` 라이브 API. 비용 ≈ $0 (Lambda 영구 무료 tier 안).

> 🔎 **다른 옵션 프리뷰**: 배포 자동화를 **IaC(Terraform/AWS CDK)**로 하면 재현·버전관리가 됨(진짜 SA 시그널). 지금은 SAM으로 가볍게. → *다음에 배울 것: IaC, 콜드스타트 최적화, Lambda 메모리 튜닝.*

---

## Module 5 — 프론트-백 연결 & 라이브 데모 완성 ⭐

**목표**: 포폴 SNP 탭에서 눌렀을 때 실제로 요약이 뜨게.

**실습**
1. 포폴에 **프로젝트 탭 구조** 구성 (상단 바에서 프로젝트 전환) — Claude Code + 디자인 skill.
2. SNP 탭: rs 입력 → M4의 API URL 호출 → 받은 요약을 마크다운/차트로 렌더 (graph-heavy 테마 반영).
3. **CORS**: API Gateway/Lambda가 **내 포폴 도메인만** 허용하도록 설정.
4. **BYOK 옵션**: "Use your own Gemini key" 입력칸 — 넣으면 client-side 직접 호출(내 quota 절약).
5. 로딩 스피너 + 에러 처리 + 캐싱 샘플(`rs6311`, `rs2068824`) 폴백.

**산출물**: `내이름.dev`에서 **눌러서 되는 라이브 SNP 데모**.

> 🔎 **다른 옵션 프리뷰**: 프론트-백 사이에 **API 계약(OpenAPI/타입 공유)**을 두면 협업·유지보수가 쉬움. → *다음에 배울 것: 타입 안전 API 클라이언트, 에러 바운더리.*

---

## Module 6 — 안전 & 관측 (라이트)

**목표**: "모르고 돈 새거나 남용당하는" 사고 방지 + 최소 모니터링.

**실습**
1. **Rate limit**: API Gateway **usage plan / throttling**으로 IP·키당 한도.
2. **비용 알림 재점검**: AWS Budgets + (선택) 이상 사용 알림.
3. **IAM 맛보기**: 루트 대신 **배포용 IAM 사용자** 하나 만들어 최소권한 부여.
4. **로그 읽기**: CloudWatch에서 에러/지연 확인하는 법.
5. **시크릿 정리**: 키를 **AWS Secrets Manager / Parameter Store**로 이관(선택).

**산출물**: throttling + 예산알림 + 로그 확인 루틴.

> 🔎 **다른 옵션 프리뷰**: 제대로 하면 **CI/CD(GitHub Actions로 push→자동 배포)**, **구조화 로깅/트레이싱**, **알람(SNS)**까지. 지금은 개념만. → *다음에 배울 것: GitHub Actions 파이프라인, IAM 역할, 관측성(observability).*

---

## Module 7 — Fargate 승격 (Docker) ⭐

**목표**: "언제·왜 서버리스에서 컨테이너로 올리나"를 몸으로. Docker 스킬 확보.

**언제 승격? (판단 훈련)**: 콜드스타트가 거슬릴 때 / 무거운 의존성(bio 라이브러리) / 상시 실행 / 긴 처리시간. ← SA의 핵심은 이 **판단**.

**실습**
1. FastAPI에 **Dockerfile** 작성 → 이미지 빌드 → **로컬 컨테이너로 실행** 확인.
2. 이미지를 **AWS ECR**에 push.
3. **ECS Fargate** 서비스로 배포 (task 정의, 0.25 vCPU/0.5GB 최소 구성).
4. API Gateway/ALB 앞단 연결 → 포폴은 **URL만 교체**하면 끝(백엔드 교체 투명성 체험).
5. 비용 관찰: 상시 실행이라 월 $10~15 발생 → **필요 없으면 desired count 0**으로 끄는 습관.

**산출물**: Docker 이미지 + Fargate에 도는 동일 API. "서버리스↔컨테이너 승격" 경험.

> 🔎 **다른 옵션 프리뷰**: 컨테이너 오케스트레이션의 끝판은 **EKS(Kubernetes)** — 근데 웹앱엔 과설계. K8s가 정당한 곳은 **Track 2의 Nextflow/AWS Batch 파이프라인**. → *다음에 배울 것: ECS 서비스 오토스케일, ALB, 그리고 Track 2에서 Batch/Nextflow.*

---

## Module 8 — 캡스톤 & 회고

**목표**: 전부 이어 붙이고, 포폴 언어로 정리, 다음 로드맵.

**실습**
1. **End-to-end 리허설**: `내이름.dev` → SNP 탭 → 라이브 요약 → BYOK까지 시연.
2. **프로젝트 탭 케이스 스터디** 작성: 문제 / 파이프라인 다이어그램(rs→소스→AI) / 스택 / 라이브 데모 / GitHub 링크.
3. **아키텍처 다이어그램**을 포폴에 삽입 (이 사이트가 graph-heavy니까 배포 구조 자체도 볼거리).
4. **회고**: "왜 Lambda로 시작해 Fargate로 갔나"를 한 문단으로 — 이게 SA 인터뷰 답변이 됨.

**산출물**: 완성된 SNP 프로젝트 탭 + 재사용 가능한 프로젝트 탭 템플릿.

---

## 🔁 확장: 두 번째 백엔드 탭 — RAG 앱

SNP 데모로 **M3~M7 배포 패턴**을 한 번 익히면, RAG 앱은 "다른 탭 + 같은 파이프라인"으로 재사용할 수 있어. 새로 배우는 건 RAG 로직뿐, 배포는 이미 아는 길.

- **프론트**: 포폴에 RAG 탭 추가 (질문 입력 → 답변 렌더). M5의 프로젝트 탭 템플릿 재사용.
- **백엔드**: FastAPI 엔드포인트 하나 더 → **같은 Lambda→Fargate 경로**로 배포.
- **데이터**: 문서 임베딩 + 벡터 검색(예: 논문 / 마이크로바이옴 문서) → LLM 답변.
- **학습 포인트**: RAG는 무거운 의존성·긴 처리시간이 생기기 쉬워 **Fargate 승격의 자연스러운 명분**이 됨 (M7 판단 훈련과 직결).

즉 **SNP = 서버리스 맛보기, RAG = 컨테이너 승격 정당화.** 두 탭이 합쳐져 "판단할 줄 아는 SA" 스토리를 완성해.

---

## 🗺️ 이 강의 이후 로드맵 (프리뷰)

배포에 익숙해지면 여기서 확장:

- **CI/CD**: GitHub Actions로 push → 자동 테스트·배포.
- **IaC**: Terraform 또는 AWS CDK로 인프라를 코드로 (SA 포폴 핵심).
- **관측성**: 구조화 로깅, 대시보드, 알람.
- **Track 2 (bio 특화 인프라)**: **RNA ChIP-seq / Microbiome Nextflow 파이프라인**을 **AWS Batch**로 — 여기서 헤비 인프라(병렬 배치, 필요시 K8s)가 authentic하게 정당화됨.

각 항목은 "필요해질 때 하나씩" — 지금 다 하려고 하지 말 것.

---

## 💰 비용 요약

| 항목 | 비용 | 비고 |
|---|---|---|
| Vercel (정적) | $0 | Hobby 플랜 |
| 도메인 (.dev/.com) | ~$12/년 | Cloudflare 원가 |
| Lambda + API Gateway | ≈$0~1/월 | 영구 무료 tier 내 |
| Gemini API | $0 | free tier + BYOK 폴백 |
| Fargate (승격 시) | ~$10~15/월 | 안 쓸 땐 0으로 끄기 |
| **초기 합계** | **사실상 도메인 값** | Fargate 승격 전까지 |

---

## ✅ 진행 체크리스트

- [ ] M0: AWS(일반+Educate)·Cloudflare 계정, 예산 알림
- [ ] M1: Vercel 라이브 URL
- [ ] M2: 커스텀 도메인 + HTTPS
- [ ] M3: FastAPI 로컬 구동 + 시크릿 분리
- [ ] M4: Lambda+API Gateway 공개 API
- [ ] M5: 포폴 라이브 SNP 데모 + BYOK
- [ ] M6: rate limit·예산알림·로그·IAM 맛보기
- [ ] M7: Docker→ECR→Fargate 승격
- [ ] M8: 캡스톤 시연 + 케이스 스터디 + 회고
- [ ] (확장) RAG 탭: 같은 M3~M7 패턴으로 두 번째 백엔드 앱
