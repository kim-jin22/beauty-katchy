# Beauty Katchy — AI 핵심 서비스 아키텍처

> 앱의 4대 핵심 서비스: **Fit Score** · **AI 스마트소싱** · **인플루언서 매칭** · **마케팅소스**  
> 각 서비스의 핵심 코드, LangChain 더미 구현, SQL 쿼리, EDA 근거를 정리합니다.

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [Fit Score (ML 기반 시장 적합도)](#2-fit-score)
3. [AI 스마트소싱 (LangChain RAG + GPT)](#3-ai-스마트소싱)
4. [인플루언서 매칭 (코사인 유사도 + LangChain)](#4-인플루언서-매칭)
5. [마케팅소스 (EDA + AI 캠페인 전략)](#5-마케팅소스)
6. [EDA 분석 근거 데이터 (H01–H03)](#6-eda-분석-근거)
7. [핵심 SQL 쿼리 모음](#7-핵심-sql-쿼리)
8. [LangChain 더미 구현 전체 코드](#8-langchain-더미-구현)
9. [데이터베이스 스키마 요약](#9-데이터베이스-스키마)

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                   React Native (Expo)                    │
│                                                          │
│  Brand Flow          Buyer Flow        Marketing Flow    │
│  ──────────          ─────────         ──────────────    │
│  Step1 → Step2       BuyerHome         MarketingSource   │
│  → Step3FitScore     BuyerAiMode  ──►  MarketingInfluencer│
│  → BrandInfluencer   BuyerList         (AI 캠페인 전략)  │
└──────────────┬──────────────┬───────────────────────────┘
               │   HTTPS      │
               ▼              ▼
┌─────────────────────────────────────────────────────────┐
│             FastAPI Backend (Railway)                    │
│                                                          │
│  /brand/*          /buyer/*         /api/products/*      │
│  ──────────        ─────────        ────────────────     │
│  Fit Score 산출    AI Chat (RAG)    Influencer 메시지    │
│  상품 등록         소싱 분석         AI 협업 제안         │
│  시장 데이터       마케팅소스 생성                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  LightGBM    │  │  LangChain   │  │  OpenAI       │  │
│  │  + SHAP      │  │  FAISS RAG   │  │  GPT-4o-mini  │  │
│  │  (Fit Score) │  │  (H03 EDA)   │  │  (텍스트생성)  │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  PostgreSQL (Supabase)   │
              │  product / pro_ing       │
              │  influencer / persona    │
              │  trend_timing / price    │
              │  ingredient_trend        │
              └─────────────────────────┘
```

**기술 스택 요약**

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React Native 0.81.5, Expo 54, React Navigation |
| 백엔드 | FastAPI, SQLAlchemy, Psycopg2 |
| AI/ML | LightGBM, SHAP, LangChain, OpenAI GPT-4o-mini |
| 벡터DB | FAISS (in-memory, HuggingFace Embeddings) |
| DB | PostgreSQL (Supabase Cloud) |
| 배포 | Railway (2개 서비스) |

---

## 2. Fit Score

> ML 기반 미국 시장 적합도 예측. LightGBM 분류 모델 + SHAP 설명성.

### 역할 흐름

```
브랜드 상품 등록 (Step1 → Step2 재료 선택)
        │
        ▼
POST /brand/analyze
  { product_name, price, category_detail_id, spf, ingredients[] }
        │
        ▼
MarketFitPredictor.predict()
  ┌─ 피처 엔지니어링 (~50개 피처)
  ├─ LightGBM 예측 (lgbm_final.pkl)
  ├─ SHAP top3 feature importance
  └─ 카테고리별 임계값 적용
        │
        ▼
{ score: 0~100, top_features: [{feature, value}×3] }
        │
        ▼
Step3FitScore.js — 애니메이션 카운터 + 피처 시각화
```

### 핵심 피처 구조 (predictor.py)

```python
FEATURE_GROUPS = {
    "가격": [
        "log_price",           # log(USD 공급가)
        "price_rank_in_cat",   # 카테고리 내 가격 분위
        "price_low",           # USD < 15 여부
        "price_mid",           # USD 15~40 여부
        "price_high",          # USD > 40 여부
    ],
    "카테고리": [
        "cat_skincare",        # category_main_id == 1
        "cat_cleansing",       # category_main_id == 2
        "cat_suncare",         # category_main_id == 3
        "cat_masks",           # category_main_id == 4
    ],
    "성분_트렌드": [
        "gt_niacinamide",      # 나이아신아마이드 포함 여부
        "gt_centella",         # 센텔라 포함
        "gt_ceramide",         # 세라마이드
        "gt_retinol",          # 레티놀
        "gt_peptide",          # 펩타이드
        "gt_exosome",          # 엑소좀 (최신 트렌드)
        "gt_pdrn",             # PDRN
        "niacinamide_position",# 성분표 내 순서 (낮을수록 고함량)
    ],
    "선케어": [
        "SPF_Index",           # SPF 수치
        "is_physical_filter",  # 무기자차 (zinc oxide/titanium dioxide)
        "has_chemical_filter", # 유기자차
        "spf_tier",            # SPF 50+ = tier 3
    ],
    "조합": [
        "combo_adenosine_niacinamide",  # 상위 조합
        "combo_vitc_tocopherol",
        "us_trend_ratio",      # 미국 트렌드 성분 비율
    ],
}

CATEGORY_THRESHOLDS = {
    "skincare":  0.35,
    "cleansing": 0.40,
    "suncare":   0.45,
    "masks":     0.38,
}
```

### 카테고리 ID 매핑

```python
CATEGORY_MAIN = {1: "스킨케어", 2: "클렌징", 3: "선케어", 4: "마스크팩"}

CATEGORY_DETAIL_ID = {
    # 스킨케어 (1~19)
    1: "스킨",   2: "토너",   3: "패드",   4: "앰플",   5: "세럼",
    6: "에센스", 7: "로션",   8: "에멀전", 9: "크림",   10: "젤크림",
    11: "밸런싱크림", 12: "수분크림", 13: "선세럼", 14: "아이크림",
    15: "오일",  16: "미스트", 17: "립케어", 18: "넥크림", 19: "기타스킨",
    # 클렌징 (20~34)
    20: "클렌징폼", 21: "클렌징오일", 22: "클렌징밤", 23: "클렌징워터",
    24: "클렌징젤", 25: "버블클렌저", 26: "클렌징크림", 27: "클렌징티슈",
    # 선케어 (35~38)
    35: "선크림", 36: "선스틱", 37: "선쿠션", 38: "선세럼",
    # 마스크팩 (39~70)
    39: "시트마스크", 40: "수면팩", 41: "필오프팩", 42: "워시오프팩",
}
```

### Fit Score 더미 응답 (프론트 폴백)

```javascript
// src/screens/Step1.brand/Step3FitScore.js
const SCORE_MAP = {
  101: 85,   // 아누아 클렌징오일
  102: 80,   // 아누아 클렌징폼
  103: 72,   // 센텔라 토너
  104: 68,   // 레티놀 세럼
};

const FALLBACK_RESULT = {
  score: 75,
  top_features: [
    { feature: "niacinamide_position", label: "나이아신아마이드", value: 0.21 },
    { feature: "price_mid",            label: "가격 경쟁력",      value: 0.17 },
    { feature: "cat_skincare",         label: "카테고리 인기도",  value: 0.14 },
  ],
  market_data: {
    avg_review_score: 4.3,
    product_count: 128,
    trend: "rising",
    yoy_pct: 12.5,
    price_min: 8.0,
    price_avg: 22.5,
    price_max: 68.0,
  },
};
```

---

## 3. AI 스마트소싱

> LangChain RAG(H03 EDA 기반) + OpenAI GPT-4o-mini 채팅 소싱 어드바이저.

### 역할 흐름

```
바이어 → BuyerAiMode.js (채팅 입력)
         │
         ▼
POST /buyer/ai-chat
  { query, category, buyer_needs }
         │
    ┌────┴─────────────────────────┐
    │  LangChain RAG 파이프라인    │
    │  1. query → FAISS 유사 검색  │
    │  2. H03 컨텍스트 + DB 데이터 │
    │  3. GPT-4o-mini 인사이트 생성│
    └────────────────┬─────────────┘
                     │
              + SQL 소싱 매칭
              (성분/카테고리 필터)
                     │
                     ▼
  { summary, trends[], keywords[], suppliers[], timing_insight }
                     │
                     ▼
         BuyerAiMode.js — 트렌드 바 애니메이션 + 공급사 카드
```

### LangChain RAG 핵심 구현 (backend/routers/buyer.py)

```python
# ── 의존성 ──────────────────────────────────────────────
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import Document
import os

# ── H03 EDA 경향 문서 (한국 → 미국 선행 트렌드) ──────────
# 아래 데이터는 EDA H03 분석에서 도출된 K-뷰티 성분 미국 진입 타이밍
H03_DOCS = [
    "PDRN: 한국→미국 선행 25개월. US YoY 73.0%. US 진입기. "
    "주목 키워드: 세포재생, 항염, 눈가 리프팅. "
    "미국 진입 최적 시점: 지금 소싱하면 12~18개월 내 피크.",

    "엑소좀 Exosome: 한국→미국 선행 34개월. US YoY 68.5%. US 초기 진입기. "
    "주목 키워드: 세포 재생, 피부 장벽, 노화 방지. "
    "미국에서 2025년 하반기~2026년 상반기가 소싱 골든타임.",

    "나이아신아마이드 Niacinamide: 한국→미국 선행 38개월. US YoY 42.0%. US 성장기. "
    "주목 키워드: 미백, 모공 축소, 피지 조절. "
    "미국 시장 가장 검증된 K-뷰티 성분—수요 안정적.",

    "센텔라아시아티카 Centella: 한국→미국 선행 30개월. US YoY 35.0%. US 성장기. "
    "주목 키워드: 진정, 트러블케어, 민감성. "
    "미국 진입기 → 2026년까지 지속 성장 예측.",

    "세라마이드 Ceramide: 한국→미국 선행 28개월. US YoY 29.0%. US 성숙기. "
    "주목 키워드: 피부 장벽 강화, 보습. 계절 무관 안정 수요.",

    "레티놀 Retinol: 한국→미국 선행 18개월. US YoY 22.0%. US 성숙기. "
    "주목 키워드: 주름 개선, 안티에이징. "
    "미국 기존 강자—가격 경쟁 치열, 포지셔닝 차별화 필요.",

    "펩타이드 Peptide: 한국→미국 선행 22개월. US YoY 31.0%. US 성장기. "
    "주목 키워드: 탄력, 콜라겐 합성. "
    "복합 펩타이드(예: 아르기렐린+마트리실) 포뮬라 선호 증가.",

    "AHA/BHA/PHA: 한국→미국 선행 20개월. US YoY 19.0%. US 성숙기. "
    "주목 키워드: 각질 관리, 저자극 산성 클렌징. "
    "PHA(글루코노락톤) 민감성 소비자 대체 성분으로 부상.",

    "어성초 Houttuynia: 한국→미국 선행 18개월. US YoY 55.0%. US 진입기. "
    "주목 키워드: 진정, 여드름, 피지 조절. "
    "한국 국민 성분→미국 트렌드 급등, 지금이 소싱 타이밍.",

    "무기자차 Physical Filter (Zinc Oxide / Titanium Dioxide): "
    "한국→미국 선행 15개월. US YoY 48.0%. 백탁 제로 포뮬라 수요 폭발. "
    "시어버터+징크옥사이드 조합 선케어 미국 Ulta 1위권 진입.",

    "글루타치온 Glutathione: 한국→미국 선행 32개월. US YoY 62.0%. US 진입기. "
    "주목 키워드: 미백, 항산화, 이너뷰티 연계. "
    "한국 초기 반응 폭발적—미국 2026년 본격 성장 예측.",
]

# ── 싱글톤 벡터스토어 + LLM (최초 요청 시 초기화) ────────
_h03_vs: FAISS | None = None
_h03_llm: ChatOpenAI | None = None

def _get_rag(db=None):
    """FAISS 벡터스토어와 GPT LLM을 지연 초기화하여 반환."""
    global _h03_vs, _h03_llm

    if not os.getenv("OPENAI_API_KEY"):
        return None, None

    if _h03_vs is None:
        # 정적 H03 문서 + DB 동적 성분 트렌드 결합
        dynamic_docs = _load_ingredient_trend_docs(db) if db else []
        all_docs = [Document(page_content=d) for d in H03_DOCS + dynamic_docs]

        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        _h03_vs = FAISS.from_documents(all_docs, embeddings)

    if _h03_llm is None:
        _h03_llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.65,
            max_tokens=180,
        )

    return _h03_vs, _h03_llm


def _load_ingredient_trend_docs(db) -> list[str]:
    """DB ingredient_trend 테이블에서 RAG 문서 생성."""
    rows = db.execute("""
        SELECT us_keyword, kr_keyword, us_stage, us_yoy_pct, lead_months
        FROM ingredient_trend
        WHERE us_yoy_pct IS NOT NULL
        ORDER BY us_yoy_pct DESC
        LIMIT 20
    """).fetchall()

    return [
        f"{r.kr_keyword} ({r.us_keyword}): 한국→미국 선행 {r.lead_months}개월. "
        f"US YoY {r.us_yoy_pct:.1f}%. 미국 {r.us_stage}."
        for r in rows
    ]


# ── 소싱 어드바이저 프롬프트 ─────────────────────────────
SOURCING_PROMPT = PromptTemplate(
    input_variables=["context", "query", "n_products", "category", "complaints"],
    template="""
당신은 BeautyBridge AI 소싱 어시스턴트입니다.
K-뷰티 성분 트렌드 데이터를 바탕으로 바이어에게 소싱 타이밍 인사이트를 제공합니다.

[트렌드 컨텍스트]
{context}

[바이어 질문]
{query}

[현황]
- 검색된 공급 상품 수: {n_products}개
- 카테고리: {category}
- 소비자 불만 키워드: {complaints}

위 정보를 바탕으로 2~3문장의 소싱 타이밍 인사이트를 한국어로 작성하세요.
숫자(개월, %, 날짜)를 반드시 포함하고, 지금 소싱해야 하는 이유를 구체적으로 제시하세요.
"""
)


# ── AI 채팅 엔드포인트 핵심 로직 ─────────────────────────
async def run_ai_chat(query: str, category: str, buyer_needs: list, db) -> dict:
    vs, llm = _get_rag(db)

    # 1. RAG: 유사 트렌드 문서 검색
    timing_insight = ""
    if vs and llm:
        similar_docs = vs.similarity_search(query, k=3)
        context = "\n".join([d.page_content for d in similar_docs])

        # 소비자 불만 조회 (unmet_needs 테이블)
        complaints = _get_complaints(db, category)

        chain = SOURCING_PROMPT | llm
        timing_insight = chain.invoke({
            "context": context,
            "query": query,
            "n_products": 10,
            "category": category,
            "complaints": ", ".join(complaints),
        }).content

    # 2. SQL: 성분/카테고리 매칭 공급사
    suppliers = _query_matched_suppliers(db, query, category)

    # 3. 트렌드 키워드 조회
    trends = _query_trends(db, category)

    return {
        "summary": timing_insight or FALLBACK_TIMING_INSIGHT.get(category, ""),
        "trends": trends,
        "suppliers": suppliers,
        "keywords": [t["keyword"] for t in trends[:5]],
    }
```

### AI 채팅 더미 응답 데이터 (프론트 폴백)

```javascript
// src/screens/Step2.buyer/BuyerAiMode.js

// 미리 정의된 바이어 니즈 시나리오
const BUYER_NEEDS = [
  {
    id: "sticky",
    label: "끈적임 해결",
    query: "끈적임 없는 보습 성분 추천해줘",
    keywords: ["히알루론산", "베타글루칸", "폴리글루타믹산"],
  },
  {
    id: "acne",
    label: "여드름 유발↓",
    query: "논코메도제닉 성분 위주 소싱",
    keywords: ["살리실산", "아젤라인산", "어성초"],
  },
  {
    id: "whitecast",
    label: "백탁 제로",
    query: "무백탁 선케어 소싱",
    keywords: ["나노징크", "투명 자외선차단", "플루이드 텍스처"],
  },
];

// 더미 소싱 AI 응답
const DEMO_AI_RESPONSE = {
  summary:
    "어성초 성분은 현재 한국에서 급성장 중이며 미국 대비 18개월 선행하고 있습니다. " +
    "US YoY 55% 성장률로 지금이 소싱 골든타임이며, " +
    "2025년 Q3~Q4 미국 피크 타이밍에 맞춰 3~4개월 전 선제 입고를 권장합니다.",
  trends: [
    { keyword: "어성초",   growth: "+55%", status: "hot",    bar: 0.92 },
    { keyword: "PDRN",    growth: "+73%", status: "hot",    bar: 0.98 },
    { keyword: "엑소좀",   growth: "+68%", status: "hot",    bar: 0.95 },
    { keyword: "나이아신아마이드", growth: "+42%", status: "normal", bar: 0.75 },
    { keyword: "세라마이드", growth: "+29%", status: "normal", bar: 0.58 },
  ],
  suppliers: [
    {
      product_id: 201,
      name: "어성초 77 히알루론산 수분 진정 토너",
      cert: "어성초추출물 77%, 히알루론산",
      score: 85,
      price_usd: 12.5,
      moq: 200,
      tier: 1,
      margin_rate: "42%",
    },
    {
      product_id: 202,
      name: "PDRN 리제너레이팅 앰플 30ml",
      cert: "PDRN 5ppm, 펩타이드 복합체",
      score: 91,
      price_usd: 28.0,
      moq: 100,
      tier: 1,
      margin_rate: "51%",
    },
    {
      product_id: 203,
      name: "센텔라 진정 크림 50ml",
      cert: "센텔라아시아티카 60%, 마데카소사이드",
      score: 78,
      price_usd: 15.0,
      moq: 300,
      tier: 2,
      margin_rate: "38%",
    },
  ],
  demo_supplier: {
    name: "어성초 77 히알루론산 수분 진정 토너",
    cert: "어성초추출물, 히알루론산",
    score: 85,
  },
};

// 트렌드 탐색 카테고리별 더미 데이터
const TRENDING_POOL = {
  전체: [
    { keyword: "어성초",   growth: "+55%", status: "hot" },
    { keyword: "PDRN",    growth: "+73%", status: "hot" },
    { keyword: "엑소좀",   growth: "+68%", status: "hot" },
    { keyword: "나이아신아마이드", growth: "+42%", status: "normal" },
    { keyword: "글루타치온", growth: "+62%", status: "hot" },
    { keyword: "세라마이드", growth: "+29%", status: "normal" },
    { keyword: "레티놀",   growth: "+22%", status: "normal" },
    { keyword: "펩타이드", growth: "+31%", status: "normal" },
    { keyword: "AHA/BHA", growth: "+19%", status: "normal" },
    { keyword: "무기자차", growth: "+48%", status: "hot" },
  ],
  선케어: [
    { keyword: "무백탁 자외선차단", growth: "+61%", status: "hot" },
    { keyword: "징크옥사이드",    growth: "+48%", status: "hot" },
    { keyword: "선세럼",         growth: "+44%", status: "hot" },
    { keyword: "물리+화학 복합",  growth: "+33%", status: "normal" },
  ],
  스킨케어: [
    { keyword: "나이아신아마이드", growth: "+42%", status: "normal" },
    { keyword: "PDRN",           growth: "+73%", status: "hot" },
    { keyword: "엑소좀 세럼",     growth: "+68%", status: "hot" },
  ],
};
```

---

## 4. 인플루언서 매칭

> 코사인 유사도 기반 인플루언서 DB 매칭 + AI 협업 메시지 자동 생성.

### 역할 흐름

```
바이어/브랜드 → 상품 선택
      │
      ▼
GET /buyer/influencers/{product_id}
  → SQL: cosine_score ≥ 0.6, category_main_id 필터
  → TOP 10 인플루언서 반환
      │
      ▼
MarketingInfluencer.js — 인플루언서 카드 목록
      │
      ▼ (선택 시)
GET /api/products/{product_id}/influencers/{influencer_id}/message
  → GPT-4o-mini: 협업 제안 메시지 생성
  → 3~4문장 + 핵심 수치 포함
```

### 인플루언서 매칭 SQL 쿼리

```sql
-- 1. 카테고리별 인플루언서 + 페르소나 JOIN 조회
SELECT DISTINCT ON (i.influencer_id)
    i.influencer_id,
    i.handle,
    i.profile_image_url,
    i.follower_range,
    i.platform,
    i.cosine_score,
    ip.persona_type,
    ip.h12_topic,
    ip.market_demand_pct,
    ip.tags,
    un.topic_label_kr   AS unmet_need,
    un.topic_pct        AS unmet_pct
FROM influencer i
JOIN influencer_persona ip
    ON ip.category_main_id = i.category_main_id
LEFT JOIN unmet_needs un
    ON un.category_main_id = i.category_main_id
WHERE i.category_main_id = :category_main_id
  AND i.cosine_score >= 0.6
ORDER BY i.influencer_id, i.cosine_score DESC
LIMIT 10;


-- 2. 상품별 인플루언서 매칭 (category_detail_id → category_main_id 변환)
SELECT
    i.influencer_id,
    i.handle,
    i.cosine_score,
    ip.persona_type,
    ip.market_demand_pct,
    ip.h12_topic          AS content_direction,
    ip.tags
FROM influencer i
JOIN influencer_persona ip ON ip.category_main_id = i.category_main_id
JOIN product p ON
    CASE
        WHEN p.category_detail_id BETWEEN 1 AND 19  THEN 1
        WHEN p.category_detail_id BETWEEN 20 AND 34 THEN 2
        WHEN p.category_detail_id BETWEEN 35 AND 38 THEN 3
        WHEN p.category_detail_id BETWEEN 39 AND 70 THEN 4
    END = i.category_main_id
WHERE p.product_id = :product_id
  AND i.cosine_score >= 0.6
ORDER BY i.cosine_score DESC
LIMIT 10;


-- 3. 인플루언서 소비자 불만(Unmet Needs) 조회
SELECT
    topic_label_kr,
    topic_pct,
    category_main_id
FROM unmet_needs
WHERE category_main_id = :category_main_id
ORDER BY topic_pct DESC
LIMIT 5;
```

### AI 협업 메시지 생성 (influencer.py)

```python
INFLUENCER_MSG_PROMPT = """
당신은 K-뷰티 글로벌 소싱 플랫폼의 AI 협업 매니저입니다.
아래 정보를 바탕으로 인플루언서에게 보낼 협업 제안 메시지를 작성하세요.

[인플루언서 정보]
- 핸들: {handle}
- 페르소나: {persona_type}
- 주요 콘텐츠: {h12_topic}
- 팔로워 비율 시장 수요: {market_demand_pct}%

[상품 정보]
- 상품명: {product_name}
- 핵심 성분: {key_ingredients}
- 해결하는 소비자 불만: {unmet_need}
- Fit Score: {score}/100

3~4문장으로 협업 제안 메시지를 작성하세요.
수치(Fit Score, 시장 수요 %, 핵심 성분)를 자연스럽게 포함하고,
해당 인플루언서의 콘텐츠 방향과 상품의 연결점을 강조하세요.
"""

async def generate_influencer_message(
    product_id: int, influencer_id: int, db
) -> str:
    product = db.query(Product).filter_by(product_id=product_id).first()
    influencer = _fetch_influencer(db, influencer_id)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, max_tokens=200)
    prompt = INFLUENCER_MSG_PROMPT.format(
        handle=influencer["handle"],
        persona_type=influencer["persona_type"],
        h12_topic=influencer["h12_topic"],
        market_demand_pct=influencer["market_demand_pct"],
        product_name=product.product_name,
        key_ingredients=_top3_ingredients(db, product_id),
        unmet_need=influencer.get("unmet_need", ""),
        score=product.score or 75,
    )
    response = await llm.ainvoke(prompt)
    return response.content
```

### 인플루언서 더미 데이터 (MarketingInfluencer.js)

```javascript
const INFLUENCER_DUMMY = [
  {
    influencer_id: 1,
    handle: "marisajmakeup",
    persona_type: "무백탁 전문",
    platform: "Instagram",
    follower_range: "5만",
    cosine_score: 0.924,
    category_main_id: 3,       // 선케어
    market_demand_pct: 14.0,
    content_direction: "백탁 없는 선크림 전문 리뷰",
    h01_risk: "백탁 현상 해결",
    tags: ["#노백탁", "#선크림추천", "#물리자차"],
    unmet_need: "백탁 현상",
    unmet_pct: 28.4,
  },
  {
    influencer_id: 2,
    handle: "sarahpalmyra",
    persona_type: "보습데일리",
    platform: "TikTok",
    follower_range: "12만",
    cosine_score: 0.880,
    category_main_id: 1,       // 스킨케어
    market_demand_pct: 22.5,
    content_direction: "매일 보습 루틴, 세라마이드 중심",
    h01_risk: "끈적임 없는 장벽 강화",
    tags: ["#세라마이드", "#보습루틴", "#데일리스킨"],
    unmet_need: "끈적임",
    unmet_pct: 19.2,
  },
  {
    influencer_id: 3,
    handle: "glowwithava",
    persona_type: "트러블케어",
    platform: "Instagram",
    follower_range: "8만",
    cosine_score: 0.852,
    category_main_id: 4,       // 마스크팩
    market_demand_pct: 18.3,
    content_direction: "여드름 진정, 주 2회 마스크팩 루틴",
    h01_risk: "여드름 유발 성분 최소화",
    tags: ["#트러블케어", "#마스크팩추천", "#아크네"],
    unmet_need: "여드름 유발",
    unmet_pct: 24.7,
  },
  {
    influencer_id: 4,
    handle: "dermguru",
    persona_type: "성분파",
    platform: "YouTube",
    follower_range: "31만",
    cosine_score: 0.898,
    category_main_id: 2,       // 클렌징
    market_demand_pct: 16.8,
    content_direction: "성분 분석 클렌징 리뷰",
    h01_risk: "메이크업 잔여물 완전 제거",
    tags: ["#성분분석", "#클렌징추천", "#더마뷰티"],
    unmet_need: "세정력 부족",
    unmet_pct: 31.2,
  },
  {
    influencer_id: 5,
    handle: "glowyamelie",
    persona_type: "보습케어",
    platform: "Instagram",
    follower_range: "6만",
    cosine_score: 0.964,
    category_main_id: 4,       // 마스크팩
    market_demand_pct: 20.1,
    content_direction: "집중 보습 마스크팩 위클리 루틴",
    h01_risk: "보습 지속력",
    tags: ["#보습마스크", "#촉촉피부", "#수분팩"],
    unmet_need: "보습 지속력 부족",
    unmet_pct: 22.8,
  },
];
```

---

## 5. 마케팅소스

> EDA H01 소비자 불만 분석 + GPT-4o-mini 기반 AI 캠페인 전략 자동 생성.

### 역할 흐름

```
바이어 인플루언서 선택 (MarketingInfluencer.js)
        │
        ▼
POST /buyer/marketing-source
  {
    influencer_name, persona, cosine_score, market_share,
    platform, followers, content_direction, h01_risk,
    target_audience, product_name, category_main_id
  }
        │
    GPT-4o-mini 분석 생성
        │
        ▼
  {
    strategy_text,          // AI 캠페인 전략 (2~3단락)
    channels: {             // 플랫폼 분배
      Instagram: 48,
      TikTok: 34,
      YouTube: 18
    },
    keywords: [             // 해시태그 전략
      { tag, volume, trend }
    ],
    scores: {               // 4개 포지셔닝 지표
      trend_match,
      target_similarity,
      market_reach,
      content_fit
    },
    reach: {                // 7일 도달 예측
      impressions,
      reach_count
    }
  }
        │
        ▼
MarketingSource.js — 채널 바 차트 + 해시태그 + 포지셔닝 레이더
```

### 마케팅소스 GPT 프롬프트 (buyer.py)

```python
MARKETING_PROMPT = """
당신은 K-뷰티 글로벌 마케팅 전략 전문가입니다.
아래 인플루언서와 상품 정보를 분석하여 디지털 마케팅 캠페인 전략을 생성하세요.

[인플루언서 정보]
- 핸들: {influencer_name} / 페르소나: {persona}
- 매칭 정확도(Cosine): {cosine_score:.1%}
- 팔로워: {followers} / 플랫폼: {platform}
- 주 콘텐츠 방향: {content_direction}
- 해결 불만: {h01_risk}

[상품 정보]
- 상품명: {product_name}
- 카테고리: {category}
- 타겟 오디언스: {target_audience}
- 시장 점유율: {market_share}%

다음 4가지를 JSON으로 반환하세요:
1. strategy: 캠페인 전략 핵심 요약 (2~3단락, 한국어)
2. channels: Instagram/TikTok/YouTube 비율 (합계 100, 정수)
3. keywords: 상위 5개 해시태그 [{ tag, volume_k, trend: "up"/"stable"/"down" }]
4. scores: trend_match/target_similarity/market_reach/content_fit (0~100 정수)
"""

async def generate_marketing_source(payload: dict, db) -> dict:
    category_map = {1: "스킨케어", 2: "클렌징", 3: "선케어", 4: "마스크팩"}
    category = category_map.get(payload.get("category_main_id", 1), "스킨케어")

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, max_tokens=600)
    prompt = MARKETING_PROMPT.format(
        influencer_name=payload["influencer_name"],
        persona=payload["persona"],
        cosine_score=payload["cosine_score"],
        followers=payload["followers"],
        platform=payload["platform"],
        content_direction=payload["content_direction"],
        h01_risk=payload["h01_risk"],
        product_name=payload["product_name"],
        category=category,
        target_audience=payload["target_audience"],
        market_share=payload["market_share"],
    )

    response = await llm.ainvoke(prompt)
    result = _parse_marketing_json(response.content)

    # EDA H01 기반 예상 도달 수 계산 (follower_range에서 추정)
    result["reach"] = _estimate_reach(payload["followers"], result["scores"])
    return result


def _estimate_reach(follower_range: str, scores: dict) -> dict:
    """EDA H01: 인플루언서 카테고리별 평균 도달률 기반 추정."""
    # 팔로워 수치 파싱 (예: "5만" → 50000)
    base = 0
    if "만" in follower_range:
        base = int(follower_range.replace("만", "").strip()) * 10000
    elif "천" in follower_range:
        base = int(follower_range.replace("천", "").strip()) * 1000

    avg_score = sum(scores.values()) / len(scores)
    engagement_rate = 0.035 + (avg_score - 70) * 0.001  # 3.5% 기준
    impressions = int(base * 7 * engagement_rate * 1.5)  # 7일 × 1.5배 노출
    reach_count  = int(base * 0.65)

    return {
        "impressions": f"{impressions:,}",
        "reach_count":  f"{reach_count:,}",
        "period": "7일 기준",
    }
```

### 마케팅소스 더미 데이터

```javascript
// src/screens/Step3.marketing/MarketingSource.js

const MARKETING_DUMMY = {
  strategy:
    "marisajmakeup는 무백탁 선크림 전문 인플루언서로 선케어 카테고리 내 " +
    "매칭 정확도 92.4%를 기록합니다. Instagram 릴스 중심의 'Before & After 백탁 비교' " +
    "콘텐츠가 해당 타겟층에서 평균 4.2% 인게이지먼트를 달성합니다.\n\n" +
    "소비자 불만 1위인 '백탁 현상(28.4%)'을 직접 해결하는 포지셔닝이 핵심입니다. " +
    "TikTok 릴스에서 #노백탁 챌린지를 연계하면 바이럴 확산 가속이 예상됩니다.\n\n" +
    "캠페인 집행 시점은 자외선 강도가 높아지는 3~4월 전 1~2월 콘텐츠 선제 배포를 권장하며, " +
    "미국 현지 Ulta Beauty 온라인몰 SEO와 연계하면 오가닉 유입 2배 효과를 기대할 수 있습니다.",

  channels: { Instagram: 48, TikTok: 34, YouTube: 18 },

  keywords: [
    { tag: "#노백탁선크림",   volume_k: 420, trend: "up" },
    { tag: "#물리자차",       volume_k: 310, trend: "up" },
    { tag: "#선크림추천",     volume_k: 890, trend: "stable" },
    { tag: "#kbeautyspf",    volume_k: 560, trend: "up" },
    { tag: "#무기자차선크림", volume_k: 240, trend: "up" },
  ],

  scores: {
    trend_match:       94,
    target_similarity: 87,
    market_reach:      78,
    content_fit:       82,
  },

  reach: {
    impressions: "—",
    reach_count:  "—",
    period: "7일 기준",
  },
};
```

---

## 6. EDA 분석 근거

> H01~H03 세 가지 EDA 가설에서 앱의 핵심 데이터 로직이 도출됩니다.

### H01: 소비자 불만 (Unmet Needs) 분석

> **"카테고리별 소비자 리뷰에서 반복되는 불만이 소싱 기회를 나타낸다."**

```
분석 방법:
  - 미국 아마존/세포라 리뷰 텍스트 NLP 토픽 모델링
  - LDA/BERTopic으로 카테고리별 상위 불만 5개 추출
  - 불만 비율(topic_pct)이 높을수록 미충족 수요 = 소싱 기회

결과 (unmet_needs 테이블):
  선케어   → 백탁 현상(28.4%), 끈적임(22.1%), 자극감(15.3%)
  스킨케어  → 끈적임(19.2%), 향료 민감(17.8%), 흡수속도(14.1%)
  클렌징   → 세정력 부족(31.2%), 건조함(24.5%), 잔여물(18.9%)
  마스크팩  → 보습 지속력(22.8%), 여드름 유발(24.7%), 밀착감(16.4%)

앱 적용:
  - BuyerAiMode: 소비자 불만 TOP3를 RAG 컨텍스트에 주입
  - MarketingSource: h01_risk 필드로 인플루언서 매칭 방향 결정
  - Fit Score: complaints 피처로 ML 모델 학습
```

### H02: 가격 탄력성 분석

> **"K-뷰티는 프리미엄-가성비 이중 포지셔닝이 가능하다."**

```
분석 방법:
  - 미국 세포라/아마존 K-뷰티 상품 가격 분포 분석
  - 리뷰 수 × 평점을 가중치로 Tier 분류

결과 (price_cluster 테이블):
  Tier 1: $30+ 프리미엄    → 리뷰 500+, 재구매율 42%
  Tier 2: $15~30 중가대    → 리뷰 200+, 재구매율 35%
  Tier 3: $15 미만 가성비  → 리뷰 50+,  재구매율 28%

앱 적용:
  - BuyerProductList: tier별 margin_rate 차등 표시
  - Fit Score: price_low/mid/high 피처로 ML 예측
  - BuyerAiMode: 마진율 계산 칩 기능
```

### H03: 한국→미국 트렌드 선행 분석

> **"K-뷰티 성분은 미국 대비 평균 25개월 선행한다."**

```
분석 방법:
  - 한국 네이버 쇼핑 트렌드 + 미국 Google Trends 성분 검색량 시계열 분석
  - DTW(Dynamic Time Warping)로 피크 타이밍 차이 측정
  - 성분별 선행 기간 및 미국 성장률(YoY) 계산

결과 (ingredient_trend 테이블):
  성분           한→미 선행   US YoY   미국 현재 단계
  ─────────────────────────────────────────────
  나이아신아마이드  38개월     42%     성장기
  글루타치온       32개월     62%     진입기
  센텔라           30개월     35%     성장기
  세라마이드        28개월     29%     성숙기
  PDRN            25개월     73%     진입기
  펩타이드         22개월     31%     성장기
  AHA/BHA         20개월     19%     성숙기
  레티놀           18개월     22%     성숙기
  어성초           18개월     55%     진입기
  무기자차         15개월     48%     성장기
  엑소좀           34개월     68%     초기진입기

앱 적용:
  - BuyerAiMode LangChain RAG: H03_DOCS 벡터화 → 소싱 타이밍 인사이트 생성
  - BrandHome: TREND_CATS에 YoY 수치 표시
  - Fit Score: us_trend_ratio, trend_pos_weighted 피처 생성
  - MarketingSource: 타이밍 전략 섹션 근거 데이터
```

---

## 7. 핵심 SQL 쿼리

### 상품 목록 조회 (바이어)

```sql
-- 카테고리 필터 + 검색어 + Fit Score 정렬
SELECT
    p.product_id,
    p.product_name,
    p.brand_name,
    p.price,
    p.score,
    p.sub_category,
    p.status,
    ARRAY_AGG(pi.ing_kor ORDER BY pi.seq_no) AS ingredients
FROM product p
LEFT JOIN pro_ing pi ON pi.product_id = p.product_id
WHERE p.status != '심사중'
  AND (
    -- 카테고리 필터 (예: 스킨케어)
    p.category_detail_id BETWEEN 1 AND 19
  )
  AND (
    -- 검색어 필터
    p.product_name ILIKE '%' || :search || '%'
    OR pi.ing_kor   ILIKE '%' || :search || '%'
  )
GROUP BY p.product_id
ORDER BY p.score DESC NULLS LAST
LIMIT 20 OFFSET :offset;
```

### 시장 데이터 조회 (Fit Score 화면)

```sql
-- 카테고리 서브ID 기반 트렌드/리뷰/가격 통합 조회
SELECT
    tt.review_count,
    tt.search_volume_label,
    tt.trend,
    tt.yoy_pct,
    tt.market_size_label,
    ref.avg_review_score,
    ref.product_count,
    pc.min_price,
    pc.avg_price,
    pc.max_price
FROM trend_timing tt
LEFT JOIN reference ref
    ON ref.category_sub_id = tt.category_sub_id
LEFT JOIN price_cluster pc
    ON pc.category_sub_id = tt.category_sub_id
WHERE tt.category_sub_id = :category_sub_id
LIMIT 1;
```

### 성분 트렌드 조회 (RAG 문서 빌드용)

```sql
-- 미국 성분 트렌드 데이터 (LangChain RAG 동적 문서 생성)
SELECT
    it.us_keyword,
    it.kr_keyword,
    it.us_stage,
    it.us_yoy_pct,
    it.lead_months,
    it.peak_forecast_kr,
    it.peak_forecast_us
FROM ingredient_trend it
WHERE it.us_yoy_pct IS NOT NULL
ORDER BY it.us_yoy_pct DESC
LIMIT 20;
```

### 상품 성분 목록 (Fit Score 예측용)

```sql
-- 성분명 + 순서 (낮을수록 고함량)
SELECT
    pi.ing_name,   -- INCI 영문명
    pi.ing_kor,    -- 한글명
    pi.seq_no      -- 성분표 순서 (1 = 최고함량)
FROM pro_ing pi
WHERE pi.product_id = :product_id
ORDER BY pi.seq_no ASC;
```

### 브랜드 상품 목록 + Fit Score

```sql
-- 브랜드 대시보드용 (brand_id=112 고정)
SELECT
    p.product_id,
    p.product_name,
    p.sub_category,
    p.score,
    p.status,
    p.created_at
FROM product p
WHERE p.brand_id = :brand_id
  AND p.status != '심사중'
ORDER BY p.created_at DESC;
```

---

## 8. LangChain 더미 구현

> OpenAI API 키 없이 앱을 테스트할 때 사용하는 완전한 더미 구현체.

### 더미 LangChain RAG (로컬 테스트용)

```python
# backend/dummy_langchain.py
# OpenAI 키 없이 LangChain 파이프라인을 더미로 대체

from dataclasses import dataclass
from typing import Optional
import random


@dataclass
class FakeDocument:
    page_content: str
    metadata: dict = None


class DummyEmbeddings:
    """HuggingFaceEmbeddings 더미 (벡터 생성 없이 고정 배열 반환)."""
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[random.uniform(-1, 1) for _ in range(384)] for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [random.uniform(-1, 1) for _ in range(384)]


class DummyVectorStore:
    """FAISS 더미 (키워드 매칭으로 관련 문서 반환)."""
    def __init__(self, docs: list[FakeDocument]):
        self.docs = docs

    def similarity_search(self, query: str, k: int = 3) -> list[FakeDocument]:
        query_lower = query.lower()
        scored = []
        for doc in self.docs:
            score = sum(1 for word in query_lower.split() if word in doc.page_content.lower())
            scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:k]]


class DummyLLM:
    """ChatOpenAI 더미 (사전 정의 응답 반환)."""

    TIMING_RESPONSES = {
        "pdrn":   "PDRN은 한국 대비 25개월 미국 시장이 후발하고 있어 지금 소싱하면 2025년 Q3 미국 피크에 맞춰 선점 가능합니다.",
        "엑소좀": "엑소좀은 34개월 선행 지표로 2026년 상반기 미국 본격 성장 예측, 지금이 초기 진입 최적 타이밍입니다.",
        "어성초": "어성초(YoY +55%)는 미국 진입기로 K-뷰티 '트러블케어' 포지셔닝이 Ulta 세포라 바이어 관심 급증 중입니다.",
        "나이아신아마이드": "나이아신아마이드는 미국 성장기 안정 수요로 38개월 선행 검증된 성분, 가격 경쟁력이 소싱 핵심입니다.",
        "default": "해당 카테고리 K-뷰티 성분은 미국 대비 평균 25개월 선행 트렌드를 보이며, 지금 소싱 시 6~12개월 내 미국 피크 진입을 예상할 수 있습니다.",
    }

    @dataclass
    class Response:
        content: str

    def invoke(self, prompt: str) -> "DummyLLM.Response":
        prompt_lower = prompt.lower()
        for keyword, response in self.TIMING_RESPONSES.items():
            if keyword in prompt_lower:
                return self.Response(content=response)
        return self.Response(content=self.TIMING_RESPONSES["default"])

    async def ainvoke(self, prompt: str) -> "DummyLLM.Response":
        return self.invoke(prompt)


def get_dummy_rag() -> tuple:
    """개발/테스트 환경에서 실제 LangChain 대신 더미 반환."""
    from .routers.buyer import H03_DOCS
    docs = [FakeDocument(page_content=d) for d in H03_DOCS]
    vs = DummyVectorStore(docs)
    llm = DummyLLM()
    return vs, llm


# ── buyer.py _get_rag() 수정 예시 ─────────────────────
def _get_rag(db=None):
    import os
    if not os.getenv("OPENAI_API_KEY"):
        # 개발 환경: 더미 반환
        from .dummy_langchain import get_dummy_rag
        return get_dummy_rag()
    # 프로덕션: 실제 LangChain
    # ... (기존 코드)
```

### 더미 마케팅 소스 생성

```python
# backend/dummy_marketing.py
import random

STRATEGY_TEMPLATES = {
    3: (  # 선케어
        "{influencer}는 무백탁 선크림 전문 인플루언서로 선케어 카테고리 매칭 정확도 {score:.0%}를 기록합니다. "
        "Instagram 릴스 중심의 'Before & After 백탁 비교' 콘텐츠가 해당 타겟층에서 평균 4.2% 인게이지먼트를 달성합니다.\n\n"
        "소비자 불만 1위인 '백탁 현상({h01_risk})'을 직접 해결하는 포지셔닝이 핵심 차별점입니다. "
        "TikTok #노백탁 챌린지 연계 시 바이럴 확산 가속이 예상됩니다.\n\n"
        "3~4월 UV 강도 상승 전 1~2월 콘텐츠 선제 배포 + Ulta Beauty SEO 연계를 권장합니다."
    ),
    1: (  # 스킨케어
        "{influencer}는 {persona} 페르소나로 스킨케어 일상 루틴 콘텐츠에 강점을 보입니다. "
        "매칭 정확도 {score:.0%}로 {product} 핵심 성분 소통에 최적화되어 있습니다.\n\n"
        "끈적임 없는 수분 장벽 포지셔닝으로 2030 여성 타겟 인게이지먼트 극대화가 가능합니다. "
        "숏폼 '30초 피부 변화' 시리즈 콘텐츠 전략을 권장합니다.\n\n"
        "K-뷰티 성분(나이아신아마이드/세라마이드) USP를 전면에 내세운 글로벌 런칭 캠페인을 제안합니다."
    ),
}

KEYWORD_POOL = {
    3: [  # 선케어
        {"tag": "#노백탁선크림",   "volume_k": 420, "trend": "up"},
        {"tag": "#물리자차",       "volume_k": 310, "trend": "up"},
        {"tag": "#선크림추천",     "volume_k": 890, "trend": "stable"},
        {"tag": "#kbeautyspf",    "volume_k": 560, "trend": "up"},
        {"tag": "#무기자차선크림", "volume_k": 240, "trend": "up"},
    ],
    1: [  # 스킨케어
        {"tag": "#세라마이드",     "volume_k": 680, "trend": "stable"},
        {"tag": "#나이아신아마이드", "volume_k": 740, "trend": "up"},
        {"tag": "#kbeautyroutine", "volume_k": 1200, "trend": "up"},
        {"tag": "#보습루틴",       "volume_k": 430, "trend": "stable"},
        {"tag": "#수분크림추천",   "volume_k": 290, "trend": "up"},
    ],
}

def generate_dummy_marketing(payload: dict) -> dict:
    cat_id = payload.get("category_main_id", 1)
    tmpl = STRATEGY_TEMPLATES.get(cat_id, STRATEGY_TEMPLATES[1])

    strategy = tmpl.format(
        influencer=payload.get("influencer_name", "인플루언서"),
        score=payload.get("cosine_score", 0.88),
        h01_risk=payload.get("h01_risk", "소비자 불만"),
        persona=payload.get("persona", "전문가"),
        product=payload.get("product_name", "상품"),
    )

    if cat_id == 3:
        channels = {"Instagram": 48, "TikTok": 34, "YouTube": 18}
        scores   = {"trend_match": 94, "target_similarity": 87, "market_reach": 78, "content_fit": 82}
    else:
        channels = {"Instagram": 41, "TikTok": 38, "YouTube": 21}
        scores   = {"trend_match": 88, "target_similarity": 83, "market_reach": 72, "content_fit": 86}

    return {
        "strategy":  strategy,
        "channels":  channels,
        "keywords":  KEYWORD_POOL.get(cat_id, KEYWORD_POOL[1]),
        "scores":    scores,
        "reach":     {"impressions": "—", "reach_count": "—", "period": "7일 기준"},
    }
```

---

## 9. 데이터베이스 스키마

### 핵심 테이블 DDL (요약)

```sql
-- 상품
CREATE TABLE product (
    product_id          SERIAL PRIMARY KEY,
    brand_id            INTEGER NOT NULL,
    category_detail_id  SMALLINT,           -- 1~70, CATEGORY_DETAIL_ID 매핑
    product_name        VARCHAR(200) NOT NULL,
    brand_name          VARCHAR(100),
    price               NUMERIC(10, 2),      -- USD 공급가
    spf_index           SMALLINT,            -- 선케어만 해당
    score               SMALLINT,            -- Fit Score 0~100
    sub_category        VARCHAR(50),         -- 한글 (예: '크림')
    status              VARCHAR(20) DEFAULT 'active',  -- 'active' | '심사중'
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 상품 성분
CREATE TABLE pro_ing (
    ing_id      SERIAL PRIMARY KEY,
    product_id  INTEGER REFERENCES product(product_id) ON DELETE CASCADE,
    ing_name    VARCHAR(200),   -- INCI 영문명
    ing_kor     VARCHAR(200),   -- 한글명
    seq_no      SMALLINT        -- 성분표 순서 (낮을수록 고함량)
);

-- 인플루언서
CREATE TABLE influencer (
    influencer_id       SERIAL PRIMARY KEY,
    handle              VARCHAR(100) UNIQUE NOT NULL,
    profile_image_url   TEXT,
    follower_range      VARCHAR(20),         -- 예: '5만'
    platform            VARCHAR(30),         -- 'Instagram' | 'TikTok' | 'YouTube'
    cosine_score        NUMERIC(5, 4),        -- 0.0000 ~ 1.0000
    category_main_id    SMALLINT             -- 1~4
);

-- 인플루언서 페르소나 (카테고리별)
CREATE TABLE influencer_persona (
    persona_id          SERIAL PRIMARY KEY,
    category_main_id    SMALLINT,
    persona_type        VARCHAR(100),        -- 예: '무백탁 전문'
    h12_topic           VARCHAR(200),        -- 주 콘텐츠 방향
    market_demand_pct   NUMERIC(5, 2),       -- 시장 수요 %
    tags                TEXT[]               -- 해시태그 배열
);

-- 소비자 불만 (H01 EDA)
CREATE TABLE unmet_needs (
    need_id             SERIAL PRIMARY KEY,
    category_main_id    SMALLINT,
    topic_label_kr      VARCHAR(100),        -- 예: '백탁 현상'
    topic_pct           NUMERIC(5, 2)        -- 불만 비율 %
);

-- 성분 트렌드 (H03 EDA)
CREATE TABLE ingredient_trend (
    trend_id            SERIAL PRIMARY KEY,
    us_keyword          VARCHAR(100),        -- INCI 영문명
    kr_keyword          VARCHAR(100),        -- 한글명
    us_stage            VARCHAR(50),         -- '진입기' | '성장기' | '성숙기'
    us_yoy_pct          NUMERIC(6, 2),       -- 미국 연간 성장률 %
    lead_months         SMALLINT,            -- 한국→미국 선행 개월 수
    peak_forecast_kr    VARCHAR(50),         -- 한국 피크 예측
    peak_forecast_us    VARCHAR(50)          -- 미국 피크 예측
);

-- 트렌드 타이밍 (카테고리별 시장 지표)
CREATE TABLE trend_timing (
    timing_id           SERIAL PRIMARY KEY,
    category_sub_id     SMALLINT,
    review_count        INTEGER,
    search_volume_label VARCHAR(30),         -- '높음' | '중간' | '낮음'
    trend               VARCHAR(20),         -- 'rising' | 'stable' | 'declining'
    yoy_pct             NUMERIC(6, 2),
    market_size_label   VARCHAR(30)
);

-- 가격 클러스터 (H02 EDA)
CREATE TABLE price_cluster (
    cluster_id          SERIAL PRIMARY KEY,
    category_sub_id     SMALLINT,
    tier                SMALLINT,            -- 1(프리미엄) | 2(중가) | 3(가성비)
    min_price           NUMERIC(8, 2),
    avg_price           NUMERIC(8, 2),
    max_price           NUMERIC(8, 2),
    product_count       INTEGER
);
```

---

## API 엔드포인트 요약

| Method | Endpoint | 기능 | 관련 서비스 |
|--------|----------|------|------------|
| POST | `/brand/analyze` | Fit Score 산출 (ML) | Fit Score |
| GET  | `/brand/list/{brand_id}` | 브랜드 상품 목록 | Brand Home |
| GET  | `/brand/market-data` | 카테고리 시장 데이터 | Fit Score |
| POST | `/buyer/ai-chat` | LangChain RAG 소싱 채팅 | AI 스마트소싱 |
| GET  | `/buyer/price-stats` | 카테고리 가격 통계 | 스마트소싱 |
| GET  | `/buyer/products` | 상품 목록 (필터/검색) | 바이어 리스트 |
| GET  | `/buyer/influencers/{product_id}` | 상품별 인플루언서 매칭 | 인플루언서 매칭 |
| GET  | `/buyer/influencers-by-category` | 카테고리별 인플루언서 | 인플루언서 매칭 |
| POST | `/buyer/marketing-source` | AI 캠페인 전략 생성 | 마케팅소스 |
| GET  | `/api/products/{pid}/influencers/{iid}/message` | AI 협업 메시지 | 인플루언서 |

---

*Beauty Katchy AI Core Services — 2026.05*
