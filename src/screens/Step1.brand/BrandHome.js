import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Animated, Image } from "react-native";
import { Svg, Defs, LinearGradient, Stop, Path, Circle, Line } from "react-native-svg";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";
import { getProductImage } from "../../data/productImages";

// TODO: [API] GET /api/brand/:brandId/metrics
//              → products 등록 수, saved_prod 관심 수, sourcing 매칭 성사 수 (status='완료'), fit_scores 평균 fitscore 집계
const METRICS = [
  { label: "등록 상품",  val: "12", sub: "+2",        color: colors.coral },
  { label: "바이어 관심", val: "34", sub: "+8",        color: colors.coral },
  { label: "매칭 성사",  val: "3",  sub2: "진행 중 1", color: colors.mint },
  { label: "평균 ROC-AUC", val: "0.82", sub2: "센티멘트 기반", color: colors.grayMid, valColor: colors.coralDark },
];

function inferCat(name) {
  if (!name) return "스킨케어";
  if (name.includes("클렌징오일") || (name.includes("클렌징") && name.includes("오일"))) return "클렌징오일";
  if (name.includes("클렌징워터") || (name.includes("클렌징") && name.includes("워터"))) return "클렌징워터";
  if (name.includes("클렌징 파우더") || name.includes("클렌징파우더")) return "클렌징파우더";
  if (name.includes("클렌징폼") || (name.includes("클렌징") && name.includes("폼"))) return "클렌징폼";
  if (name.includes("선스틱")) return "선스틱";
  if (name.includes("선크림")) return "선크림";
  if (name.includes("베이지") || name.includes("커버")) return "선쿠션";
  if (name.includes("세럼")) return "세럼";
  if (name.includes("미스트")) return "미스트";
  if (name.includes("토너")) return "토너";
  if (name.includes("앰플")) return "앰플";
  if (name.includes("에센스")) return "에센스";
  if (name.includes("크림")) return "크림";
  if (name.includes("패드")) return "패드";
  if (name.includes("폼")) return "클렌징폼";
  return "스킨케어";
}

const SCORE_MAP = {
  315: 82, 397: 85, 674: 80, 894: 78, 897: 83,
  1166: 81, 1254: 88, 1331: 87, 1389: 76,
  1464: 86, 1214: 84, 1567: 84, 1555: 79,
  611: 90, 1466: 83,
};

const PRODUCTS_FALLBACK = [
  { brand: "아누아", name: "아누아 어성초 피지쏙 클렌징오일 200ml",   score: 85, cat: "클렌징오일", status: "등록 완료" },
  { brand: "아누아", name: "아누아 어성초 피지쏙 모공 폼 150ml",      score: 80, cat: "클렌징폼",  status: "등록 완료" },
];

// TODO: [API] GET /api/trends/categories
//              → trend_timing 테이블 (plc_stage, yoy_pct) + category_detail (name_en) JOIN 조회
const TREND_CATS = [
  ["Moisturizer", 0.88, "+12%"],
  ["Sunscreen",   0.74, "+9%"],
  ["Serum",       0.68, "+7%"],
];

