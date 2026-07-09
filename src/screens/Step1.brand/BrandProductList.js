import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Svg, Path } from "react-native-svg";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";
import { getProductImage } from "../../data/productImages";

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

// ※ 어성초 77 히알루론산 수분 진정 토너 350ml는 시연 중 직접 등록 예정이므로 제외
// ※ 피디알엔 캡슐 100 세럼 중복·1ml 삭제, 포어 컨트롤 클렌징오일 200ml 중복 제거
const ANUA_PRODUCTS = [
  { id: 397,  brand: "아누아", name: "아누아 어성초 피지쏙 클렌징오일",              cat: "클렌징오일",   status: "심사 중",   score: 85, date: "2025.02.15", activeIngredients: [] },
  { id: 315,  brand: "아누아", name: "아누아 어성초 포어 컨트롤 클렌징오일",         cat: "클렌징오일",   status: "등록 완료", score: 82, date: "2025.02.10", activeIngredients: [] },
  { id: 674,  brand: "아누아", name: "아누아 어성초 피지쏙 모공 폼",                 cat: "클렌징폼",     status: "등록 완료", score: 80, date: "2025.02.05", activeIngredients: [] },
  { id: 1166, brand: "아누아", name: "아누아 어성초 석시닉 모이스처 클렌징폼",       cat: "클렌징폼",     status: "등록 완료", score: 81, date: "2025.02.01", activeIngredients: [] },
  { id: 897,  brand: "아누아", name: "아누아 피디알엔 히알루론산 수분 클렌징폼",     cat: "클렌징폼",     status: "등록 완료", score: 83, date: "2025.01.28", activeIngredients: [] },
  { id: 1331, brand: "아누아", name: "아누아 피디알엔 히알루론산 캡슐 100 세럼",     cat: "세럼",         status: "등록 완료", score: 87, date: "2025.01.25", activeIngredients: [] },
  { id: 894,  brand: "아누아", name: "아누아 피디알엔 히알루론산 수분 캡슐 미스트",  cat: "미스트",       status: "등록 완료", score: 78, date: "2025.01.20", activeIngredients: [] },
  { id: 1555, brand: "아누아", name: "어성초 87 약산성 딥 클렌징워터",               cat: "클렌징워터",   status: "등록 완료", score: 79, date: "2025.01.15", activeIngredients: [] },
  { id: 1389, brand: "아누아", name: "라이스 효소 브라이트닝 클렌징 파우더",         cat: "클렌징파우더", status: "등록 완료", score: 76, date: "2025.01.10", activeIngredients: [] },
  { id: 1254, brand: "아누아", name: "아누아 제로캐스트 데일리 글로우 피니쉬 선스틱", cat: "선스틱",      status: "심사 중",   score: 88, date: "2025.03.10", activeIngredients: [] },
  { id: 611,  brand: "아누아", name: "아누아 매트벗글로우 커버 베이지",              cat: "선쿠션",       status: "심사 중",   score: 90, date: "2025.03.08", activeIngredients: [] },
];

// TODO: [API] GET /api/brand/:brandId/matching-requests
const MATCHING = [
  { id: 1, buyer: "Ulta Beauty",   product: "어성초 77 MHA 모공 클리어링 세럼 30ml",     status: "매칭 완료", date: "2025.03.20" },
  { id: 2, buyer: "Sephora",       product: "어성초 클렌징 오일 200ml",                  status: "검토중",   date: "2025.03.18" },
  { id: 3, buyer: "Target Beauty", product: "어성초 약산성 클렌징 폼 150ml",             status: "검토중",   date: "2025.03.17" },
];

