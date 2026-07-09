import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Alert } from "react-native";
import { Svg, Path, Circle, Line, Rect, Text as SvgText } from "react-native-svg";
import TopBar from "../../components/TopBar";
import StepBar from "../../components/StepBar";
import { common, colors, pageBg } from "../../styles";

const API_URL = "https://finalteam4-production.up.railway.app";

const SUBCATEGORY_ID = {
  "스킨": 1, "토너": 2, "패드": 3, "에센스": 4, "세럼": 5,
  "앰플": 6, "스팟케어": 7, "로션": 8, "에멀젼": 9, "크림": 10,
  "올인원": 11, "오일": 12, "슬리핑팩": 13, "젤": 14, "밤/멀티밤": 15,
  "아이크림": 16, "미스트": 17, "페이스에센스": 19,
  "클렌징폼": 20, "클렌징젤": 21, "클렌징비누": 22, "필링/스크럽": 23,
  "클렌징파우더": 24, "스크럽/필링패드": 25, "클렌징오일": 26,
  "클렌징워터": 27, "클렌징밤": 28, "클렌징밀크": 29, "클렌징크림": 30,
  "클렌징로션": 31, "클렌징티슈": 32, "클렌징패드": 33, "립&아이리무버": 34,
  "선크림": 35, "선스프레이": 36, "선로션": 37, "선스틱": 38,
  "시트마스크": 39, "워시오프팩": 40, "필오프팩": 41, "모델링/고무팩": 42,
  "패치": 43, "부분마스크/팩": 44,
};
const ENG_TO_KOR = {
  niacinamide: "나이아신아마이드", ceramide: "세라마이드", retinol: "레티놀",
  hyaluronic_acid: "히알루론산", hyaluronic: "히알루론산",
  zinc_oxide: "징크옥사이드", zinc: "징크옥사이드",
  centella: "센텔라", peptide: "펩타이드", caffeine: "카페인",
  vitamin_c: "비타민C", ascorbic: "비타민C",
  salicylic: "살리실산", salicylic_acid: "살리실산",
  tocopheryl_acetate: "토코페릴아세테이트", tocopheryl: "토코페릴",
  amino_acid_surfactant: "아미노산 계면활성제",
  citric_acid: "구연산", citric: "구연산",
  panthenol: "판테놀", squalane: "스쿠알란", bakuchiol: "바쿠치올",
  azelaic: "아젤라익", ectoin: "엑토인", exosome: "엑소좀",
  sodium_hyaluronate: "소듐하이알루로네이트",
  titanium_dioxide: "티타늄디옥사이드", titanium: "티타늄디옥사이드",
  madecassoside: "마데카소사이드", heartleaf: "어성초", mugwort: "쑥",
};

const FEATURE_LABEL = {
  price_low: "낮은 가격대", price_mid: "중간 가격대", price_high: "높은 가격대",
  log_price: "가격", price_rank_in_cat: "카테고리 내 가격 순위",
  us_trend_ratio: "미국 트렌드 성분 비율", us_trend_ingredient_position: "트렌드 성분 위치",
  ingredient_count: "전성분 수", SPF_Index: "SPF 지수",
  cat_skincare: "스킨케어", cat_cleansing: "클렌징", cat_masks: "마스크팩", cat_suncare: "선케어",
  is_physical_filter: "물리적 자외선차단제", has_chemical_filter: "화학적 자외선차단제", spf_tier: "SPF 등급",
  is_amino_surfactant: "아미노산 계면활성제", is_sulfate: "황산염 계면활성제",
  is_mild_surfactant: "순한 계면활성제", surfactant_premium_score: "프리미엄 계면활성제",
  is_salicylic: "살리실산 함유", is_foam_cleanser: "폼 클렌저", is_gel_cleanser: "젤 클렌저",
  is_low_ph_acid: "저pH 산 성분", is_chemical_only: "화학 자외선차단",
};

