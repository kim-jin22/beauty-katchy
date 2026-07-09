import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Modal, Animated, Image, ActivityIndicator } from "react-native";
import { Svg, Path } from "react-native-svg";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";
import { getProductImage, getCategoryRankImage } from "../../data/productImages";

const API_URL = "https://finalteam4-production-e6c4.up.railway.app";
const CATEGORIES = ["전체", "스킨케어", "선케어", "클렌징", "마스크팩"];

const SORT_OPTIONS = [
  { key: "score_desc", label: "Fit Score 높은순" },
  { key: "score_asc",  label: "Fit Score 낮은순" },
  { key: "price_asc",  label: "가격 낮은순" },
  { key: "price_desc", label: "가격 높은순" },
];

const SUB_TO_MAIN = {
  "토너": "스킨케어", "에센스": "스킨케어", "세럼": "스킨케어", "크림": "스킨케어",
  "로션": "스킨케어", "미스트": "스킨케어", "패드": "스킨케어", "앰플": "스킨케어",
  "필링젤": "스킨케어", "수분크림": "스킨케어", "스킨": "스킨케어", "아이크림": "스킨케어",
  "젤크림": "스킨케어", "에멀젼": "스킨케어", "부스터": "스킨케어",
  "클렌징폼": "클렌징", "클렌징오일": "클렌징", "클렌징워터": "클렌징",
  "클렌징밤": "클렌징", "클렌징젤": "클렌징", "클렌징": "클렌징",
  "선크림": "선케어", "선스틱": "선케어", "선쿠션": "선케어",
  "선스프레이": "선케어", "선젤": "선케어", "선케어": "선케어",
  "시트마스크": "마스크팩", "마스크팩": "마스크팩", "슬리핑마스크": "마스크팩",
};

// product_id로 결정되는 fallback score (60~95, 항상 동일값)
function pseudoScore(id) {
  return 60 + ((id * 17 + 29) % 36);
}

function transformProduct(p) {
  const priceNum = p.price || 0;
  const priceStr = `$${priceNum.toFixed(2)}`;
  const score = p.score || pseudoScore(p.product_id);
  const ings = p.ingredients || [];
  const tags = ings.slice(0, 2).map((ing, i) => ({
    label: ing.kor || ing.name,
    match: i === 0,
  }));
  if (p.sub_category) tags.push({ label: p.sub_category });

  const tiers = [
    { label: "Tier 1", moq: "500개+", price: `$${(priceNum * 0.71).toFixed(2)}`, margin: "42%", marginColor: "#0A7A5A", style: "tier1" },
    { label: "Tier 2", moq: "200개+", price: `$${(priceNum * 0.86).toFixed(2)}`, margin: "35%", marginColor: "#3A3A3C", style: "tier2" },
    { label: "Tier 3", moq: "50개+",  price: priceStr, margin: "28%", marginColor: colors.grayMid, style: "tier3" },
  ];

  return {
    product_id:  p.product_id,
    brand:       p.brand,
    name:        p.name,
    price:       priceStr,
    _price:      priceNum,
    score,
    high:        score >= 85,
    tags,
    cat:         (p.brand || "").toUpperCase().slice(0, 8),
    category:    SUB_TO_MAIN[p.sub_category] || "스킨케어",
    subCategory: p.sub_category || "",
    volume:      null,
    spf:         p.spf,
    activeCount: ings.length,
    tiers,
  };
}

