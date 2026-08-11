# sc-covid → 포트폴리오 인터랙티브화: 데이터 export 지시문

이 문서를 `ssolh2906/sc-covid` 레포(원본 분석 환경)에서 실행하세요. 목적은 포트폴리오 사이트에 **인터랙티브 UMAP 산점도 + bar chart**를 넣기 위한 웹용 데이터 파일을 만드는 것입니다. 분석 로직은 바꾸지 말고, 기존 결과를 웹이 먹을 수 있는 경량 포맷으로 **export만** 하면 됩니다.

---

## 배경 (왜 필요한가)

- 원본 분석은 PNG 6장 + 통계 텍스트만 산출함. 정적 이미지라 인터랙티브로 못 씀.
- 인터랙티브 산점도를 만들려면 **세포별 UMAP 좌표 + 라벨 + marker 발현값**이 CSV/JSON으로 필요.
- 10만 세포 전부는 웹에 과함 → **다운샘플** 후 export.
- bar chart용 비율/fold change 수치는 이미 계산돼 있으나, 프론트가 바로 읽도록 **machine-readable JSON**으로 재출력.

---

## 전제 / 재현

1. `data/covid_vs_healthy_blood.h5ad`(10만 세포, scVI embedding + marker 3종)가 있으면 그걸 사용.
2. 없으면 `scripts/01_download_data.py`를 먼저 실행해 재생성(~10분, `cellxgene-census` 필요).
3. UMAP은 **기존 PNG와 동일하게** 나오도록 `03_umap_visualization.py`와 **똑같은 파라미터**로 재계산:
   - rare cell type grouping: 전체의 **1% 미만은 `Other`** (기존과 동일, major ~20종)
   - `sc.pp.neighbors(use_rep="scvi", n_neighbors=15, metric="euclidean")`
   - `sc.tl.umap(min_dist=0.3, random_state=42)`
   - marker는 `log1p(raw counts)` (library-size norm 없이, 기존과 동일)

> 목표는 새 분석이 아니라 **기존 결과의 재현 + export**. seed/파라미터를 절대 바꾸지 말 것.

---

## 만들어야 할 파일 (총 3개 JSON + PNG 복사)

모두 `export/` 폴더에 저장한 뒤, 이 폴더째로 전달해 주세요.

### 1. `export/umap_points.json` — 인터랙티브 산점도용 (핵심)

**다운샘플:** 각 condition에서 **동일 비율로 무작위 추출**(seed 42). condition별 밀도 차이(=분석의 핵심 메시지)를 보존해야 하므로 cell type별로 균등화하지 말 것. 목표 크기: **condition당 ~12,000 → 총 ~24,000 행** (비율 약 24%). 파일이 5MB 넘으면 비율을 낮춰 총 ~20,000으로.

**스키마 (행 배열, 키는 짧게 = 용량 절약):**
```json
[
  { "x": 3.214, "y": -1.087, "ct": "B cell", "d": "COVID-19",
    "cd14": 0.0, "mki67": 0.0, "ighg1": 1.61 }
]
```
| 키 | 내용 | 포맷 |
|----|------|------|
| `x`, `y` | UMAP1, UMAP2 좌표 | float, **소수 3자리 반올림** |
| `ct` | `cell_type_grouped` (major 20종 + `Other`) | string |
| `d` | disease | `"COVID-19"` \| `"normal"` |
| `cd14`,`mki67`,`ighg1` | 각 marker의 `log1p(raw)` 발현값 | float, **소수 2자리** |

- 행 순서는 셔플(같은 condition이 뭉쳐 그려지면 위에 덮이므로).
- 좌표/발현값 반올림으로 용량을 줄일 것.

### 2. `export/celltype_proportions.json` — bar chart용

**다운샘플 말고 전체 10만 세포 기준**으로 계산(정확도). `cell_type_grouped` 기준 21개 항목.

**스키마:**
```json
{
  "rows": [
    { "cell_type": "mature alpha-beta T cell", "covid": 0.0580, "normal": 0.0036, "fold_change": 12.94, "direction": "COVID" }
  ],
  "plasmablast": { "covid": 362, "normal": 36, "note": "rare, grouped into Other; ~10x expansion" }
}
```
- `covid`, `normal`: 각 condition 내 비율 (합 1). 소수 4자리.
- `fold_change`: `(covid + 0.001) / (normal + 0.001)`. 소수 2자리.
- `direction`: `"COVID"`(>1.2) / `"normal"`(<0.83) / `"neutral"`(그 사이).

### 3. `export/summary.json` — 메타 & 색 스케일

```json
{
  "n_cells_total": 100000,
  "n_covid": 50000,
  "n_normal": 50000,
  "n_cell_types_raw": 131,
  "n_major_types": 20,
  "n_donors": 2680,
  "n_donors_covid": 528,
  "n_donors_normal": 2153,
  "census_version": "2025-11-08",
  "downsample_n": 24000,
  "markers": {
    "CD14":  { "meaning": "monocyte marker",  "vmax_p99": 0.0, "pct_detected": 19.4 },
    "MKI67": { "meaning": "proliferation",    "vmax_p99": 0.0, "pct_detected": 1.6 },
    "IGHG1": { "meaning": "IgG antibody / plasmablast", "vmax_p99": 0.0, "pct_detected": 4.3 }
  },
  "note": "markers were pre-selected from known biology (hardcoded), NOT data-driven / differential expression"
}
```
- `vmax_p99`: 각 marker `log1p` 값의 **99 percentile**. 프론트에서 color scale 상한으로 써야 기존 PNG(`vmax="p99"`)와 톤이 맞음. 실제 계산해서 채울 것.

### 4. PNG 6장 복사 → `export/figures/`

`results/figures/`의 6개 PNG를 그대로 복사(fallback / 정적 참고용): `umap_celltype.png`, `umap_disease.png`, `umap_split.png`, `celltype_proportions.png`, `umap_markers.png`, `umap_assay.png`.

---

## 실행 방법

`scripts/04_export_for_web.py`를 새로 작성해 위 4개를 생성:
1. h5ad 로드(없으면 01 먼저) → cell type grouping → neighbors → UMAP (위 파라미터 그대로)
2. marker `log1p` 계산
3. condition별 동일 비율 다운샘플(seed 42) → `umap_points.json`
4. 전체 세포로 비율/fold change → `celltype_proportions.json`
5. p99 등 계산 → `summary.json`
6. PNG 복사
7. 콘솔에 각 파일 행 수 / 용량 출력

---

## 검증 (전달 전 셀프 체크)

- [ ] `umap_points.json` 행 수가 목표(~24K)와 맞고, `d` 값이 COVID/normal 두 종류뿐
- [ ] `ct` 고유값이 21개(major 20 + Other) 이내
- [ ] `celltype_proportions.json`의 `covid`/`normal` 각 합이 ≈1.0
- [ ] fold change 상위가 mature αβ T(~12.9), B cell(~6.2)로 리서치 노트와 일치
- [ ] `summary.json`의 `vmax_p99` 3개가 0이 아닌 실제 값으로 채워짐
- [ ] 전체 `export/` 폴더 용량이 웹에 부담 없는 수준(가급적 < 8MB, PNG 제외 < 5MB)

---

## 참고 (건드리지 말 것)

- 분석 파라미터·seed·필터 변경 불필요. 이건 재현 + export지 재분석이 아님.
- marker 3종(CD14/MKI67/IGHG1)은 **사전 지정**된 것. 
- 좌표계·색은 프론트에서 톤 맞춰 재조정하므로, 여기선 **원자료 값**만 정확히 내보내면 됨.