// sub_category → 대분류명
const SUBCAT_TO_CATEGORY = {
  "토너": "스킨케어", "에센스": "스킨케어", "세럼": "스킨케어", "크림": "스킨케어",
  "로션": "스킨케어", "미스트": "스킨케어", "패드": "스킨케어", "앰플": "스킨케어",
  "필링젤": "스킨케어", "수분크림": "스킨케어", "스킨": "스킨케어", "아이크림": "스킨케어",
  "젤크림": "스킨케어", "에멀젼": "스킨케어", "부스터": "스킨케어",
  "클렌징폼": "클렌징", "클렌징오일": "클렌징", "클렌징워터": "클렌징",
  "클렌징밤": "클렌징", "클렌징밀크": "클렌징", "클렌징젤": "클렌징", "클렌징": "클렌징",
  "선크림": "선케어", "선스틱": "선케어", "선쿠션": "선케어",
  "선스프레이": "선케어", "선젤": "선케어", "선로션": "선케어", "선케어": "선케어",
  "시트마스크": "마스크팩", "마스크팩": "마스크팩", "워시오프마스크": "마스크팩",
  "슬리핑마스크": "마스크팩", "패치": "마스크팩",
};

const STATUS_COLOR = {
  "등록 완료": { bg: "#E6FAF5", text: "#0A7A5A" },
  "심사 중":   { bg: "#FFF7E6", text: "#D46B08" },
  "반려됨":    { bg: "#FFF2F0", text: "#CF1322" },
};

const MATCH_COLOR = {
  "검토중":    { bg: "#EFF6FF", text: "#1D4ED8" },
  "매칭 완료": { bg: "#E6FAF5", text: "#0A7A5A" },
  "거절":      { bg: "#FFF2F0", text: "#CF1322" },
};

