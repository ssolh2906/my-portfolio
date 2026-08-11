# SNP Summary App (BIBI_Bioinformatics_hackathon) — 조사 노트

> 작성일: 2026-08-10
> 목적: 포트폴리오 프로젝트 탭에 넣기 위한 앱 분석. **코드 작성 없음.** 무엇을 하는 앱인지 / 어떻게 구현되어 있는지 / 어떤 로직이 어느 파일에 있는지 정리.
> 원본 위치: `my-portfolio/BIBI_Bioinformatics_hackathon/`
> 원격: `github.com/ssolh2906/BIBI_Bioinformatics_hackathon`

---

## 1. 한 줄 요약

사용자가 **rs id**(SNP 식별자)를 입력하면, **NCBI + Ensembl**에서 데이터를 모아 **Gemini AI**가 bioinformatician/과학자용 요약을 생성해주는 Streamlit 앱. Bioinformatics hackathon 결과물.

- **SNP** = Single Nucleotide Polymorphism (단일 염기 다형성)
- **rs id** = SNP의 표준 참조 번호 (예: `rs6311`)

---

## 2. 앱이 하는 일 (사용자 흐름)

1. 사용자가 rs 번호를 입력 (예: `6311`) — UI에서는 `rs` 접두어 없이 숫자만.
2. 입력 검증 (빈 값 / 문자 포함 여부 체크).
3. "Enter" 클릭 → 3개 소스에서 raw 데이터 fetch:
   - **NCBI Variation API** (JSON)
   - **Ensembl** phenotype 페이지 (HTML)
   - **Entrez SNP DB** (record)
4. 3개 결과를 하나로 합쳐 **Gemini(`gemini-2.0-flash-001`)**에 전달 → 사람이 읽기 좋은 마크다운 요약 반환.
5. 요약은: rs, gene name, chromosome, GRCh38 position, alleles, clinical significance, diseases + 데이터 출처 라인 포함.
6. 별도로 외부 DB **바로가기 링크**(NCBI / Ensembl / ClinVar) 제공.

---

## 3. 아키텍처 / 데이터 흐름

```
[Streamlit UI]  codes/streamlit_ui.py
      │  rs_input (숫자)
      ▼
[get_summary()]  codes/gemini_function.py   ← 오케스트레이터
      ├─ get_info_from_ncbi(rs)     codes/ncbi_api.py     → NCBI Variation API (JSON dict)
      ├─ get_info_from_ensembl(rs)  codes/get_ensembl.py  → Ensembl phenotype 페이지 (HTML text)
      └─ get_entrez_result(rs)      codes/entrez.py       → Entrez SNP record (easy_entrez)
      ▼
[SNP_to_genai()]  codes/gemini_function.py  → Gemini API 호출, system rules + prompt + 합친 데이터
      ▼
   마크다운 요약 텍스트 → UI에 st.markdown()으로 렌더
```

---

## 4. 파일별 상세 (어떤 로직이 어디 있나)

### `codes/streamlit_ui.py` — 프론트엔드 / 진입점 (52 lines)
- 앱 실행 진입점. `streamlit run streamlit_ui.py`로 구동.
- `st.title("SNP summary")`, 안내 텍스트, rs 번호 `st.text_input`.
- `hyperlinks()` 함수: NCBI / Ensembl / ClinVar 3개 컬럼 링크 버튼 생성. URL에 `rs_input`을 끼워 넣음.
  - NCBI: `https://www.ncbi.nlm.nih.gov/snp/?term=rs{rs}`
  - Ensembl: `https://www.ensembl.org/Homo_sapiens/Variation/Explore?...v=rs{rs}...`
  - ClinVar: `https://www.ncbi.nlm.nih.gov/clinvar/?term={rs}`
- "Enter" 버튼 클릭 시 입력 검증 후 `get_summary(rs_input)` 호출, 스피너 표시, 결과 `st.markdown`.
- **입력 검증 로직**: 빈 값 / `isalpha()`(문자만) 체크. (약간 버그성: `if`/`elif` 순서 때문에 blank 처리가 완벽하진 않음 — 포폴 재구현 시 정리 대상.)

