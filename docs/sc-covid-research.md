# sc-covid 분석 리서치 노트

포트폴리오 사이트에 인터랙티브 페이지로 옮기기 위해, 기존 `ssolh2906/sc-covid` 레포를 분석한 문서. 원본 분석의 내용 · 데이터 · 정확한 수치 · 산출물을 정리하고, 인터랙티브화할 때 필요한 재료를 뽑아 둔다. (코드 작성 전 단계)

원본 레포: https://github.com/ssolh2906/sc-covid

---

## 1. 프로젝트 한 줄 요약

CELLxGENE Census의 혈액 single-cell RNA-seq 데이터 10만 세포(COVID-19 5만 + 건강 5만)를 이용해, COVID-19가 말초혈액(PBMC)의 면역세포 구성을 어떻게 바꾸는지 UMAP으로 시각화한 분석.

**핵심 메시지:** COVID-19 혈액은 급성 바이러스 감염의 전형적 패턴을 보인다 — 활성화된 effector 세포(B cell, CD8+ T cell, classical monocyte, plasmablast)는 팽창하고, 안정 상태의 naive/memory 세포는 고갈된다.

---

## 2. 데이터 & 방법론

### 데이터 소스
- **CELLxGENE Census** (Chan Zuckerberg Initiative), stable LTS `2025-11-08`
- 라이선스: CC-BY 4.0
- Organism: Homo sapiens
- 필터: `tissue_general == 'blood'`, `disease in ['normal', 'COVID-19']`, `is_primary_data == True` (중복 제거)
- **balanced sampling**: 각 condition에서 무작위 5만 세포 → 총 10만 세포 (seed 42)

### 데이터 규모 (최종 샘플)
| 항목 | 값 |
|------|-----|
| 총 세포 | 100,000 |
| COVID-19 세포 | 50,000 |
| 건강(normal) 세포 | 50,000 |
| 고유 cell type | 131 |
| 고유 donor | 2,680 (COVID 528 / normal 2,153) |
| 저장 유전자 | 3개 (marker gene만) |
| embedding | scVI, 50차원 |

### 방법 (Path B — pre-computed embedding 기반)
전통적인 raw count → normalize → HVG → PCA 경로 대신, Census가 제공하는 **scVI embedding**(batch-corrected, ~50dim)을 바로 받아 UMAP을 계산했다. 훨씬 빠르고 batch/assay 효과를 embedding이 이미 보정한다는 장점.

1. metadata만 먼저 조회해 sanity check (조건별 세포 수, cell type, assay, donor)
2. balanced subsample 후 `get_anndata()`로 scVI embedding + marker gene 3개(`CD14`, `MKI67`, `IGHG1`) fetch
3. `sc.pp.neighbors(use_rep="scvi", n_neighbors=15)` → `sc.tl.umap(min_dist=0.3, random_state=42)`
4. 6종 plot 생성

### 재현 스택
`cellxgene-census`, `scanpy`, `numpy`, `pandas`, `matplotlib`. 스크립트 3개(`01_download_data.py`, `02_data_sanity_check.py`, `03_umap_visualization.py`).

---

## 3. 핵심 결과 (차트에 그대로 쓸 정확한 수치)

### 3-1. Cell type 비율 & fold change (COVID / Normal)

`03_visualization_output.txt`에서 추출. **proportion은 각 condition 내 비율**, fold_change는 (COVID+0.001)/(normal+0.001). 인터랙티브 bar chart의 원천 데이터.