const featureLabel = (key) => {
  if (FEATURE_LABEL[key]) return FEATURE_LABEL[key];
  if (key.startsWith("gt_")) {
    const eng = key.replace("gt_", "");
    return (ENG_TO_KOR[eng] ?? eng) + " 성분";
  }
  if (key.endsWith("_position")) {
    const eng = key.replace("_position", "");
    return (ENG_TO_KOR[eng] ?? eng) + " 위치";
  }
  if (key.endsWith("_above_1pct")) {
    const eng = key.replace("_above_1pct", "");
    return (ENG_TO_KOR[eng] ?? eng) + " 고농도 여부";
  }
  if (key.startsWith("mid_")) return key.replace("mid_", "") + " (중분류)";
  // pos_* — 성분 위치 피처 (카테고리 교호작용 제외)
  if (key.startsWith("pos_") && !key.includes("_x_")) {
    const eng = key.replace("pos_", "");
    return (ENG_TO_KOR[eng] ?? eng) + " 처방 위치";
  }
  // trend 피처
  const trendLabels = {
    trend_pos_weighted: "트렌드 성분 농도 위치",
    trend_max_recent: "최고 트렌드 성분 수준",
    trend_avg_recent: "평균 트렌드 성분 수준",
    trend_rising_count: "상승 중인 트렌드 성분 수",
    trend_avg_slope: "트렌드 성분 모멘텀",
  };
  if (trendLabels[key]) return trendLabels[key];
  // 기타 플래그 피처
  const miscLabels = {
    is_treatment_cleanser: "트리트먼트 클렌저",
    has_barrier_in_cleanser: "장벽 강화 성분 함유",
    is_premium_amino_surf: "프리미엄 아미노산 계면활성제",
    surfactant_grade: "계면활성제 등급",
    has_retinol: "레티놀 함유",
    has_ferment: "발효 성분 함유",
    spf_50plus: "SPF 50+ 여부",
    combo_adenosine_niacinamide: "아데노신+나이아신아마이드 조합",
    combo_vitc_tocopherol: "비타민C+토코페롤 조합",
    top5_trend_count: "핵심 트렌드 성분 수",
    us_trend_count: "미국 트렌드 성분 수",
  };
  if (miscLabels[key]) return miscLabels[key];
  return null;
};

// 추세 ID → 한글 레이블
const TREND_LABEL = { "상승": "상승", "정체": "정체", "하락": "하락", "증가": "상승" };