// ─── 상품 상세 + 협상가이드 바텀시트 ────────────────────────────
function ProductSheet({ product, visible, onClose, onMatchRequest }) {
  const translateY = useRef(new Animated.Value(700)).current;
  const [wished, setWished] = useState(false);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 700,
      useNativeDriver: true,
      tension: 55,
      friction: 12,
    }).start();
  }, [visible]);

  if (!product) return null;

  const tierBadgeStyle = (style) => {
    if (style === "tier1") return [sh.tierBadge, sh.tier1];
    if (style === "tier2") return [sh.tierBadge, sh.tier2];
    return [sh.tierBadge, sh.tier3];
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[sh.sheet, { transform: [{ translateY }] }]}>
          {/* 핸들 + 닫기 */}
          <View style={sh.sheetHeader}>
            <View style={sh.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={sh.scrollBody}>

            {/* ── 상품 정보 (브랜드 등록 필드) ──────────────── */}
            <View style={sh.section}>
              <View style={sh.productTop}>
                <View style={sh.productThumb}>
                  {getProductImage(product.name) ? (
                    <Image source={getProductImage(product.name)} style={{ width: "100%", height: "100%", borderRadius: 12, resizeMode: "cover" }} />
                  ) : (
                    <>
                      <Text style={sh.thumbCat}>{product.category}</Text>
                      <Text style={sh.thumbBrand}>{product.cat}</Text>
                    </>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sh.productBrand}>{product.brand}</Text>
                  <Text style={sh.productName}>{product.name}</Text>
                  <View style={[sh.fitBadge, product.high && sh.fitBadgeHigh]}>
                    <Text style={sh.fitBadgeText}>Fit Score {product.score}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setWished(w => !w)} style={sh.wishBtn}>
                  <Text style={{ fontSize: 20, color: wished ? colors.coral : "#D1D1D6" }}>
                    {wished ? "♥" : "♡"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 등록 정보 그리드 */}
              <View style={sh.infoGrid}>
                <View style={sh.infoItem}>
                  <Text style={sh.infoLabel}>카테고리</Text>
                  <Text style={sh.infoVal}>{product.category}</Text>
                </View>
                <View style={sh.infoItem}>
                  <Text style={sh.infoLabel}>소분류</Text>
                  <Text style={sh.infoVal}>{product.subCategory}</Text>
                </View>
                <View style={sh.infoItem}>
                  <Text style={sh.infoLabel}>공급가</Text>
                  <Text style={[sh.infoVal, { color: colors.coral, fontWeight: "700" }]}>{product.price}</Text>
                </View>
                <View style={sh.infoItem}>
                  <Text style={sh.infoLabel}>용량</Text>
                  <Text style={sh.infoVal}>{product.volume}</Text>
                </View>
                <View style={sh.infoItem}>
                  <Text style={sh.infoLabel}>액티브 성분</Text>
                  <Text style={[sh.infoVal, { color: colors.mint }]}>{product.activeCount}개 감지</Text>
                </View>
                {product.spf && (
                  <View style={sh.infoItem}>
                    <Text style={sh.infoLabel}>SPF</Text>
                    <Text style={sh.infoVal}>{product.spf}</Text>
                  </View>
                )}
              </View>

              {/* 매칭 키워드 태그 */}
              <View style={sh.tagRow}>
                {product.tags.map((t, i) => (
                  <View key={i} style={t.match ? sh.tagMatch : sh.tag}>
                    <Text style={t.match ? sh.tagMatchText : sh.tagText}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── 협상 가이드: 티어별 공급가 ─────────────────── */}
            <View style={sh.divider} />
            <View style={sh.section}>
              <View style={sh.secHeader}>
                <Text style={sh.secLabel}>티어별 공급가</Text>
                <Text style={sh.secSub}>MOQ 기준</Text>
              </View>
              <View style={sh.tableHeader}>
                {["티어", "MOQ", "공급가", "마진율"].map((h, i) => (
                  <Text key={h} style={[sh.th, i === 0 ? { flex: 1.2 } : { flex: 1, textAlign: "right" }]}>{h}</Text>
                ))}
              </View>
              {product.tiers.map((t, i) => (
                <View key={i} style={[sh.tableRow, { borderBottomWidth: i < product.tiers.length - 1 ? 0.5 : 0, borderBottomColor: "#EBEBEF" }]}>
                  <View style={[tierBadgeStyle(t.style), { flex: 1.2, alignSelf: "flex-start" }]}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: t.style === "tier1" ? "#fff" : t.style === "tier2" ? "#1C1C1E" : colors.grayMid }}>{t.label}</Text>
                  </View>
                  <Text style={[sh.td, { flex: 1, textAlign: "right", color: colors.grayMid, fontSize: 12 }]}>{t.moq}</Text>
                  <Text style={[sh.td, { flex: 1, textAlign: "right", fontWeight: "700", fontSize: 14 }]}>{t.price}</Text>
                  <Text style={[sh.td, { flex: 1, textAlign: "right", fontWeight: "700", color: t.marginColor }]}>{t.margin}</Text>
                </View>
              ))}
            </View>

            {/* ── 협상 가이드: 아마존 벤치마크 ───────────────── */}
            <View style={sh.divider} />
            <View style={sh.section}>
              <View style={sh.secHeader}>
                <Text style={sh.secLabel}>아마존 가격 벤치마크</Text>
                <Text style={sh.secSub}>유사 상품 기준</Text>
              </View>
              {[
                { label: "최저가", fill: 0.30, val: "$16.99" },
                { label: "평균가", fill: 0.60, val: "$24.50" },
                { label: "최고가", fill: 0.90, val: "$38.00" },
              ].map((b, i) => (
                <View key={i} style={[sh.benchRow, { marginBottom: i < 2 ? 14 : 0 }]}>
                  <Text style={sh.benchLabel}>{b.label}</Text>
                  <View style={sh.benchBarBg}>
                    <View style={[sh.benchBarFill, { width: `${b.fill * 100}%` }]} />
                    <View style={sh.benchBarMine} />
                  </View>
                  <Text style={sh.benchVal}>{b.val}</Text>
                </View>
              ))}
              <View style={sh.alertInfo}>
                <Text style={sh.alertInfoText}>
                  Tier 1 기준 아마존 평균가 대비 예상 마진{" "}
                  <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>약 {product.tiers[0]?.margin}</Text>
                  {" "}— 동일 카테고리 평균 31%보다 높아요.
                </Text>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* ── 하단 액션 버튼 ────────────────────────────────── */}
          <View style={sh.bottomBar}>
            <TouchableOpacity
              style={sh.btnPrimary}
              onPress={() => { onClose(); onMatchRequest?.(); }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={sh.btnPrimaryText}>매칭 요청</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.btnDefault}>
              <Text style={sh.btnDefaultText}>샘플 요청</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function BuyerProductList({ onTab, onMatchRequest }) {
  const [activeCat, setActiveCat] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [sortBy, setSortBy] = useState("score_desc");
  const [showSort, setShowSort] = useState(false);
  const searchTimer = useRef(null);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "score_asc":  return arr.sort((a, b) => a.score - b.score);
      case "price_asc":  return arr.sort((a, b) => a._price - b._price);
      case "price_desc": return arr.sort((a, b) => b._price - a._price);
      default:           return arr.sort((a, b) => b.score - a.score);
    }
  }, [products, sortBy]);

  const loadProducts = useCallback(async (cat, search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "전체") params.append("category", cat);
      if (search && search.trim()) params.append("search", search.trim());
      const res = await fetch(`${API_URL}/buyer/products?${params}`);
      const data = await res.json();
      if (!Array.isArray(data)) { setProducts([]); return; }
      // API는 score 높은순 정렬 → 카테고리별 등장 순서 = 카테고리 내 순위
      const catRanks = {};
      const transformed = data.map(p => {
        const item = transformProduct(p);
        catRanks[item.category] = (catRanks[item.category] || 0) + 1;
        return { ...item, catRank: catRanks[item.category] };
      });
      setProducts(transformed);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    const delay = searchText ? 400 : 0;
    searchTimer.current = setTimeout(() => loadProducts(activeCat, searchText), delay);
    return () => clearTimeout(searchTimer.current);
  }, [activeCat, searchText]);

  const openSheet = (item) => {
    setSelectedProduct(item);
    setShowSheet(true);
  };

  const renderProduct = ({ item, index }) => {
    const img = getProductImage(item.name) || getCategoryRankImage(item.category, item.catRank);
    return (
    <TouchableOpacity style={s.pCard} onPress={() => openSheet(item)} activeOpacity={0.85}>
      <View style={s.pThumb}>
        {img ? (
          <Image source={img} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
        ) : (
          <>
            <Text style={s.thumbCat}>{item.cat.slice(0, 8)}</Text>
            <Text style={s.thumbBrand}>{item.cat}</Text>
          </>
        )}
        <TouchableOpacity
          style={[s.wishBtn, wished[index] && s.wishBtnOn]}
          onPress={() => setWished((p) => ({ ...p, [index]: !p[index] }))}
        >
          <Text style={wished[index] ? s.wishHeart : s.wishHeartOff}>{wished[index] ? "♥" : "♡"}</Text>
        </TouchableOpacity>
        <View style={[s.fitBadge, item.high && s.fitBadgeHigh]}>
          <Text style={s.fitBadgeText}>FS {item.score}</Text>
        </View>
      </View>
      <View style={s.pInfo}>
        <Text style={s.pBrand}>{item.brand}</Text>
        <Text style={s.pName} numberOfLines={2}>{item.name}</Text>
        <Text style={s.pPrice}>{item.price}<Text style={s.pPriceUnit}> 공급가</Text></Text>
        <View style={s.pTags}>
          {item.tags.map((t, i) => (
            <View key={i} style={t.match ? s.pTagMatch : s.pTag}>
              <Text style={t.match ? s.pTagMatchText : s.pTagText}>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );};

  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="상품 탐색" onNotice={() => {}} />

      {/* 검색바 */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <TextInput
            style={s.searchInput}
            placeholder="브랜드명, 성분, 카테고리 검색"
            placeholderTextColor={colors.grayMid}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[s.chip, activeCat === cat && s.chipOn]}
            onPress={() => setActiveCat(cat)}
          >
            <Text style={[s.chipText, activeCat === cat && s.chipOnText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 정렬 (드롭다운 포함) */}
      <View style={s.sortWrap}>
        <View style={s.sortRow}>
          <Text style={s.sortLabel}>
            {loading ? "불러오는 중..." : `총 ${sortedProducts.length}개 상품`}
          </Text>
          <TouchableOpacity style={s.sortBtnWrap} onPress={() => setShowSort(v => !v)}>
            <Text style={s.sortBtn}>{SORT_OPTIONS.find(o => o.key === sortBy)?.label} ▾</Text>
          </TouchableOpacity>
        </View>
        {showSort && (
          <View style={s.sortDropdown}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortOption, sortBy === opt.key && s.sortOptionOn]}
                onPress={() => { setSortBy(opt.key); setShowSort(false); }}
              >
                <Text style={[s.sortOptionText, sortBy === opt.key && s.sortOptionOnText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 상품 그리드 */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.coral} />
        </View>
      ) : sortedProducts.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>검색 결과가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.product_id)}
          numColumns={2}
          columnWrapperStyle={s.gridRow}
          contentContainerStyle={s.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomBar role="buyer" active="탐색" onTab={onTab} />

      {/* 상품 상세 + 협상가이드 바텀시트 */}
      <ProductSheet
        product={selectedProduct}
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onMatchRequest={onMatchRequest}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────

// ── 바텀시트 스타일 ──────────────────────────────────────────
const sh = {
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  sheetHeader: { paddingTop: 12, paddingBottom: 4, alignItems: "center" },
  handle: { width: 36, height: 4, backgroundColor: "#D1D1D6", borderRadius: 2 },
  scrollBody: { flexShrink: 1 },
  section: { paddingHorizontal: 24, paddingVertical: 20 },
  divider: { height: 8, backgroundColor: "#F2F2F8" },

  // ── 상품 정보 ────────────────────────────────────────────
  productTop: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  productThumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" },
  thumbCat: { fontSize: 10, color: "#C7C7CC", textTransform: "uppercase" },
  thumbBrand: { fontSize: 11, fontWeight: "700", color: "#D1D1D6" },
  productBrand: { fontSize: 12, color: colors.grayMid, marginBottom: 3 },
  productName: { fontSize: 16, fontWeight: "700", color: "#1C1C1E", lineHeight: 22, marginBottom: 7, letterSpacing: -0.3 },
  fitBadge: { alignSelf: "flex-start", backgroundColor: "#1C1C1E", borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  fitBadgeHigh: { backgroundColor: colors.coral },
  fitBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  wishBtn: { marginLeft: "auto" },

  // ── 등록 정보 그리드 ─────────────────────────────────────
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0, backgroundColor: "#F8F8F8", borderRadius: 12, overflow: "hidden", marginBottom: 14 },
  infoItem: { width: "50%", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderRightWidth: 0.5, borderColor: "#EBEBEF" },
  infoLabel: { fontSize: 11, color: colors.grayMid, marginBottom: 3 },
  infoVal: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },

  // ── 태그 ─────────────────────────────────────────────────
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: "#F2F2F7", borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontSize: 12, color: colors.grayMid },
  tagMatch: { backgroundColor: "#E6FAF5", borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  tagMatchText: { fontSize: 12, color: "#0A7A5A", fontWeight: "500" },

  // ── 협상 가이드 섹션 헤더 ────────────────────────────────
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  secLabel: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 12, color: colors.grayMid },

  // ── 티어 테이블 ──────────────────────────────────────────
  tableHeader: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EBEBEF", marginBottom: 2 },
  th: { fontSize: 11, color: colors.grayMid, fontWeight: "500" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  td: { fontSize: 13, color: "#3A3A3C" },
  tierBadge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8, alignSelf: "flex-start" },
  tier1: { backgroundColor: "#1C1C1E" },
  tier2: { backgroundColor: "#F2F2F7" },
  tier3: { backgroundColor: "#F2F2F7" },

  // ── 벤치마크 바 ──────────────────────────────────────────
  benchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benchLabel: { fontSize: 12, color: "#3A3A3C", width: 46 },
  benchBarBg: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 3, height: 5, position: "relative" },
  benchBarFill: { borderRadius: 3, height: 5, backgroundColor: "#1C1C1E" },
  benchBarMine: { position: "absolute", top: -3, left: "48%", width: 2, height: 11, backgroundColor: colors.coral, borderRadius: 2 },
  benchVal: { fontSize: 12, fontWeight: "700", color: "#1C1C1E", width: 44, textAlign: "right" },
  alertInfo: { backgroundColor: "#F8F8F8", borderRadius: 8, padding: 12, marginTop: 14 },
  alertInfoText: { fontSize: 12, color: colors.grayMid, lineHeight: 20 },

  // ── 하단 버튼 ────────────────────────────────────────────
  bottomBar: { flexDirection: "row", gap: 10, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 36, borderTopWidth: 0.5, borderTopColor: "#EBEBEF" },
  btnPrimary: { flex: 2, backgroundColor: colors.coral, borderRadius: 10, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  btnDefault: { flex: 1, borderWidth: 1.5, borderColor: "#D1D1D6", borderRadius: 10, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  btnDefaultText: { fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
};

// ── 상품 그리드 스타일 ────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: pageBg },

  // ─── 검색바 ──────────────────────────────────────────────
  searchWrap: { paddingVertical: 14, paddingHorizontal: 28 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: "#1C1C1E" },

  // ─── 카테고리 필터 (가로 스크롤 칩) ─────────────────────
  filterScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 14 },
  filterContent: { paddingHorizontal: 28, paddingVertical: 2, gap: 7 },
  chip: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E5E5EA", backgroundColor: "#fff", minHeight: 38, justifyContent: "center", alignItems: "center" },
  chipOn: { backgroundColor: "#1C1C1E", borderColor: "#1C1C1E" },
  chipText: { fontSize: 14, fontWeight: "500", color: colors.grayMid },
  chipOnText: { color: "#fff", fontWeight: "600" },

  // ─── 정렬 행 + 드롭다운 ──────────────────────────────────
  sortWrap: { zIndex: 20, backgroundColor: pageBg },
  sortRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 28, paddingBottom: 14 },
  sortLabel: { fontSize: 12, color: colors.grayMid },
  sortBtnWrap: { paddingVertical: 4, paddingHorizontal: 2 },
  sortBtn: { fontSize: 12, color: "#1C1C1E", fontWeight: "700" },
  sortDropdown: {
    position: "absolute", top: 30, right: 28,
    backgroundColor: "#fff", borderRadius: 10, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 10,
    borderWidth: 0.5, borderColor: "#E5E5EA",
  },
  sortOption: { paddingVertical: 13, paddingHorizontal: 20, minWidth: 140 },
  sortOptionOn: { backgroundColor: "#F8F8F8" },
  sortOptionText: { fontSize: 13, color: "#3A3A3C" },
  sortOptionOnText: { fontWeight: "700", color: "#1C1C1E" },

  // ─── 로딩 / 빈 상태 ─────────────────────────────────────
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: colors.grayMid },

  // ─── 2열 상품 그리드 ─────────────────────────────────────
  gridContent: { paddingHorizontal: 22, paddingBottom: 20 },
  gridRow: { gap: 12, marginBottom: 12 },

  // ─── 상품 카드 ───────────────────────────────────────────
  pCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  pThumb: { aspectRatio: 1, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center", position: "relative" },
  thumbCat: { fontSize: 11, color: "#C7C7CC", textTransform: "uppercase" },
  thumbBrand: { fontSize: 12, fontWeight: "700", color: "#D1D1D6" },

  // ─── 찜 버튼 ─────────────────────────────────────────────
  wishBtn: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.95)", borderWidth: 0.5, borderColor: "#E5E5EA", alignItems: "center", justifyContent: "center" },
  wishBtnOn: { borderColor: "#FAD4D4" },
  wishHeart: { fontSize: 13, color: colors.coral },
  wishHeartOff: { fontSize: 13, color: "#D1D1D6" },

  // ─── Fit Score 배지 ───────────────────────────────────────
  fitBadge: { position: "absolute", bottom: 8, left: 8, backgroundColor: "#1C1C1E", borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  fitBadgeHigh: { backgroundColor: colors.coral },
  fitBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },

  // ─── 카드 텍스트 ──────────────────────────────────────────
  pInfo: { padding: 12 },
  pBrand: { fontSize: 11, color: colors.grayMid, marginBottom: 3 },
  pName: { fontSize: 13, fontWeight: "500", color: "#1C1C1E", lineHeight: 18, marginBottom: 7 },
  pPrice: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  pPriceUnit: { fontSize: 11, color: colors.grayMid, fontWeight: "400" },

  // ─── 태그 칩 ──────────────────────────────────────────────
  pTags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  pTag: { backgroundColor: "#F8F8F8", borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  pTagText: { fontSize: 11, color: colors.grayMid },
  pTagMatch: { backgroundColor: "#E6FAF5", borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  pTagMatchText: { fontSize: 11, color: "#0A7A5A", fontWeight: "500" },
};