export default function BrandHome({ onTab, onRegister, onProductDetail, onTitlePress, onFab }) {
  const [refreshing, setRefreshing] = useState(false);
  const products = PRODUCTS_FALLBACK;

  const anim = useRef(METRICS.map(() => ({
    opacity: new Animated.Value(0),
    y: new Animated.Value(20),
  }))).current;

  const numAnim = useRef(METRICS.map(() => ({
    opacity: new Animated.Value(0),
    y: new Animated.Value(10),
  }))).current;

  const playAnim = () => {
    anim.forEach(({ opacity, y }) => { opacity.setValue(0); y.setValue(20); });
    anim.forEach(({ opacity, y }, i) => {
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(y, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
        ]),
      ]).start();
    });
  };

  useEffect(() => { playAnim(); }, []);

  useEffect(() => {
    let alive = true;
    const startLoop = ({ opacity, y }) => {
      if (!alive) return;
      const fadeIn  = 300 + Math.random() * 700;
      const hold    = 1000 + Math.random() * 2500;
      const fadeOut = 300 + Math.random() * 600;
      opacity.setValue(0);
      y.setValue(6 + Math.random() * 8);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: fadeIn,  useNativeDriver: true }),
          Animated.timing(y,       { toValue: 0, duration: fadeIn,  useNativeDriver: true }),
        ]),
        Animated.delay(hold),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: fadeOut, useNativeDriver: true }),
          Animated.timing(y,       { toValue: -(4 + Math.random() * 6), duration: fadeOut, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => { if (finished) startLoop({ opacity, y }); });
    };
    const timers = numAnim.map((a, i) =>
      setTimeout(() => startLoop(a), Math.random() * 1200)
    );
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    playAnim();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={s.screen}>
      <TopBar title="Beauty Katchy" titleLeft bgColor={colors.coral} onNotice={() => {}} onTitlePress={onTitlePress} titleStyle={{ marginTop: 12 }} />

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />}
      >

        {/* 인사 카드 */}
        <View style={[s.card, { marginTop: 14 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={s.greetHi}>안녕하세요,</Text>
              <Text style={s.greetName}><Text style={{ color: colors.coral }}>아누아</Text> <Text style={{ fontWeight: "700" }}>담당자</Text>님</Text>
              <Text style={s.greetSub}>Beauty Katchy for Brands</Text>
            </View>
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>Brand</Text>
            </View>
          </View>
        </View>

        {/* 주요 지표 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>주요 지표</Text>
          </View>
          <View style={s.metricGrid}>
            {METRICS.map((m, i) => (
              <Animated.View key={i} style={[s.metricCard, { opacity: anim[i].opacity, transform: [{ translateY: anim[i].y }] }]}>
                <Text style={s.metricLabel}>{m.label}</Text>
                <Text style={[s.metricVal, m.valColor && { color: m.valColor }]}>{m.val}</Text>
                {m.sub ? (
                  <Animated.View style={{ opacity: numAnim[i].opacity, transform: [{ translateY: numAnim[i].y }] }}>
                    <Text style={[s.metricSub, { color: m.color }]}>{m.sub}</Text>
                  </Animated.View>
                ) : (
                  <Text style={[s.metricSub, { color: m.color }]}>{m.sub2}</Text>
                )}
              </Animated.View>
            ))}
          </View>
        </View>

        {/* 등록 상품 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>등록 상품</Text>
            <TouchableOpacity onPress={() => onTab?.("상품")}>
              <Text style={s.secSub}>전체보기</Text>
            </TouchableOpacity>
          </View>
          {products.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[s.productRow, { borderBottomWidth: i < products.length - 1 ? 0.5 : 0, borderBottomColor: "#F2F2F7" }]}
              onPress={() => onProductDetail?.(p)}
            >
              <View style={s.productThumb}>
                {getProductImage(p.name) && (
                  <Image source={getProductImage(p.name)} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                )}
              </View>
              <View style={s.productInfo}>
                <Text style={s.productBrand}>{p.brand}</Text>
                <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                <View style={s.productTags}>
                  <View style={s.tagScore}><Text style={s.tagScoreText}>Fit {p.score}</Text></View>
                  <View style={s.tagCat}><Text style={s.tagCatText}>{p.cat}</Text></View>
                </View>
              </View>
              <Text style={s.productArrow}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.registerBtn} onPress={onRegister}>
            <Text style={s.registerBtnText}>+ 상품 등록하기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar role="brand" active="홈" onTab={onTab} onFab={onFab} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: pageBg },
  body: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 26, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 인사 카드 ───────────────────────────────────────────
  // [STYLE CHANGED: roleHeader 제거 → greetCard (ScrollView 내 카드)로 변경]
  greetHi:   { fontSize: 13, color: colors.grayMid, marginBottom: 4 },
  greetName: { fontSize: 20, fontWeight: "500", color: "#1C1C1E", letterSpacing: -0.3, marginBottom: 4 },
  greetSub:  { fontSize: 12, color: colors.grayMid },
  roleBadge: { backgroundColor: colors.coral, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  roleBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  // [STYLE CHANGED: borderBottomColor #D8D8DE → #EBEBEF — 구분선 연하게]
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EBEBEF", marginBottom: 10 },
  // [STYLE CHANGED: fontSize 15 → 18 — 섹션 제목 키우기]
  secLabel: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 12, color: colors.grayMid },

  // ─── Fit Score 카드 ──────────────────────────────────────
  fitCard: { backgroundColor: "#F8F8F8", borderRadius: 16, padding: 20 },
  fitRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  fitNum: { fontSize: 56, fontWeight: "700", color: colors.coral, letterSpacing: -2, lineHeight: 60 }, // 큰 점수 숫자
  fitTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", marginBottom: 4 },
  fitSub: { fontSize: 12, color: colors.grayMid, marginBottom: 10 },
  fitBarBg: { backgroundColor: "#E5E5EA", borderRadius: 9999, height: 5 },    // 게이지 배경
  fitBarFill: { backgroundColor: colors.coral, borderRadius: 9999, height: 5 }, // 게이지 채움
  fitBadge: { alignSelf: "flex-start", backgroundColor: colors.coral, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8, marginTop: 8 },
  fitBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },             // "High Match"

  // ─── 주요 지표 — 2열 카드 그리드 ────────────────────────
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "47.5%", backgroundColor: "#F8F8F8", borderRadius: 12, padding: 14 },
  // [STYLE CHANGED: metricLabel 12→13, metricVal 22→25, metricSub 13→12 — 바이어 홈 폰트 크기에 맞춤]
  metricLabel: { fontSize: 13, color: colors.grayMid, marginBottom: 6 },
  metricVal: { fontSize: 25, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },
  metricSub: { fontSize: 12, fontWeight: "500" },
  metricSub2: { fontSize: 12, fontWeight: "500" },

  // ─── 관심 카테고리 트렌드 차트 ──────────────────────────
  chartTopRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 4 },
  chartVal: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  chartChange: { fontSize: 12, fontWeight: "700", color: colors.coral },
  chartSvg: { marginVertical: 8 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between" },
  // [STYLE CHANGED: fontSize 11 → 12, catName 13 → 14 — 전체 폰트 키우기]
  chartLabelText: { fontSize: 12, color: "#C7C7CC" },
  catRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  catName: { fontSize: 14, color: "#1C1C1E", width: 88 },
  barBg: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 3, height: 5 },
  barFill: { borderRadius: 3, height: 5, backgroundColor: "#1C1C1E" },
  catDiff: { fontSize: 12, fontWeight: "700", color: colors.coral, width: 38, textAlign: "right" },

  // ─── 현황판 ──────────────────────────────────────────────
  statusRow: { flexDirection: "row", marginBottom: 16 },
  statusItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statusItemBorder: { borderRightWidth: 1, borderRightColor: "#EBEBEF" },
  statusVal: { fontSize: 22, fontWeight: "700", marginBottom: 3 },
  statusLabel: { fontSize: 11, color: colors.grayMid },

  // ─── 등록 상품 리스트 ────────────────────────────────────
  productRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  productThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#F2F2F7", borderWidth: 1, borderColor: "#E5E5EA" }, // 상품 이미지 placeholder
  // [STYLE CHANGED: fontSize 8 → 11, 9 → 11 — iOS 최소 폰트 11pt 준수]
  thumbCat: { fontSize: 11, color: "#C7C7CC", textTransform: "uppercase" },
  thumbBrand: { fontSize: 11, fontWeight: "700", color: "#D1D1D6" },
  productInfo: { flex: 1 },
  // [STYLE CHANGED: productName 14→15 — 바이어 홈 폰트 크기에 맞춤]
  productBrand: { fontSize: 12, color: colors.grayMid, marginBottom: 2 },
  productName: { fontSize: 15, fontWeight: "500", color: "#1C1C1E", marginBottom: 4 },
  productTags: { flexDirection: "row", gap: 4 },
  tagScore: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#FEF0F0" },
  tagScoreText: { fontSize: 12, fontWeight: "500", color: colors.coral },
  tagCat: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#F2F2F7" },
  tagCatText: { fontSize: 12, fontWeight: "500", color: colors.grayMid },
  productArrow: { fontSize: 14, color: "#C7C7CC" },                        // 우측 › 화살표
  registerBtn: { backgroundColor: colors.coral, borderRadius: 8, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 4 },
  registerBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
};