| Cell type | COVID-19 | Normal | Fold change | 방향 |
|-----------|---------:|-------:|------------:|------|
| mature alpha-beta T cell | 0.0580 | 0.0036 | **12.94** | COVID↑ |
| B cell | 0.1344 | 0.0209 | **6.17** | COVID↑ |
| CD8+ alpha-beta T cell | 0.1270 | 0.0203 | **6.01** | COVID↑ |
| classical monocyte | 0.1112 | 0.0184 | **5.77** | COVID↑ |
| CD4+ alpha-beta T cell | 0.0999 | 0.0256 | **3.79** | COVID↑ |
| CD4+ alpha-beta memory T cell | 0.0210 | 0.0052 | **3.52** | COVID↑ |
| monocyte | 0.0154 | 0.0056 | 2.49 | COVID↑ |
| natural killer cell | 0.0483 | 0.0316 | 1.51 | COVID↑ |
| CD14+ monocyte | 0.0409 | 0.0356 | 1.14 | ≈ |
| Other | 0.1563 | 0.1610 | 0.97 | ≈ |
| CD14+CD16− classical monocyte | 0.0611 | 0.0858 | 0.72 | Normal↑ |
| CD16+CD56-dim NK cell | 0.0296 | 0.0591 | 0.51 | Normal↑ |
| naive B cell | 0.0202 | 0.0477 | 0.44 | Normal↑ |
| memory B cell | 0.0048 | 0.0212 | 0.26 | Normal↑ |
| naive CD8+ alpha-beta T cell | 0.0123 | 0.0521 | 0.25 | Normal↑ |
| naive CD4+ alpha-beta T cell | 0.0348 | 0.1620 | 0.22 | Normal↑ |
| mucosal invariant T cell (MAIT) | 0.0040 | 0.0242 | 0.20 | Normal↑ |
| central memory CD4+ T cell | 0.0135 | 0.1032 | 0.14 | Normal↑ |
| effector memory CD8+ T cell | 0.0050 | 0.0478 | 0.12 | Normal↑ |
| CD14-low CD16+ monocyte | 0.0016 | 0.0214 | 0.12 | Normal↑ |
| effector memory CD4+ T cell | 0.0006 | 0.0474 | **0.03** | Normal↑ |

**Plasmablast**(rare, grouped): 총 398개 중 COVID 362 / normal 36 → 약 **10x** 팽창.

### 3-2. 해석 요약
- **팽창 (COVID↑):** mature αβ T cell(~13x), B cell(6x), CD8+ T cell(6x), classical monocyte(6x), plasmablast(10x)
- **고갈 (Normal↑):** effector memory CD4+ T cell(~30x 고갈), central memory CD4+ T(7x), naive CD4+ T(5x), naive CD8+ T(4x), non-classical monocyte(8x)
- **스토리:** naive/memory 세포가 effector로 분화하며 안정 pool이 비고, CD8+ 세포독성 T cell이 팽창, monocyte가 patrolling(non-classical)→inflammatory(classical)로 이동, plasmablast가 항체 생산을 위해 급증.

### 3-3. Marker gene 검증 (3개)
| Gene | 의미 | 검출 세포 | % | 관찰 |
|------|------|---------:|----:|------|
| CD14 | monocyte marker | 19,367 | 19.4% | monocyte cluster에 집중 |
| MKI67 | proliferation | 1,585 | 1.6% | 분열 중 세포 소수 cluster |
| IGHG1 | IgG 항체 | 4,287 | 4.3% | plasmablast cluster에서 강함 (max 2,982) |