export default function BrandProductList({ onTab, onBack, onProductDetail, onFab, registeredProducts = [], deletedProductIds = new Set() }) {
  const [sortBy, setSortBy] = useState("date");
  const [seenIds, setSeenIds] = useState(new Set());

  // 새로 등록된 상품 + 하드코딩 상품 합치고 삭제된 ID 제외 (중복 ID·이름 모두 체크)
  const registeredIds   = new Set(registeredProducts.map(p => p.id));
  const registeredNames = new Set(registeredProducts.map(p => p.name));
  const allProducts = [
    ...registeredProducts,
    ...ANUA_PRODUCTS.filter(p => !registeredIds.has(p.id) && !registeredNames.has(p.name)),
  ].filter(p => !deletedProductIds.has(p.id));

  const sorted = [...allProducts].sort((a, b) =>
    sortBy === "score" ? b.score - a.score
      : b.date.replace(/\./g, "") - a.date.replace(/\./g, "")
  );

  const pending    = sorted.filter(p => p.status === "심사 중");
  const registered = sorted.filter(p => p.status !== "심사 중");
  const reviewingCount = MATCHING.filter(m => m.status === "검토중").length;

  return (
    <View style={s.screen}>
      <TopBar light title="등록 상품" onNotice={() => {}} onBack={onBack} />

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* 상품 등록하러 가기 버튼 — 코랄 */}
        {/* [STYLE CHANGED: 상단 등록 CTA 버튼 추가 — 디자인 요청] */}
        <TouchableOpacity style={s.registerBtn} onPress={() => onTab?.("상품등록")} activeOpacity={0.85}>
          <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
          <Text style={s.registerBtnText}>상품 등록하러 가기</Text>
        </TouchableOpacity>

        {/* 요약 통계 */}
        <View style={s.card}>
          <View style={s.statusRow}>
            {[
              { label: "전체",     val: allProducts.length,                                        color: "#3A3A3C" },
              { label: "등록 완료", val: allProducts.filter(p => p.status === "등록 완료").length, color: colors.coral },
              { label: "심사 중",  val: allProducts.filter(p => p.status === "심사 중").length,   color: "#D46B08" },
              { label: "매칭 검토", val: reviewingCount,                                           color: "#4B7BEC" },
            ].map((item, i, arr) => (
              <View key={i} style={[s.statusItem, i < arr.length - 1 && s.statusItemBorder]}>
                <Text style={[s.statusVal, { color: item.color }]}>{item.val}</Text>
                <Text style={s.statusLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 심사 중 섹션 */}
        {pending.length > 0 && (
          <View style={s.card}>
            <View style={s.secHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={s.secLabel}>심사 중</Text>
                <View style={s.pendingBadge}>
                  <Text style={s.pendingBadgeText}>{pending.length}</Text>
                </View>
              </View>
              <Text style={[s.secSub, { color: "#D46B08" }]}>Fit Score 산출 완료</Text>
            </View>
            {pending.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                style={[s.pendingRow, i < pending.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: "#EBEBEF" }]}
                onPress={() => onProductDetail?.(p)}   // product 객체 전달
                activeOpacity={0.75}
              >
                <View style={s.pendingDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.brand}>{p.brand}</Text>
                  <Text style={s.name} numberOfLines={1}>{p.name}</Text>
                </View>
                <View style={s.tags}>
                  <View style={s.tagScore}>
                    <Text style={s.tagScoreText}>Fit {p.score}</Text>
                  </View>
                  <View style={[s.tagStatus, { backgroundColor: STATUS_COLOR["심사 중"].bg }]}>
                    <Text style={[s.tagStatusText, { color: STATUS_COLOR["심사 중"].text }]}>심사 중</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 등록 완료 목록 — 정렬 탭: 등록순 왼쪽, Fit Score 오른쪽 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>등록 완료</Text>
            <Text style={s.secSub}>{registered.length}개</Text>
          </View>
          <View style={s.sortRow}>
            <TouchableOpacity
              style={[s.sortBtn, sortBy === "date" && s.sortBtnActive]}
              onPress={() => setSortBy("date")}
            >
              <Text style={[s.sortBtnText, sortBy === "date" && s.sortBtnTextActive]}>등록순</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sortBtn, sortBy === "score" && s.sortBtnActive]}
              onPress={() => setSortBy("score")}
            >
              <Text style={[s.sortBtnText, sortBy === "score" && s.sortBtnTextActive]}>Fit Score 높은순</Text>
            </TouchableOpacity>
          </View>
          {registered.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[s.row, { borderBottomWidth: i < registered.length - 1 ? 0.5 : 0, borderBottomColor: "#EBEBEF" }]}
              onPress={() => {
                setSeenIds(prev => new Set([...prev, p.id]));
                onProductDetail?.(p);
              }}
              activeOpacity={0.75}
            >
              <View style={{ position: "relative" }}>
                <View style={s.thumb}>
                  {getProductImage(p.name) && (
                    <Image source={getProductImage(p.name)} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                  )}
                </View>
                {registeredIds.has(p.id) && !seenIds.has(p.id) && <View style={s.newDot} />}
              </View>
              <View style={s.info}>
                <Text style={s.brand}>{p.brand}</Text>
                <Text style={s.name} numberOfLines={1}>{p.name}</Text>
                <View style={s.tags}>
                  <View style={s.tagScore}>
                    <Text style={s.tagScoreText}>Fit {p.score}</Text>
                  </View>
                  <View style={s.tagCat}>
                    <Text style={s.tagCatText}>{p.cat}</Text>
                  </View>
                  <View style={[s.tagStatus, { backgroundColor: STATUS_COLOR[p.status]?.bg ?? "#F2F2F7" }]}>
                    <Text style={[s.tagStatusText, { color: STATUS_COLOR[p.status]?.text ?? colors.grayMid }]}>
                      {p.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.meta}>
                <Text style={s.date}>{p.date}</Text>
                <Text style={s.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
          {registered.length === 0 && (
            <Text style={{ fontSize: 13, color: colors.grayMid, textAlign: "center", paddingVertical: 24 }}>
              등록 완료된 상품이 없어요
            </Text>
          )}
        </View>

        {/* 바이어 매칭 요청 관리 */}
        {/* [STYLE CHANGED: 바이어 매칭 요청 섹션 추가 — 디자인 요청] */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>바이어 매칭 요청</Text>
            {reviewingCount > 0 ? (
              <View style={s.reviewBadge}>
                <Text style={s.reviewBadgeText}>검토중 {reviewingCount}건</Text>
              </View>
            ) : (
              <Text style={s.secSub}>전체 {MATCHING.length}건</Text>
            )}
          </View>
          {MATCHING.map((m, i) => (
            <View
              key={m.id}
              style={[s.matchRow, i < MATCHING.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: "#EBEBEF" }]}
            >
              <View style={s.matchLeft}>
                <Text style={s.matchBuyer}>{m.buyer}</Text>
                <Text style={s.matchProduct} numberOfLines={1}>{m.product}</Text>
              </View>
              <View style={s.matchRight}>
                <View style={[s.matchBadge, { backgroundColor: MATCH_COLOR[m.status]?.bg ?? "#F2F2F7" }]}>
                  <Text style={[s.matchBadgeText, { color: MATCH_COLOR[m.status]?.text ?? colors.grayMid }]}>
                    {m.status}
                  </Text>
                </View>
                <Text style={s.matchDate}>{m.date}</Text>
              </View>
            </View>
          ))}
          {MATCHING.length === 0 && (
            <Text style={{ fontSize: 13, color: colors.grayMid, textAlign: "center", paddingVertical: 24 }}>
              바이어 매칭 요청이 없어요
            </Text>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar role="brand" active="상품" onTab={onTab} onFab={onFab} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: pageBg },
  body: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 상품 등록 CTA 버튼 ──────────────────────────────────
  registerBtn: { backgroundColor: colors.coral, marginHorizontal: 16, marginTop: 14, marginBottom: 12, borderRadius: 12, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", letterSpacing: -0.3 },

  // ─── 요약 통계 ────────────────────────────────────────────
  statusRow: { flexDirection: "row" },
  statusItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statusItemBorder: { borderRightWidth: 1, borderRightColor: "#EBEBEF" },
  statusVal: { fontSize: 22, fontWeight: "700", marginBottom: 3 },
  statusLabel: { fontSize: 11, color: colors.grayMid, marginTop: 2 },

  // ─── 섹션 헤더 ───────────────────────────────────────────
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EBEBEF", marginBottom: 10 },
  secLabel: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 12, color: colors.grayMid },

  // ─── 심사 중 섹션 ─────────────────────────────────────────
  pendingBadge: { backgroundColor: "#FFF7E6", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  pendingBadgeText: { fontSize: 12, fontWeight: "700", color: "#D46B08" },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },

  // ─── 정렬 탭 ─────────────────────────────────────────────
  sortRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  sortBtn: { borderRadius: 20, borderWidth: 1, borderColor: "#E5E5EA", paddingVertical: 6, paddingHorizontal: 14 },
  sortBtnActive: { borderColor: "#1C1C1E", backgroundColor: "#1C1C1E" },
  sortBtnText: { fontSize: 12, fontWeight: "500", color: colors.grayMid },
  sortBtnTextActive: { color: "#fff" },

  // ─── 상품 행 ─────────────────────────────────────────────
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  thumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#F2F2F7", borderWidth: 1, borderColor: "#E5E5EA" },
  newDot: { position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral, borderWidth: 2, borderColor: "#fff" },
  info: { flex: 1 },
  brand: { fontSize: 12, color: colors.grayMid, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: "500", color: "#1C1C1E", marginBottom: 5 },
  tags: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  tagScore: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#FEF0F0" },
  tagScoreText: { fontSize: 11, fontWeight: "500", color: colors.coral },
  tagCat: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#F2F2F7" },
  tagCatText: { fontSize: 11, fontWeight: "500", color: colors.grayMid },
  tagStatus: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7 },
  tagStatusText: { fontSize: 11, fontWeight: "500" },
  meta: { alignItems: "flex-end", gap: 4 },
  date: { fontSize: 11, color: colors.grayMid },
  arrow: { fontSize: 18, color: "#C7C7CC" },

  // ─── 바이어 매칭 요청 ────────────────────────────────────
  reviewBadge: { backgroundColor: "#EFF6FF", borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 },
  reviewBadgeText: { fontSize: 12, fontWeight: "700", color: "#1D4ED8" },
  matchRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  matchLeft: { flex: 1 },
  matchBuyer: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", marginBottom: 3 },
  matchProduct: { fontSize: 12, color: colors.grayMid },
  matchRight: { alignItems: "flex-end", gap: 5 },
  matchBadge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 9 },
  matchBadgeText: { fontSize: 11, fontWeight: "600" },
  matchDate: { fontSize: 11, color: colors.grayMid },
};
