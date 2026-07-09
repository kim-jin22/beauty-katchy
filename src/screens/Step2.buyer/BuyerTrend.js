import { View, Text, ScrollView } from "react-native";
import { Svg, Defs, LinearGradient, Stop, Path, Circle, Line } from "react-native-svg";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";

// TODO: [API] GET /api/trends/categories
//              → trend_timing 테이블 (trend_detail_id, yoy_pct, plc_stage) + category_detail (name_en) JOIN 조회
const CAT_DATA = [
  { name: "Moisturizer", w: 0.88, pct: "+12%", up: true },
  { name: "Sunscreen",   w: 0.74, pct: "+9%",  up: true },
  { name: "Serum",       w: 0.68, pct: "+7%",  up: true },
  { name: "Cleanser",    w: 0.45, pct: "+2%",  up: false },
  { name: "Mask Pack",   w: 0.20, pct: "−1%",  up: false },
];
// TODO: [API] GET /api/ingredient-trends?limit=5
//              → ingredient_trend 테이블 (ing_trend_id, us_keyword, us_yoy_pct, lag_month) — us_yoy_pct DESC 정렬, lag_month=0이면 NEW 표시
const KW_DATA = [
  { rank: 1, name: "glass skin",    pct: "+34%", top: true },
  { rank: 2, name: "centella",      pct: "+28%", top: true },
  { rank: 3, name: "ceramide",      pct: "+21%", top: true },
  { rank: 4, name: "barrier cream", pct: "NEW",  top: false, isNew: true },
  { rank: 5, name: "niacinamide",   pct: "+11%", top: false },
];
// TODO: [API] GET /api/ingredient-trends/market-compare
//              → ingredient_trend 테이블 (kr_keyword, us_keyword, us_yoy_pct) 기반 KR·US 시장 수요 지수 비교 집계
const COMPARE_DATA = [
  { name: "세럼",          kr: 80, us: 68 },
  { name: "선케어",        kr: 91, us: 74 },
  { name: "모이스처라이저", kr: 72, us: 88 },
];