### 3-4. 품질 & batch
scVI embedding NaN 0개(완전), assay는 10x 계열이 다수(3' v3 35%, 5' v2 22%, 5' v1 19% 등 18종)지만 scVI가 batch를 보정해 UMAP은 assay가 아닌 생물학적 신호로 구조화됨(assay diagnostic plot으로 확인).

---

## 4. 산출된 Figure (6종)

원본 `results/figures/`에 PNG로 존재. 인터랙티브 페이지에서 대체·재현할 대상.

| 파일 | 내용 | 인터랙티브화 방향 |
|------|------|------|
| `umap_celltype.png` | cell type별 UMAP (20개 major + Other) | 산점도, hover로 cell type / 범례 토글 |
| `umap_disease.png` | COVID(빨강) vs Normal(파랑) overlay | 토글/투명도 슬라이더 |
| `umap_split.png` | 같은 좌표, condition별 밀도 2패널 | 좌우 비교 뷰 |
| `celltype_proportions.png` | condition별 cell type 비율 막대 | **정렬 가능한 인터랙티브 bar chart** (핵심) |
| `umap_markers.png` | CD14/MKI67/IGHG1 발현 UMAP | marker 선택 드롭다운 + colormap |
| `umap_assay.png` | assay별 batch 진단 | 보조/부록 |

> **주의:** 정적 PNG는 UMAP 좌표(2D 산점)를 담고 있지만, 인터랙티브 산점도를 만들려면 세포별 `X_umap` 좌표 + label CSV가 필요하다. 현재 레포엔 좌표 데이터가 export되어 있지 않음 → 5장 참고.

---

## 5. 인터랙티브화에 필요한 자산 (gap 분석)

포트폴리오에 "톤 맞춰 인터랙티브"로 넣으려면 아래가 필요:

**이미 있음**
- 3-1의 비율/fold change 테이블 → bar chart는 **추가 데이터 없이 즉시 구현 가능**
- 6종 PNG (fallback 또는 정적 표시용)
- 방법론/해석 텍스트 (interpretation.md, data_report.md)

**없음 → 생성 필요 (Solhee가 원본 환경에서 export하거나, 재현 필요)**
- UMAP 산점도용 per-cell CSV: `UMAP1, UMAP2, cell_type, disease, (marker 발현값)`
  - 10만 행은 웹에 과함 → **다운샘플(예: 조건별 8~15K = 총 2~3만) 권장**, 또는 hexbin/밀도 집계
- Census 원본 데이터는 gitignore(`data/*.h5ad`)라 레포엔 없음. 재현하려면 `cellxgene-census`로 재다운로드(~10분) 필요

**결정 필요 (계획.md에서 다룰 것)**
- 인터랙티브 UMAP을 실제 산점도로 갈지 vs. PNG + 인터랙티브 bar chart 조합으로 갈지 (데이터 export 가능 여부에 좌우)
- 차트 라이브러리 (사이트 스택과 호환: React 19 + Tailwind v4)

---

## 6. 포트폴리오 사이트 스택 (톤 매칭용 참고)

Comment: 컬러셋 등 디자인 세부사항은 taste skill 이 앞서 만든 사이트와 맞춰서 알아서 적당히 구현하면 됨. 강조색이나 색상구분이 필요한 그래프는 필요한대로 다양한 색상 사용 가능. 
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**, **framer-motion** (스크롤 parallax / stagger 애니메이션)
- 구조: `src/app/page.tsx` → `Nav` + `Hero` + `About`. 컴포넌트는 `src/components/{hero,about}/`
- 톤: 다크 hero(`#050912`), 미니멀, 부드러운 fade/slide 모션
- 원본 분석 팔레트: COVID `#E63946`(빨강) / Normal `#457B9D`(파랑) — 브랜드 톤에 맞춰 재조정

---

## 7. 원본 분석의 caveat (페이지에 명시 권장)

1. **Annotation 해상도 편차:** 일부 COVID 데이터셋은 넓게("B cell"), 건강 데이터셋은 세밀하게("naive B cell") 라벨링 → 넓은 카테고리의 fold change가 과장될 수 있음.
2. **중증도 정보 없음:** COVID 샘플의 mild/moderate/severe 구분이 없어, 일부 중증 환자가 shift를 주도했을 가능성.
3. **횡단면 스냅샷:** 시계열이 아니므로 고갈된 naive 세포의 회복 여부는 알 수 없음.
4. `disease` 필터가 복합 라벨(`'COVID-19 || diabetes'`)은 제외 → 단일 질환 세포만 포함(의도된 한계).

---

## 8. 다음 단계

이 문서를 근거로 `계획.md`(task 2) 작성:
- 페이지 구성/IA, 어떤 차트를 인터랙티브로, 데이터 export 전략, 라이브러리 선택, 사이트 톤 통합, 구현 순서.
