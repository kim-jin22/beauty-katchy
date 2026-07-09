import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";

// TODO: [API] GET /api/marketing/matched-products
//              → matched_products 테이블 (product_id, brand, name, category, price, matched_at, status) 조회
const NEW_MATCHED = [
  {
    id: 1,
    brand: "아누아",
    name: "어성초 77 히알루론산 수분 진정 토너",
    category: "스킨케어",
    subCategory: "수분 진정 토너",
    price: 33,
    spec: null,
    matchedAt: "방금 전",
  },
];

// TODO: [API] GET /api/marketing/campaigns
//              → campaigns 테이블 (product_id, influencer_handle, campaign_day, reach, unique_reach, status) 조회
const IN_PROGRESS = [
  {
    id: 3,
    brand: "코스알엑스",
    name: "달팽이 96 파워 에센스",
    category: "스킨케어",
    price: 28,
    campaignDays: 14,
    influencer: "@glowwithava",
    reach: "2.1M",
    impressions: "480K",
  },
];

export default function MarketingTab({ onTab, onProductSelect, onCampaignReport }) {
  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="마케팅" />

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* ── 신규 매칭 완료 ── */}
        <View style={s.secCard}>
          <View style={s.secHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.secLabel}>상품 매칭 완료</Text>
              <View style={s.pulseDot} />
            </View>
            <Text style={s.secSub}>{NEW_MATCHED.length}개</Text>
          </View>

          {NEW_MATCHED.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[s.productCard, i < NEW_MATCHED.length - 1 && { marginBottom: 10 }]}
              onPress={() => onProductSelect?.(p)}
              activeOpacity={0.85}
            >
              <View style={s.newBadgeRow}>
                <View style={s.newDot} />
                <Text style={s.newLabel}>NEW</Text>
                <Text style={s.matchedAt}>{p.matchedAt}</Text>
              </View>

              <View style={s.productBody}>
                <View style={{ flex: 1 }}>
                  <Text style={s.productBrand}>{p.brand}</Text>
                  <Text style={s.productName}>{p.name}</Text>
                  <Text style={s.productMeta}>
                    {p.category} · {p.subCategory}
                    {p.spec ? ` · ${p.spec}` : ""} · ${p.price}
                  </Text>
                </View>
                <View style={s.arrowCircle}>
                  <Text style={s.arrowText}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 진행 중인 캠페인 ── */}
        <View style={s.secCard}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>진행 중인 캠페인</Text>
            <Text style={s.secSub}>{IN_PROGRESS.length}개</Text>
          </View>

          {IN_PROGRESS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={s.campaignCard}
              onPress={() => onCampaignReport?.(p)}
              activeOpacity={0.85}
            >
              <View style={s.campaignTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.productBrand}>{p.brand}</Text>
                  <Text style={s.productName}>{p.name}</Text>
                </View>
                <View style={s.activeBadge}>
                  <View style={s.activeDot} />
                  <Text style={s.activeText}>진행 중</Text>
                </View>
              </View>

              <View style={s.campaignMeta}>
                <Text style={s.campaignMetaText}>{p.influencer}</Text>
                <Text style={s.metaDot}>·</Text>
                <Text style={s.campaignMetaText}>캠페인 {p.campaignDays}일차</Text>
              </View>

              <View style={s.statRow}>
                <View style={s.statItem}>
                  <Text style={s.statLabel}>예상 노출</Text>
                  <Text style={s.statVal}>{p.reach}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statLabel}>유니크 리치</Text>
                  <Text style={s.statVal}>{p.impressions}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statLabel}>리포트</Text>
                  <Text style={[s.statVal, { color: colors.coral }]}>보기 →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomBar role="buyer" active="마케팅" onTab={onTab} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: pageBg },
  body:   { flex: 1 },

  // ─── 섹션 카드 ───────────────────────────────────────────
  secCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEF",
    marginBottom: 14,
  },
  secLabel: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  secSub:   { fontSize: 12, color: "#848488" },

  // ─── 신규 펄스 도트 ──────────────────────────────────────
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral },

  // ─── 신규 매칭 상품 카드 ─────────────────────────────────
  productCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
  },
  newBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  newDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral },
  newLabel: { fontSize: 10, fontWeight: "700", color: colors.coral, letterSpacing: 0.8 },
  matchedAt: { fontSize: 11, color: "#848488" },

  productBody: { flexDirection: "row", alignItems: "center" },
  productBrand: { fontSize: 11, fontWeight: "600", color: "#848488", marginBottom: 2 },
  productName:  { fontSize: 13, fontWeight: "700", color: "#1C1C1E", paddingVertical: 6},
  productMeta:  { fontSize: 12, color: "#848488" },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 22, color: "#fff", marginTop: -2 },

  // ─── 진행 중인 캠페인 카드 ───────────────────────────────
  campaignCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
  },
  campaignTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.mintBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.mint },
  activeText: { fontSize: 11, fontWeight: "600", color: colors.mint },

  campaignMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  campaignMetaText: { fontSize: 12, color: "#848488" },
  metaDot: { fontSize: 12, color: "#D1D1D6" },

  // ─── 캠페인 통계 3단 ─────────────────────────────────────
  statRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statItem:    { flex: 1, alignItems: "center" },
  statLabel:   { fontSize: 10, color: "#848488", marginBottom: 4 },
  statVal:     { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  statDivider: { width: 1, height: 28, backgroundColor: "#EBEBEF" },
};