export default function BuyerTrend({ onTab }) {
  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="트렌드" onNotice={() => {}} />

      <View style={s.subHeader}>
        <Text style={s.subText}>ULTA · Sephora · iHerb 기반 · 2025 Q1</Text>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* 카테고리 성장률 */}
        <View style={[s.card, { marginTop: 14 }]}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>카테고리 성장률</Text>
            <Text style={s.secSub}>미국 기준</Text>
          </View>
          {CAT_DATA.map((c, i) => (
            <View key={i} style={[s.catRow, { marginBottom: i < CAT_DATA.length - 1 ? 14 : 0 }]}>
              <Text style={s.catName}>{c.name}</Text>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${c.w * 100}%`, backgroundColor: c.up ? "#1C1C1E" : "#D1D1D6" }]} />
              </View>
              <Text style={[s.catDiff, { color: c.up ? colors.coral : colors.grayMid }]}>{c.pct}</Text>
            </View>
          ))}
        </View>

        {/* 세럼 추이 차트 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>세럼 카테고리 추이</Text>
            <Text style={s.secSub}>최근 6개월</Text>
          </View>
          <View style={s.chartTopRow}>
            <Text style={s.chartVal}>+23%</Text>
            <Text style={s.chartChange}>▲ 6개월 성장</Text>
          </View>
          <Svg width="100%" height={90} viewBox="0 0 334 90" preserveAspectRatio="none" style={s.chartSvg}>
            <Defs>
              <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#F05C5C" stopOpacity="0.12" />
                <Stop offset="100%" stopColor="#F05C5C" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Line x1="0" y1="20" x2="334" y2="20" stroke="#F2F2F7" strokeWidth="1" />
            <Line x1="0" y1="45" x2="334" y2="45" stroke="#F2F2F7" strokeWidth="1" />
            <Line x1="0" y1="70" x2="334" y2="70" stroke="#F2F2F7" strokeWidth="1" />
            <Path
              d="M0,72 C20,70 35,68 55,63 C75,57 90,52 110,46 C130,40 148,37 168,32 C188,27 205,24 225,19 C248,14 268,11 290,9 C305,7 320,7 334,6"
              fill="none" stroke="#F05C5C" strokeWidth="1.8" strokeLinecap="round"
            />
            <Path
              d="M0,72 C20,70 35,68 55,63 C75,57 90,52 110,46 C130,40 148,37 168,32 C188,27 205,24 225,19 C248,14 268,11 290,9 C305,7 320,7 334,6 L334,90 L0,90 Z"
              fill="url(#grad1)"
            />
            <Circle cx="334" cy="6" r="3" fill="#F05C5C" />
            <Circle cx="334" cy="6" r="6" fill="#F05C5C" fillOpacity="0.2" />
          </Svg>
          <View style={s.chartLabels}>
            {["10월", "11월", "12월", "1월", "2월", "3월"].map((m) => (
              <Text key={m} style={s.chartLabelText}>{m}</Text>
            ))}
          </View>
        </View>

        {/* 급상승 키워드 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>급상승 키워드</Text>
            <Text style={s.secSub}>BERTopic 기반</Text>
          </View>
          {KW_DATA.map((k, i) => (
            <View key={i} style={[s.kwRow, { borderBottomWidth: i < KW_DATA.length - 1 ? 0.5 : 0, borderBottomColor: "#EBEBEF" }]}>
              <Text style={[s.kwRank, { color: k.top ? colors.coral : "#C7C7CC" }]}>{k.rank}</Text>
              <Text style={s.kwName}>{k.name}</Text>
              <View style={s.kwBarBg}>
                <View style={[s.kwBarFill, { width: `${95 - (k.rank - 1) * 15}%`, backgroundColor: k.top ? "#1C1C1E" : "#D1D1D6" }]} />
              </View>
              {k.isNew ? (
                <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>
              ) : (
                <Text style={[s.kwChange, { color: k.top ? colors.coral : colors.grayMid }]}>{k.pct}</Text>
              )}
            </View>
          ))}
        </View>

        {/* 국내 vs 미국 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>국내 vs 미국</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={s.legendItemRow}>
                <View style={[s.legendDot, { backgroundColor: "#E5E5EA" }]} />
                <Text style={s.legendText}>국내</Text>
              </View>
              <View style={s.legendItemRow}>
                <View style={[s.legendDot, { backgroundColor: "#1C1C1E" }]} />
                <Text style={[s.legendText, { color: "#1C1C1E", fontWeight: "500" }]}>미국</Text>
              </View>
            </View>
          </View>
          {COMPARE_DATA.map((c, i) => (
            <View key={i} style={[s.compareRow, { marginBottom: i < COMPARE_DATA.length - 1 ? 14 : 0 }]}>
              <Text style={s.compareName}>{c.name}</Text>
              <View style={s.doubleBar}>
                <View style={[s.barKr, { width: `${c.kr}%` }]} />
                <View style={[s.barUs, { width: `${c.us}%` }]} />
              </View>
              <View style={s.compareVals}>
                <Text style={s.valKr}>{c.kr}%</Text>
                <Text style={s.valUs}>{c.us}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar role="buyer" active="트렌드" onTab={onTab} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  // [STYLE CHANGED: backgroundColor #fff → pageBg, body paddingHorizontal 제거, card 구조 도입]
  screen: { flex: 1, backgroundColor: pageBg },
  body: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 26, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 서브헤더 (데이터 출처 안내) ────────────────────────
  subHeader: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 12 },
  subText: { fontSize: 12, color: colors.grayMid },

  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EBEBEF", marginBottom: 16 },
  // [STYLE CHANGED: secLabel fontSize 13 → 18]
  secLabel: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 12, color: colors.grayMid },

  // ─── 카테고리 성장률 — 수평 바 리스트 ──────────────────
  catRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  catName: { fontSize: 13, color: "#1C1C1E", width: 90 },
  barBg: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 3, height: 5 },
  barFill: { borderRadius: 3, height: 5 },
  catDiff: { fontSize: 12, fontWeight: "700", width: 38, textAlign: "right" },

  // ─── 세럼 추이 라인 차트 ────────────────────────────────
  chartTopRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 4 },
  chartVal: { fontSize: 22, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5 },
  chartChange: { fontSize: 13, fontWeight: "700", color: colors.coral },
  chartSvg: { marginVertical: 8 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between" },
  chartLabelText: { fontSize: 11, color: "#C7C7CC" },

  // ─── 급상승 키워드 — 순위 리스트 ───────────────────────
  kwRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  kwRank: { fontSize: 13, fontWeight: "700", width: 18 },
  kwName: { fontSize: 14, fontWeight: "500", color: "#1C1C1E", flex: 1 },
  kwBarBg: { backgroundColor: "#F2F2F7", borderRadius: 3, height: 3, width: 72 },
  kwBarFill: { borderRadius: 3, height: 3 },
  kwChange: { fontSize: 11, fontWeight: "700" },
  newBadge: { backgroundColor: colors.coral, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 7 },
  newBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },

  // ─── 국내 vs 미국 비교 — 이중 바 ───────────────────────
  compareRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  compareName: { fontSize: 12, color: "#3A3A3C", width: 80 },
  doubleBar: { flex: 1, gap: 5 },
  barKr: { borderRadius: 3, height: 4, backgroundColor: "#E5E5EA" },
  barUs: { borderRadius: 3, height: 4, backgroundColor: "#1C1C1E" },
  compareVals: { gap: 5, width: 32, alignItems: "flex-end" },
  valKr: { fontSize: 11, color: colors.grayMid },
  valUs: { fontSize: 11, fontWeight: "700", color: "#1C1C1E" },

  // ─── 범례 ─────────────────────────────────────────────
  legendItemRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 3, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.grayMid },
};