### `codes/gemini_function.py` — 핵심 오케스트레이터 + AI 로직 (65 lines)
- **`get_summary(rs_input)`**: 3개 소스 fetch를 묶고 예외 처리. 이 앱의 "컨트롤러".
- **`SNP_to_genai(ncbi, ensembl, entrez)`**: Gemini 클라이언트 생성 및 호출.
  - `system_rules`: 제공된 데이터만 사용, 없으면 "Not in data", raw dict/html 그대로 반환 금지, 읽기 쉬운 요약 생성.
  - `prompt`: rs / gene / chromosome / GRCh38 position / alleles / clinical significance / diseases 요약 지시 + 데이터 출처 라인 + citation 있으면 추가 조사 지시.
  - model: `gemini-2.0-flash-001`, `temperature: 0`.
- API 키: 환경변수 `GEMINI_API_KEY`.

### `codes/ncbi_api.py` — NCBI 소스 (13 lines)
- `get_info_from_ncbi(rs)`: `https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/{rs}` GET → **JSON dict** 반환.

### `codes/get_ensembl.py` — Ensembl 소스 (20 lines)
- `get_info_from_ensembl(rs)`: Ensembl phenotype 페이지 GET → **HTML text** 반환 (파싱 안 하고 raw HTML을 그대로 Gemini에 넘김).
- `get_rs()`: Ensembl REST API(JSON) 실험용 함수 (메인 흐름엔 미사용, 참고용).

### `codes/entrez.py` — Entrez SNP 소스 (19 lines)
- `easy_entrez`의 `EntrezAPI`로 SNP DB fetch → record 반환.
- ⚠️ tool name / email이 placeholder(`'your-tool-name'`, `'e@mail.com'`)로 하드코딩됨.

### `disease.py` — 독립 실험 스크립트 (32 lines, 메인 앱 미연결)
- Biopython `Bio.Entrez`로 SNP XML fetch → `CLINICAL_SIGNIFICANCE` 태그 파싱해 clinical significance 출력.
- 메인 Streamlit 흐름과 **연결 안 됨** (별도 프로토타입/PoC로 보임).
- ⚠️ `Entrez.email`이 하드코딩(`heatherho@gmail.com`).

---

## 5. 기술 스택 / 의존성

- **Python** 3.9–3.13
- **Streamlit** (UI)
- **google-genai** (Gemini API, `gemini-2.0-flash-001`)
- **requests** (NCBI / Ensembl HTTP)
- **easy_entrez** (Entrez SNP)
- **Biopython** (`Bio.Entrez`, `disease.py`에서만)
- 환경변수: `GEMINI_API_KEY`

---

## 6. 데이터 소스 정리

| 소스 | 형식 | 무슨 데이터 | 파일 |
|---|---|---|---|
| NCBI Variation API | JSON | refsnp 상세 (allele, position 등) | `ncbi_api.py` |
| Ensembl phenotype page | HTML | phenotype/질병 연관 정보 | `get_ensembl.py` |
| Entrez SNP DB | record | SNP record | `entrez.py` |
| ClinVar | — | (UI 바로가기 링크만, fetch 안 함) | `streamlit_ui.py` |

---

## 7. 포폴 재구현 관점 메모

- 기존 Streamlit UI는 **구현이 거의 없음**(입력 1개 + 버튼 + 링크 3개 + 마크다운 출력). 포폴 테마(dark hero → light body, liquid glass, blue accent)에 맞춰 **처음부터 다시 만들어도 무방**. 디자인은 `src/` 내부 기존 컴포넌트 참조.
- 재구현 시 살릴 핵심 자산:
  - **파이프라인 컨셉**: rs id → 멀티소스(NCBI/Ensembl/Entrez) fetch → AI 요약. 이게 프로젝트의 핵심 스토리.
  - **외부 DB 딥링크** (NCBI/Ensembl/ClinVar) — 그대로 유용.
  - **AI 요약 프롬프트 설계** (`gemini_function.py`의 system_rules + prompt) — 재현/설명 가치 있음.
- 데모 방식 후보:
  - 실제 API 라이브 호출은 키/CORS 이슈 → 포폴에선 **미리 캐싱한 샘플 rs 결과**(예: rs6311, rs2068824)를 보여주는 정적 데모가 안전.
  - 데이터 소스 → 요약으로 이어지는 **파이프라인 다이어그램/그래프**가 이 포폴의 graph-heavy 테마와 잘 맞음.
- 정리 대상(원본 이슈): `streamlit_ui.py` 입력 검증 로직, 하드코딩된 email/tool name, Ensembl raw HTML을 그대로 LLM에 넘기는 부분.

### 대표 예시 rs id (데모/테스트용, 코드에 등장)
- `rs6311`, `rs2068824`