// PLC 단계 SVG 포지션 매핑
const PLC_BG_X    = { 진입기: 0,   성장기: 80,  성숙기: 160, 쇠퇴기: 240 };
const PLC_BADGE_X = { 진입기: 2,   성장기: 80,  성숙기: 160, 쇠퇴기: 240 };
const PLC_CX      = { 진입기: 40,  성장기: 120, 성숙기: 200, 쇠퇴기: 280 };
const PLC_CY      = { 진입기: 68,  성장기: 44,  성숙기: 14,  쇠퇴기: 40  };
const PLC_BADGE_LABEL = {
  진입기: "진입기 · 선점 기회",
  성장기: "성장기 · 진입 적기",
  성숙기: "성숙기 · 경쟁 치열",
  쇠퇴기: "쇠퇴기 · 진입 비권장",
};

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// viewMode=true: 기존 상품 보기 (API 호출 없이 저장된 score 표시)
export default function Step3FitScore({ onBack, onReset, onRegister, onHome, product, ingredients,
  viewMode = false, viewProduct = null, onEdit, onDelete }) {

  // viewMode에서는 viewProduct 데이터를 product 구조로 정규화
  const displayProduct = viewMode ? {
    productName: viewProduct?.name || "",
    brandName:   viewProduct?.brand || "",
    category:    viewProduct?.category || "",
    subCategory: viewProduct?.cat || "",
    spf:         viewProduct?.spf || null,
    price:       viewProduct?.price || null,
    volume:      viewProduct?.volume || null,
  } : product;

  const activeCount = (ingredients ?? []).filter(i => i.type === "active").length;
  const activeNames = viewMode
    ? (viewProduct?.activeIngredients ?? [])
    : (ingredients ?? []).filter(i => i.type === "active").map(i => i.name || i.eng).filter(Boolean);
  const [showSuccess, setShowSuccess]           = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [fitScore, setFitScore]       = useState(viewMode ? (viewProduct?.score ?? 0) : null);
  const [productId, setProductId]     = useState(viewMode ? (viewProduct?.id ?? null) : null);
  const [topFeatures, setTopFeatures] = useState([]);
  const [loading, setLoading]         = useState(!viewMode);
  const [displayScore, setDisplayScore] = useState(viewMode ? (viewProduct?.score ?? 0) : 0);
  const [marketData, setMarketData]   = useState(null);

  useEffect(() => {
    if (fitScore === null) return;
    let frameId;
    const start = Date.now();
    const duration = 900;
    const end = fitScore;
    const animate = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * end));
      if (t < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [fitScore]);

  // 시장 데이터 fetch (viewMode 포함 항상 호출)
  useEffect(() => {
    const catId = SUBCATEGORY_ID[displayProduct?.subCategory] ?? 1;
    fetch(`${API_URL}/brand/market-data?category_detail_id=${catId}`)
      .then(r => r.json())
      .then(d => setMarketData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (viewMode) return; // viewMode일 때 API 호출 건너뜀
    fetch(`${API_URL}/brand/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: 1,
        category_detail_id: SUBCATEGORY_ID[product?.subCategory] ?? 1,
        product_name: product?.productName || "",
        brand_name: product?.brandName || "",
        price: parseFloat(product?.price) || 0,
        spf_index: product?.spf ? parseFloat(product.spf) : null,
        category: product?.category || "",
        sub_category: product?.subCategory || "",
        ingredients: (ingredients ?? []).map((ing) => ({
          ing_name: ing.eng || ing.name,
          ing_kor: ing.name,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFitScore(data.score);
        setProductId(data.product_id ?? null);
        setTopFeatures(data.top_features || []);
      })
      .catch((err) => console.error("FitScore API Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const score = fitScore ?? 0;

  // ── 시장 데이터 파생값 ────────────────────────────────────
  const reviewCount  = marketData?.review_count ?? null;
  const productCount = marketData?.product_count ?? null;
  const minPrice     = marketData?.min_price || 0;
  const avgPrice     = marketData?.avg_price || 0;
  const maxPrice     = marketData?.max_price || 0;

  // 가격 포지션 도트 위치 계산
  const priceRange = maxPrice - minPrice || 1;
  const toLeftPct  = (p) => `${Math.max(8, Math.min(92, 10 + 80 * (p - minPrice) / priceRange))}%`;
  const myPrice    = parseFloat(displayProduct?.price) || 0;
  const myDotLeft  = (minPrice && maxPrice) ? toLeftPct(myPrice)  : "30%";
  const avgDotLeft = (minPrice && maxPrice) ? toLeftPct(avgPrice) : "53%";
  const iqrLeft    = (minPrice && maxPrice) ? "10%"  : "20%";
  const iqrWidth   = (minPrice && maxPrice) ? "80%"  : "55%";

  // 트렌드 키워드 매칭
  const trendKws = marketData?.trend_keywords ?? [];
  const myIngNames = viewMode
    ? (viewProduct?.activeIngredients ?? []).map(s => s.toLowerCase())
    : (ingredients ?? []).flatMap(i => [i.name?.toLowerCase(), i.eng?.toLowerCase()].filter(Boolean));
  const matchedKw = trendKws
    .filter(k => myIngNames.some(n => n.includes(k.us_kw.toLowerCase()) || n.includes(k.kr_kw.toLowerCase())))
    .map(k => k.us_kw || k.kr_kw);
  const otherKw = trendKws
    .filter(k => !myIngNames.some(n => n.includes(k.us_kw.toLowerCase()) || n.includes(k.kr_kw.toLowerCase())))
    .slice(0, 5)
    .map(k => k.us_kw || k.kr_kw);

  const refData = [
    { label: "유사 상품 평균 평점", val: marketData?.avg_review_score != null ? String(marketData.avg_review_score) : "—" },
    { label: "평균 리뷰 수",       val: marketData?.ref_review_count != null ? `${Number(marketData.ref_review_count).toLocaleString()}건` : "—" },
  ];

  const handleDelete = () => {
    Alert.alert(
      "상품 삭제",
      "이 상품을 삭제하면 복구할 수 없어요. 정말 삭제할까요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제", style: "destructive",
          onPress: () => {
            const pid = viewProduct?.id;
            if (pid && pid < 1_000_000) {
              fetch(`${API_URL}/brand/products/${pid}`, { method: "DELETE" }).catch(() => {});
            }
            setShowDeleteSuccess(true);
          },
        },
      ]
    );
  };

  return (
    <View style={[common.screen, { backgroundColor: pageBg }]}>
      <TopBar light titleLeft={false} title={viewMode ? "상품 상세" : "Fit Score"} onHome={onHome} onBack={viewMode ? onBack : undefined} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: pageBg }}>
          <ActivityIndicator size="large" color={colors.coral} />
          <Text style={{ marginTop: 12, color: colors.grayMid, fontSize: 14 }}>핏 스코어 산출 중...</Text>
        </View>
      ) : (<>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

        {/* 산출 완료 배너 (viewMode에서는 등록 완료 배너 표시) */}
        <View style={[s.completeBanner, viewMode && { backgroundColor: "#1C1C1E" }]}>
          <View style={s.completeBannerIcon}>
            <Svg width={20} height={20} viewBox="0 0 256 256">
              <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
            </Svg>
          </View>
          <View>
            <Text style={s.completeBannerTitle}>{viewMode ? "등록 완료된 상품" : "핏 스코어 산출 완료!"}</Text>
            <Text style={s.completeBannerSub}>{viewMode ? "수정하거나 삭제할 수 있어요" : "아래에서 미국 시장 분석 결과를 확인하세요"}</Text>
          </View>
        </View>

        {/* TODO: [API] 아래 상품 정보 카드는 바이어 화면에 동일하게 노출될 소스 데이터임 */}
        {displayProduct && (
          <View style={s.card}>
            <View style={common.secHeader}>
              <Text style={common.secLabel}>등록 상품 정보</Text>
            </View>
            <View style={s.productCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.productCardBrand}>{displayProduct.brandName || "—"}</Text>
                <Text style={s.productCardName} numberOfLines={2}>{displayProduct.productName || "—"}</Text>
              </View>
              {!viewMode && (
                <View style={s.productCardBadge}>
                  <Text style={s.productCardBadgeText}>등록 대기</Text>
                </View>
              )}
            </View>
            <View style={s.productCardRow}>
              {displayProduct.category ? <View style={s.productCardTag}><Text style={s.productCardTagText}>{displayProduct.category}</Text></View> : null}
              {displayProduct.subCategory ? <View style={s.productCardTag}><Text style={s.productCardTagText}>{displayProduct.subCategory}</Text></View> : null}
              {displayProduct.spf ? <View style={s.productCardTag}><Text style={s.productCardTagText}>SPF {displayProduct.spf}</Text></View> : null}
            </View>
            <View style={s.productCardMeta}>
              {displayProduct.price ? <Text style={s.productCardMetaItem}>공급가 <Text style={s.productCardMetaVal2}>${displayProduct.price}</Text></Text> : null}
              {displayProduct.volume ? <Text style={s.productCardMetaItem}>용량 <Text style={s.productCardMetaVal2}>{displayProduct.volume}</Text></Text> : null}
              {!viewMode && <Text style={s.productCardMetaItem}>액티브 성분 <Text style={s.productCardMetaVal}>{activeCount}개</Text></Text>}
            </View>
            {activeNames.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {activeNames.map((name, i) => (
                  <View key={i} style={{ backgroundColor: "#E8FAF5", borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, borderWidth: 1, borderColor: "#B8EBD8" }}>
                    <Text style={{ fontSize: 11, color: "#1A8F72", fontWeight: "600" }}>{name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 액티브 성분 목록 (viewMode) */}
        {viewMode && viewProduct?.activeIngredients?.length > 0 && (
          <View style={s.card}>
            <View style={common.secHeader}>
              <Text style={common.secLabel}>액티브 성분</Text>
              <Text style={{ fontSize: 12, color: colors.grayMid }}>{viewProduct.activeIngredients.length}개</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {viewProduct.activeIngredients.map((ing, i) => (
                <View key={i} style={{ backgroundColor: "#E8FAF5", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#B8EBD8" }}>
                  <Text style={{ fontSize: 13, color: "#1A8F72", fontWeight: "600" }}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 점수 — 원형 게이지 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>미국 시장 적합도</Text>
            <Text style={{ fontSize: 11, color: colors.grayMid }}>
              {score >= 80 ? "매우 적합" : score >= 60 ? "적합" : "개선 필요"}
            </Text>
          </View>
          <View style={s.scoreCircleRow}>
            {/* 원형 게이지 */}
            <View style={s.scoreCircleWrap}>
              <Svg width={120} height={120} viewBox="0 0 120 120">
                <Circle cx={60} cy={60} r={RADIUS} stroke="#F2F2F7" strokeWidth={10} fill="none" />
                <Circle
                  cx={60} cy={60} r={RADIUS}
                  stroke={colors.coral} strokeWidth={10}
                  fill="none" strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE}
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={s.scoreCircleCenter}>
                <Text style={s.scoreCircleNum}>{displayScore}</Text>
                <Text style={s.scoreCircleUnit}>/100</Text>
              </View>
            </View>
            {/* 오른쪽: 등급 + 설명 */}
            <View style={s.scoreCircleInfo}>
              <Text style={s.scoreGrade}>
                {score >= 80 ? "매우 적합" : score >= 60 ? "적합" : "개선 필요"}
              </Text>
              <Text style={s.scoreGradeDesc}>
                {score >= 80 ? "상위 20% 수준이에요" : score >= 60 ? "상위 40% 수준이에요" : "성분·가격 보완이 필요해요"}
              </Text>
            </View>
          </View>

          {/* 점수 산출 근거 */}
          {topFeatures.filter(f => featureLabel(f.feature)).length > 0 && (
            <View style={{ marginTop: 16, paddingTop: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.grayMid, letterSpacing: 0.5, marginBottom: 10 }}>점수 산출 근거</Text>
              {topFeatures.filter(f => featureLabel(f.feature)).slice(0, 5).map((f, i, arr) => (
                <View key={i} style={[s.featureRow, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: "#F2F2F7" }]}>
                  <Text style={s.featureName}>{featureLabel(f.feature)}</Text>
                  <Text style={[s.featureVal, { color: f.shap_value > 0 ? "#2EC4A0" : colors.coral }]}>
                    {f.shap_value > 0 ? "긍정" : "부정"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 가격 포지션 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>가격 포지션</Text>
            <Text style={{ fontSize: 11, color: colors.grayMid }}>
              {myPrice ? `내 공급가 $${myPrice}` : "가격 포지션"}
            </Text>
          </View>
          <View style={s.priceTrack}>
            <View style={s.priceRangeBar} />
            <View style={[s.priceIqr, { left: iqrLeft, width: iqrWidth }]} />
            <View style={[s.priceDot, { left: "10%", backgroundColor: "#D1D1D6", width: 10, height: 10 }]} />
            <View style={[s.priceDot, { left: avgDotLeft, backgroundColor: "#1C1C1E" }]} />
            <View style={[s.priceDot, { left: myDotLeft, backgroundColor: colors.coral }]} />
            <View style={[s.priceDot, { left: "90%", backgroundColor: "#D1D1D6", width: 10, height: 10 }]} />
          </View>
          <View style={s.priceLabels}>
            {[
              minPrice ? `$${Math.round(minPrice)} (최저)` : "$— (최저)",
              avgPrice ? `$${Math.round(avgPrice)} (평균)` : "$— (평균)",
              maxPrice ? `$${Math.round(maxPrice)} (최고)` : "$— (최고)",
            ].map((l) => (
              <Text key={l} style={s.priceLabelText}>{l}</Text>
            ))}
          </View>
          <View style={s.legend}>
            {[
              { color: colors.coral, label: "내 상품" },
              { color: "#1C1C1E", label: "시장 평균" },
              { color: "#E5E5EA", label: "시장 범위" },
            ].map((item) => (
              <View key={item.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* PLC 단계 차트 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>PLC 단계</Text>
          </View>

          <Svg width="100%" height={100} viewBox="0 0 320 82">
            {/* 성장기 한 칸 배경 */}
            <Rect x="80" y="18" width="80" height="52" fill="#F05C5C" fillOpacity="0.1" />

            {/* 구분 세로선 */}
            <Line x1="80"  y1="18" x2="80"  y2="70" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 3" />
            <Line x1="160" y1="18" x2="160" y2="70" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 3" />
            <Line x1="240" y1="18" x2="240" y2="70" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 3" />

            {/* 곡선 아래 면 */}
            <Path
              d="M 0,72 C 25,71 58,68 80,64 C 106,58 128,34 160,20 C 183,12 212,12 240,16 C 265,20 293,44 320,68 L 320,70 L 0,70 Z"
              fill="#F05C5C" fillOpacity="0.1"
            />

            {/* PLC 곡선 */}
            <Path
              d="M 0,72 C 25,71 58,68 80,64 C 106,58 128,34 160,20 C 183,12 212,12 240,16 C 265,20 293,44 320,68"
              fill="none" stroke="#F05C5C" strokeWidth="1.5" strokeLinecap="round"
            />

            {/* 말풍선 배지 */}
            <Rect x="80" y="1" width="76" height="18" rx="9" fill="#F05C5C" />
            <SvgText x="118" y="14" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              성장기 · 진입 적기
            </SvgText>

            {/* 배지 → 점 연결선 */}
            <Line x1="118" y1="19" x2="118" y2="40" stroke="#F05C5C" strokeWidth="1" strokeDasharray="2 2" />

            {/* 현재 위치 점 */}
            <Circle cx="118" cy="44" r="8" fill="#F05C5C" fillOpacity="0.2" />
            <Circle cx="118" cy="44" r="3.5" fill="#F05C5C" />
          </Svg>

          {/* 단계 라벨 */}
          <View style={{ flexDirection: "row", marginTop: 2 }}>
            {["진입기", "성장기", "성숙기", "쇠퇴기"].map((stage, i) => (
              <Text
                key={i}
                style={{
                  flex: 1, textAlign: "center", fontSize: 11,
                  color: stage === "성장기" ? colors.coral : colors.grayMid,
                  fontWeight: stage === "성장기" ? "700" : "400",
                }}
              >
                {stage}
              </Text>
            ))}
          </View>

          {/* ── 산출 기반 지표 — 하드코딩 ── */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: "#EBEBEF", marginTop: 14, paddingTop: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.grayMid, letterSpacing: 0.5, marginBottom: 10 }}>산출 기반</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "검색량",    val: marketData?.search_volume_label ?? "—",    color: colors.coral },
                { label: "추세",      val: (() => { const t = marketData?.trend ?? marketData?.trend_id; return t != null ? (TREND_LABEL[t] ?? String(t)) : "—"; })(), color: colors.coral },
                { label: "성장률",    val: marketData?.yoy_pct != null ? `${marketData.yoy_pct > 0 ? "+" : ""}${Math.round(marketData.yoy_pct)}%` : "—", color: colors.coral },
                { label: "시장 크기", val: marketData?.market_size_label    ?? "—",   color: colors.grayMid },
              ].map((item, i) => (
                <View key={i} style={{ width: "47.5%", backgroundColor: "#F8F8F8", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 11, color: colors.grayMid, marginBottom: 5 }}>{item.label}</Text>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: item.color }}>{item.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── 도출 결과 ── */}
          <View style={{ marginTop: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.grayMid, letterSpacing: 0.5, marginBottom: 10 }}>도출 결과</Text>
            <View style={{ backgroundColor: "#F8F8F8", borderRadius: 12, overflow: "hidden" }}>
              {refData.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < refData.length - 1 ? 0.5 : 0, borderBottomColor: "#E5E5EA" }}>
                  <Text style={{ fontSize: 13, color: colors.grayMid }}>{item.label}</Text>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.black }}>{item.val}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 트렌드 키워드 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>트렌드 키워드 매칭</Text>
            <Text style={{ fontSize: 11, color: colors.grayMid }}>
              {trendKws.length > 0 ? `${matchedKw.length} / ${trendKws.length} 매칭` : "—"}
            </Text>
          </View>
          <View style={s.kwRow}>
            {(matchedKw.length > 0 || otherKw.length > 0 ? (
              <>
                {matchedKw.map((kw) => (
                  <View key={kw} style={[s.kwMatch, { flexDirection: "row", alignItems: "center", gap: 4 }]}>
                    <Text style={s.kwMatchText}>{kw}</Text>
                    <Svg width={11} height={11} viewBox="0 0 256 256">
                      <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
                    </Svg>
                  </View>
                ))}
                {otherKw.map((kw) => (
                  <View key={kw} style={s.kwNone}>
                    <Text style={s.kwNoneText}>{kw}</Text>
                  </View>
                ))}
              </>
            ) : (
              /* DB 데이터 로딩 전 폴백 */
              <>
                {["centella", "glass skin", "ceramide"].map((kw) => (
                  <View key={kw} style={[s.kwMatch, { flexDirection: "row", alignItems: "center", gap: 4 }]}>
                    <Text style={s.kwMatchText}>{kw}</Text>
                    <Svg width={11} height={11} viewBox="0 0 256 256">
                      <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
                    </Svg>
                  </View>
                ))}
                {["barrier cream", "SPF50+"].map((kw) => (
                  <View key={kw} style={s.kwNone}>
                    <Text style={s.kwNoneText}>{kw}</Text>
                  </View>
                ))}
              </>
            ))}
          </View>
        </View>

        </ScrollView>

        {viewMode ? (
          /* 상품 상세 보기 모드: 수정 | 삭제 버튼 */
          <View style={[common.bottomBar, { flexDirection: "row", gap: 10 }]}>
            <TouchableOpacity style={[common.btnDefault, { flex: 1 }]} onPress={onEdit} activeOpacity={0.8}>
              <Text style={common.btnDefaultText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[common.btnPrimary, { flex: 1, backgroundColor: "#CF1322" }]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={common.btnPrimaryText}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 신규 등록 모드: 이전 | 상품 등록하기 버튼 */
          <View style={[common.bottomBar, { flexDirection: "row", gap: 10 }]}>
            <TouchableOpacity style={[common.btnDefault, { flex: 1 }]} onPress={onBack}>
              <Text style={common.btnDefaultText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[common.btnPrimary, { flex: 2 }]} onPress={() => setShowSuccess(true)}>
              <Text style={common.btnPrimaryText}>상품 등록하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 등록 완료 팝업 */}
        {showDeleteSuccess && (
          <View style={s.successOverlay}>
            <View style={s.successBox}>
              <View style={[s.successIconWrap, { backgroundColor: "#CF1322" }]}>
                <Svg width={32} height={32} viewBox="0 0 256 256">
                  <Path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" fill="#fff" />
                </Svg>
              </View>
              <Text style={s.successTitle}>삭제되었습니다</Text>
              <Text style={s.successSub}>상품이 목록에서 제거되었어요</Text>
              <View style={s.successBtns}>
                <TouchableOpacity
                  style={s.successBtnPrimary}
                  onPress={() => { setShowDeleteSuccess(false); onDelete?.(viewProduct?.id); }}
                >
                  <Text style={s.successBtnPrimaryText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {showSuccess && (
          <View style={s.successOverlay}>
            <View style={s.successBox}>
              <View style={s.successIconWrap}>
                <Svg width={32} height={32} viewBox="0 0 256 256">
                  <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
                </Svg>
              </View>
              <Text style={s.successTitle}>상품이 등록되었습니다</Text>
              <Text style={s.successSub}>바이어들이 상품을 찾을 수 있어요</Text>
              <View style={s.successBtns}>
                <TouchableOpacity style={s.successBtnOutline} onPress={onHome}>
                  <Text style={s.successBtnOutlineText}>홈으로</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.successBtnPrimary}
                  onPress={() => {
                    const today = new Date();
                    const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,"0")}.${String(today.getDate()).padStart(2,"0")}`;
                    onRegister?.({
                      id: productId ?? Date.now(),
                      brand: product?.brandName || "",
                      name: product?.productName || "",
                      score: fitScore ?? 0,
                      cat: product?.subCategory || "",
                      status: "등록 완료",
                      date: dateStr,
                    });
                  }}
                >
                  <Text style={s.successBtnPrimaryText}>등록상품 보러가기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>)}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  // ─── 공통 카드 (홈 스타일) ────────────────────────────────
  // [STYLE CHANGED: secBlock → card — 홈 화면 둥근 카드 레이아웃 통일]
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 상단 등록 버튼 (StepBar 자리 대체 — 완료 후) ─────────
  // [STYLE CHANGED: 완료 후 StepBar 제거, 코랄 버튼이 그 자리에 표시]
  registerTopBtn: {
    backgroundColor: colors.coral,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  registerTopBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // ─── 산출 완료 배너 ──────────────────────────────────────
  completeBanner: { backgroundColor: colors.coral, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, flexDirection: "row", alignItems: "center", gap: 14 },
  completeBannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  completeBannerTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 3 },
  completeBannerSub: { fontSize: 12, color: "rgba(255,255,255,0.85)" },

  // ─── 상품 정보 요약 카드 ─────────────────────────────────
  productCardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  productCardBrand: { fontSize: 11, color: colors.grayMid, marginBottom: 3 },
  productCardName: { fontSize: 16, fontWeight: "700", color: colors.black, letterSpacing: -0.3 },
  productCardBadge: { backgroundColor: colors.coralBg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8, marginLeft: 8, marginTop: 2 },
  productCardBadgeText: { fontSize: 11, fontWeight: "600", color: colors.coral },
  productCardRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  productCardTag: { backgroundColor: "#F5F5F7", borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 0 },
  productCardTagText: { fontSize: 12, color: "#3A3A3C" },
  productCardMeta: { flexDirection: "row", gap: 16, borderTopWidth: 1, borderTopColor: "#EBEBEB", paddingTop: 10 },
  productCardMetaItem: { fontSize: 12, color: colors.grayMid },
  productCardMetaVal2: { fontWeight: "700", color: colors.black },
  productCardMetaVal: { fontWeight: "700", color: colors.mint },

  // ─── 원형 게이지 점수 ────────────────────────────────────
  // [STYLE CHANGED: 바 게이지 → 원형 게이지 + 수평 게이지 조합으로 교체 — 디자인 요청]
  scoreCircleRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCircleWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  scoreCircleCenter: { position: "absolute", alignItems: "center" },
  scoreCircleNum: { fontSize: 32, fontWeight: "700", color: colors.coral, letterSpacing: -1 },
  scoreCircleUnit: { fontSize: 11, color: colors.grayMid, marginTop: -2 },
  scoreCircleInfo: { flex: 1, justifyContent: "center" },
  scoreGrade: { fontSize: 18, fontWeight: "700", color: colors.black, marginBottom: 4, letterSpacing: -0.3 },
  scoreGradeDesc: { fontSize: 12, color: colors.grayMid, lineHeight: 18 },
  scoreBarTip: { fontSize: 11, color: colors.grayMid, marginTop: 5, textAlign: "right" },
  scoreBarBg: { backgroundColor: "#F2F2F7", borderRadius: 9999, height: 6 },
  scoreBarFill: { backgroundColor: colors.coral, borderRadius: 9999, height: 6 },

  // ─── 점수 산출 근거 리스트 ──────────────────────────────
  featureRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11 },
  featureName: { fontSize: 13, color: "#3A3A3C" },
  featureVal: { fontSize: 13, fontWeight: "600" },

  // ─── 가격 포지션 — 수직 선 위 점 그래프 ─────────────────
  priceTrack: { position: "relative", height: 28, marginVertical: 16 },           // 점 위치 컨테이너
  priceRangeBar: { position: "absolute", height: 5, backgroundColor: "#F2F2F7", borderRadius: 9999, top: 11.5, left: 0, right: 0 }, // 전체 범위 배경선
  priceIqr: { position: "absolute", height: 5, backgroundColor: "#E5E5EA", borderRadius: 9999, top: 11.5 }, // P25~P75 IQR 구간
  priceDot: { position: "absolute", width: 12, height: 12, borderRadius: 6, top: 8, marginLeft: -6 }, // 가격 위치 점
  priceLabels: { flexDirection: "row", justifyContent: "space-between" },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  priceLabelText: { fontSize: 11, color: colors.grayMid },
  legend: { flexDirection: "row", gap: 14, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.grayMid },

  // ─── 성분 위치 점수 — 수평 바 리스트 ────────────────────
  analysisRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aLabel: { fontSize: 12, color: "#3A3A3C", width: 96 },                          // 성분명 (고정 너비)
  aBarBg: { backgroundColor: "#F2F2F7", borderRadius: 9999, height: 4, flex: 1 },
  aBarFill: { backgroundColor: "#1C1C1E", borderRadius: 9999, height: 4 },
  aBadge: { backgroundColor: "#F8F8F8", borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 }, // "고농도" 배지
  aBadgeText: { fontSize: 11, fontWeight: "500", color: "#3A3A3C" },

  // ─── 카테고리 추이 차트 라벨 ────────────────────────────
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  chartLabelText: { fontSize: 11, color: "#C7C7CC" },                              // 10월~3월

  // ─── 트렌드 키워드 매칭 칩 ──────────────────────────────
  kwRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  kwMatch: { backgroundColor: "#1C1C1E", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 12 }, // 매칭된 키워드 — 검정
  kwMatchText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  kwNone: { backgroundColor: "#F8F8F8", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 12 },  // 미매칭 키워드 — 회색
  kwNoneText: { color: colors.grayMid, fontSize: 12 },

  // ─── 점수 근거 리스트 ────────────────────────────────────
  scoreItemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  scoreItemName: { fontSize: 13, color: colors.grayMid },
  scoreItemVal: { fontSize: 14, fontWeight: "700", color: colors.black },          // "+5.0점" 등

  // ─── 등록 완료 팝업 ──────────────────────────────────────
  successOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  successBox: {
    width: "84%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  successIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.coral,
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  successSub: { fontSize: 14, color: colors.grayMid, marginBottom: 28, textAlign: "center" },
  successBtns: { flexDirection: "row", gap: 10, width: "100%" },
  successBtnOutline: {
    flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: "#E5E5EA",
    paddingVertical: 14, alignItems: "center",
  },
  successBtnOutlineText: { fontSize: 15, fontWeight: "600", color: "#1C1C1E" },
  successBtnPrimary: {
    flex: 2, borderRadius: 10, backgroundColor: colors.coral,
    paddingVertical: 14, alignItems: "center",
  },
  successBtnPrimaryText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  // ─── 참고 지표 — 2열 카드 그리드 ────────────────────────
  refGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  refCard: { backgroundColor: "#F8F8F8", borderRadius: 10, padding: 14, width: "47.5%" },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  refLabel: { fontSize: 11, color: colors.grayMid, marginBottom: 6 },
  refVal: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  refSub: { fontSize: 11, color: colors.grayMid },
};
