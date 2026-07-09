import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, ScrollView } from "react-native";
import TopBar from "../../components/TopBar";
import { colors } from "../../styles";

// TODO: [API] GET /api/price-clusters/:categoryDetailId/tiers
//              → price_cluster 테이블 (price_tier, avg_price, avg_discount) + products (price) 기반 Tier 구조 및 마진율 계산
const TIERS = [
  { label: "Tier 1", style: "tier1", moq: "500개+", price: "$10.00", margin: "42%", marginColor: "#0A7A5A" },
  { label: "Tier 2", style: "tier2", moq: "200개+", price: "$12.00", margin: "35%", marginColor: "#3A3A3C" },
  { label: "Tier 3", style: "tier3", moq: "50개+",  price: "$14.00", margin: "28%", marginColor: colors.grayMid },
];
// TODO: [API] GET /api/price-clusters/:categoryDetailId/benchmark
//              → price_cluster 테이블 (min_price, avg_price, max_price) 에서 최저·평균·최고가 조회
const BENCH = [
  { label: "최저가", fill: 0.30, val: "$16.99" },
  { label: "평균가", fill: 0.60, val: "$24.50" },
  { label: "최고가", fill: 0.90, val: "$38.00" },
];

export default function BuyerNegotiation({ onBack, onMatchRequest }) {
  const [wished, setWished] = useState(false);

  const tierBadgeStyle = (style) => {
    if (style === "tier1") return [s.tierBadge, s.tier1];
    if (style === "tier2") return [s.tierBadge, s.tier2];
    return [s.tierBadge, s.tier3];
  };
  const tierBadgeTextStyle = (style) => ({
    fontSize: 11, fontWeight: "700",
    color: style === "tier1" ? "#fff" : style === "tier2" ? "#1C1C1E" : colors.grayMid,
  });

  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="협상 가이드" onBack={onBack} />

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* 상품 요약 */}
        <View style={[s.secBlock, { borderTopWidth: 0 }]}>
          <View style={s.productRow}>
            <View style={s.productThumb}>
              <Text style={s.thumbCat}>Skincare</Text>
              <Text style={s.thumbBrand}>INNISFREE</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.productBrand}>이니스프리</Text>
              <Text style={s.productName}>그린티 씨드 세럼 80ml</Text>
              <View style={s.fitBadge}><Text style={s.fitBadgeText}>Fit Score 91</Text></View>
            </View>
          </View>
        </View>

        {/* 티어별 공급가 */}
        <View style={s.secBlock}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>티어별 공급가</Text>
            <Text style={s.secSub}>MOQ 기준</Text>
          </View>
          {/* 테이블 헤더 */}
          <View style={s.tableHeader}>
            {["티어", "MOQ", "공급가", "마진율"].map((h, i) => (
              <Text key={h} style={[s.th, i === 0 ? { flex: 1.2 } : { flex: 1, textAlign: "right" }]}>{h}</Text>
            ))}
          </View>
          {/* 테이블 행 */}
          {TIERS.map((t, i) => (
            <View key={i} style={[s.tableRow, { borderBottomWidth: i < TIERS.length - 1 ? 0.5 : 0, borderBottomColor: "#F8F8F8" }]}>
              <View style={[tierBadgeStyle(t.style), { flex: 1.2 }]}>
                <Text style={tierBadgeTextStyle(t.style)}>{t.label}</Text>
              </View>
              <Text style={[s.td, { flex: 1, textAlign: "right", color: colors.grayMid, fontSize: 12 }]}>{t.moq}</Text>
              <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: "700", fontSize: 14 }]}>{t.price}</Text>
              <Text style={[s.td, { flex: 1, textAlign: "right", fontWeight: "700", color: t.marginColor }]}>{t.margin}</Text>
            </View>
          ))}
        </View>

        {/* 아마존 벤치마크 */}
        <View style={s.secBlock}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>아마존 가격 벤치마크</Text>
            <Text style={s.secSub}>유사 상품 기준</Text>
          </View>
          {BENCH.map((b, i) => (
            <View key={i} style={[s.benchRow, { marginBottom: i < BENCH.length - 1 ? 16 : 8 }]}>
              <Text style={s.benchLabel}>{b.label}</Text>
              <View style={s.benchBarBg}>
                <View style={[s.benchBarFill, { width: `${b.fill * 100}%` }]} />
                <View style={s.benchBarMine} />
              </View>
              <Text style={s.benchVal}>{b.val}</Text>
            </View>
          ))}
          <View style={s.benchLegend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#1C1C1E" }]} />
              <Text style={s.legendText}>아마존 가격</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.coral, width: 2 }]} />
              <Text style={s.legendText}>Tier 1 공급가 기준</Text>
            </View>
          </View>
        </View>

        {/* 참고 */}
        <View style={[s.secBlock, { paddingBottom: 0 }]}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>참고</Text>
          </View>
          <View style={s.alertInfo}>
            <Text style={s.alertInfoText}>
              Tier 1 공급가 <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>$10.00</Text> 기준 아마존 평균가 대비 예상 마진은{" "}
              <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>약 42%</Text>예요.{"\n"}
              동일 카테고리 평균 마진율 <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>31%</Text>보다 높은 수준이에요.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={s.bottomBar}>
        <View style={s.btnRow}>
          <Pressable
            style={({ pressed }) => [s.btnPrimary, pressed && s.btnPrimaryPressed]}
            onPress={onMatchRequest}
          >
            <Text style={s.btnPrimaryText}>매칭 요청</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.btnDefault, pressed && { backgroundColor: "#F2F2F7" }]}>
            <Text style={s.btnDefaultText}>샘플 요청</Text>
          </Pressable>
          <TouchableOpacity
            style={[s.wishBtn, wished && s.wishBtnOn]}
            onPress={() => setWished(!wished)}
          >
            <Text style={{ fontSize: 16, color: wished ? colors.coral : "#D1D1D6" }}>{wished ? "♥" : "♡"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: "#fff" },
  body: { flex: 1, paddingHorizontal: 28 },
  secBlock: { paddingVertical: 24, borderTopWidth: 1, borderTopColor: "#D8D8DE" },
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#D8D8DE", marginBottom: 20 },
  secLabel: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 11, color: colors.grayMid },

  // ─── 상품 요약 헤더 ──────────────────────────────────────
  productRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  productThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center" },
  // [STYLE CHANGED: fontSize 8 → 11 — iOS 최소 폰트 11pt 준수]
  thumbCat: { fontSize: 11, color: "#C7C7CC", textTransform: "uppercase" },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  thumbBrand: { fontSize: 11, fontWeight: "700", color: "#D1D1D6" },
  productBrand: { fontSize: 11, color: colors.grayMid, marginBottom: 3 },
  productName: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", lineHeight: 21, marginBottom: 4 },
  fitBadge: { alignSelf: "flex-start", backgroundColor: colors.coral, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  fitBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },        // "Fit Score 91"

  // ─── 티어별 공급가 테이블 ────────────────────────────────
  tableHeader: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#D8D8DE" },
  th: { fontSize: 11, color: colors.grayMid, fontWeight: "500" },          // 헤더셀 (티어/MOQ/공급가/마진율)
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  td: { fontSize: 13, color: "#3A3A3C" },
  tierBadge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8, alignSelf: "flex-start" }, // 티어 배지 공통
  tier1: { backgroundColor: "#1C1C1E" },                                   // Tier 1 — 검정
  tier2: { backgroundColor: "#F2F2F7" },                                   // Tier 2 — 회색
  tier3: { backgroundColor: "#F2F2F7" },                                   // Tier 3 — 회색

  // ─── 아마존 가격 벤치마크 — 바 차트 ─────────────────────
  benchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benchLabel: { fontSize: 12, color: "#3A3A3C", width: 46 },               // "최저가" 등 라벨
  benchBarBg: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 3, height: 5, position: "relative" },
  benchBarFill: { borderRadius: 3, height: 5, backgroundColor: "#1C1C1E" },
  benchBarMine: { position: "absolute", top: -3, left: "48%", width: 2, height: 11, backgroundColor: colors.coral, borderRadius: 2 }, // Tier 1 기준선 (코랄 세로선)
  benchVal: { fontSize: 12, fontWeight: "700", color: "#1C1C1E", width: 44, textAlign: "right" },
  benchLegend: { flexDirection: "row", gap: 14, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 3, borderRadius: 2 },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  legendText: { fontSize: 11, color: colors.grayMid },

  // ─── 참고 안내 박스 ──────────────────────────────────────
  alertInfo: { backgroundColor: "#F8F8F8", borderRadius: 8, padding: 14 },
  alertInfoText: { fontSize: 12, color: colors.grayMid, lineHeight: 20 },

  // ─── 하단 버튼 바 (매칭요청 / 샘플요청 / 찜) ────────────
  bottomBar: { paddingTop: 14, paddingBottom: 36, paddingHorizontal: 28, borderTopWidth: 0.5, borderTopColor: "#D8D8DE" },
  btnRow: { flexDirection: "row", gap: 10 },
  btnPrimary: { flex: 1, backgroundColor: colors.coral, borderRadius: 8, paddingVertical: 20, alignItems: "center" },
  btnPrimaryPressed: { backgroundColor: colors.coralDark },
  btnPrimaryText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  btnDefault: { flex: 1, borderWidth: 1.5, borderColor: "#D1D1D6", borderRadius: 8, paddingVertical: 20, alignItems: "center" }, // 샘플 요청 — 테두리 버튼
  btnDefaultText: { fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
  wishBtn: { width: 48, borderRadius: 8, borderWidth: 1.5, borderColor: "#D1D1D6", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }, // ♥ 찜 버튼
  wishBtnOn: { borderColor: colors.coral },
};
