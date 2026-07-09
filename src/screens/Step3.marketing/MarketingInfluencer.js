import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions, ImageBackground, Modal, Image, ActivityIndicator, Animated } from "react-native";
import TopBar from "../../components/TopBar";
import { colors, pageBg } from "../../styles";

const { width: SCREEN_W } = Dimensions.get("window");
const W        = Math.min(SCREEN_W, 390);
const CARD_W   = W * 0.76;
const CARD_H   = 450;
const SIDE_PAD = (W - CARD_W) / 2 - 8;

const API_URL = "https://finalteam4-production-e6c4.up.railway.app";

// 카드 색상 — API 응답에 color 없으므로 순서대로 배정
const CARD_COLORS = [colors.coral, "#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];

// API 실패 시 fallback 더미 데이터
const FALLBACK_INFLUENCERS = [
  {
    id: 1, name: "marisajmakeup", category: "Suncare", persona: "무백탁 전문", score: 92.4,
    followers: "5만", location: "미국 서부 (LA)", platform: "Instagram",
    image: "https://plus.unsplash.com/premium_photo-1679750866883-b1c549f65da9?q=80&w=687&auto=format&fit=crop",
    tags: ["#nowhitecast", "#mineralspf", "#kbeautyspf"],
    color: colors.coral,
    target_audience: "2030 여성",
    h01_risk: "백탁 현상 해결 (r=-0.71)",
    h01_unmet: "미국 선케어 불만 1·2위 — 백탁·끈적임",
    keywords: ["White Cast", "Non-greasy", "SPF50+", "Absorb"],
    product_feature: "무기자차/가벼운 제형",
    content_direction: "백탁 없는 선크림 전문 리뷰 / no white cast 콘텐츠",
    cosine_score: 0.804, market_share: 14.0,
  },
  {
    id: 2, name: "spf_daily", category: "Suncare", persona: "끈적임 Zero", score: 87,
    followers: "8.9만", location: "USA", platform: "TikTok",
    image: "https://images.unsplash.com/photo-1609357912334-e96886c0212b?w=800",
    tags: ["#nonsticky", "#spf50", "#suncareroutine"],
    color: "#A855F7",
    target_audience: "1020 여성",
    h01_risk: "끈적임 없는 선케어 루틴 확산",
    h01_unmet: "선케어 불만 2위 — 끈적임·무거운 제형",
    keywords: ["Non-sticky", "Light", "Everyday SPF", "Matte"],
    product_feature: "워터 베이스/무지성 제형",
    content_direction: "끈적임 없는 선크림 TikTok 루틴 콘텐츠",
    cosine_score: 0.740, market_share: 11.2,
  },
  {
    id: 3, name: "KBeautySun", category: "Suncare", persona: "K뷰티 리뷰어", score: 79,
    followers: "4.5만", location: "USA", platform: "YouTube",
    image: "https://plus.unsplash.com/premium_photo-1752089322306-3d57928d4e2f?q=80&w=715&auto=format&fit=crop",
    tags: ["#kbeauty", "#spfreview", "#moisturizerspf"],
    color: "#3B82F6",
    target_audience: "2535 여성",
    h01_risk: "K뷰티 선케어 인식 확산 필요",
    h01_unmet: "미국 내 K뷰티 선케어 낮은 인지도",
    keywords: ["K-beauty", "SPF Review", "Moisturizing", "Skincare"],
    product_feature: "K뷰티 프리미엄 선케어",
    content_direction: "K뷰티 선크림 심층 리뷰 YouTube 채널",
    cosine_score: 0.660, market_share: 8.5,
  },
  {
    id: 4, name: "dermguru", category: "Cleansing", persona: "메이크업제거", score: 89.8,
    followers: "172.4만", location: "USA", platform: "Instagram",
    image: "https://images.unsplash.com/photo-1581182815808-b6eb627a8798?q=80&w=765&auto=format&fit=crop",
    tags: ["#doublecleanse", "#oilcleanser"],
    color: "#10B981",
    target_audience: "2030 여성",
    h01_risk: "클렌징 효과 불만 해결 (68.9%)",
    h01_unmet: "클렌징 불만 1위 — 세정력 부족 (68.9%)",
    keywords: ["Double Cleanse", "Pore Care", "Gentle", "Makeup Remove"],
    product_feature: "오일·밤 더블클렌징 제형",
    content_direction: "클렌징 오일·밤 메이크업 제거 전문 인플루언서",
    cosine_score: 0.898, market_share: 16.9,
  },
  {
    id: 5, name: "glowyamelie", category: "Masks", persona: "보습케어", score: 96.4,
    followers: "20.4만", location: "USA", platform: "Instagram",
    image: "https://plus.unsplash.com/premium_photo-1679046948909-ab47e96082e7?q=80&w=687&auto=format&fit=crop",
    tags: ["#hydration", "#sheetmask"],
    color: "#F59E0B",
    target_audience: "2030 여성",
    h01_risk: "건조 피부 보습 지속력 개선",
    h01_unmet: "마스크팩 불만 1·2위 — 자극·건조",
    keywords: ["Hydrating", "Brightening", "Sensitive", "Night Care"],
    product_feature: "히알루론산 고함량 제형",
    content_direction: "건조 피부 집중 보습 마스크팩 전문 인플루언서",
    cosine_score: 0.964, market_share: 15.5,
  },
];

// [[핵심문구]]를 코랄 강조로 렌더링
function ParsedText({ text, baseStyle, coralStyle }) {
  if (!text) return null;
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[(.+)\]\]$/);
        return match
          ? <Text key={i} style={coralStyle}>{match[1]}</Text>
          : part;
      })}
    </Text>
  );
}

const ITEM_SIZE = CARD_W + 16; // card width + marginHorizontal(8) * 2

// ── 카드뷰 아이템 ──────────────────────────────────────────────
function CardItem({ item, onDetail, index, scrollX }) {
  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.92, 1, 0.92],
    extrapolate: "clamp",
  });
  const shadowOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.06, 0.22, 0.06],
    extrapolate: "clamp",
  });
  const shadowRadius = scrollX.interpolate({
    inputRange,
    outputRange: [5, 18, 5],
    extrapolate: "clamp",
  });
  const elevation = scrollX.interpolate({
    inputRange,
    outputRange: [2, 10, 2],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={{
      width: CARD_W,
      marginHorizontal: 8,
      transform: [{ scale }],
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity,
      shadowRadius,
      elevation,
      backgroundColor: "#1C1C1E",
    }}>
      <ImageBackground
        source={{ uri: item.image }}
        style={cs.card}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={cs.overlay} />
        <View style={{ alignItems: "flex-end" }}>
          <View style={cs.fitBadge}>
            <Text style={cs.fitText}>매칭 적합도 {item.score}%</Text>
          </View>
        </View>
        <View>
          <Text style={cs.personaText}>{item.persona}</Text>
          <Text style={cs.nameText}>@{item.name}</Text>
          <View style={cs.tagRow}>
            {item.tags.map((tag, i) => (
              <Text key={i} style={cs.tagText}>{tag} </Text>
            ))}
          </View>
          <TouchableOpacity style={cs.actionBtn} onPress={() => onDetail(item)} activeOpacity={0.85}>
            <Text style={cs.actionBtnText}>상세 분석 인사이트</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

// API 응답 → 앱 데이터 구조로 변환
function _mapApiItem(item, idx) {
  return {
    id:                item.influencer_id ?? idx,
    name:              item.name ?? "",
    persona:           item.persona ?? "",
    score:             item.score ?? 0,
    platform:          item.platform ?? "Instagram",
    followers:         item.followers ?? "",
    location:          item.location ?? "USA",
    target_audience:   item.target_audience ?? "",
    image:             item.image ?? "",
    tags:              (item.tags ?? []).map(t => t.startsWith("#") ? t : `#${t}`),
    color:             CARD_COLORS[idx % CARD_COLORS.length],
    market_share:      item.market_share ?? 0,
    cosine_score:      item.cosine_score ?? 0,
    h01_risk:          item.h01_risk ?? "",
    h01_unmet:         item.h01_risk ?? "",
    keywords:          (item.tags ?? []).map(t => t.replace(/^#/, "")),
    product_feature:   "",
    content_direction: item.content_direction ?? "",
    category_main_id:  item.category_main_id ?? 1,
  };
}

// ── 메인 화면 ──────────────────────────────────────────────────
export default function MarketingInfluencer({ product, onBack, onPersonaDetail }) {
  const [viewMode, setViewMode] = useState("card");
  const [selected, setSelected] = useState(null);
  const [influencers, setInfluencers] = useState(FALLBACK_INFLUENCERS);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const category = product?.category || product?.subCategory || "";
    if (!category) return;
    setLoading(true);
    fetch(`${API_URL}/buyer/influencers-by-category?category=${encodeURIComponent(category)}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setInfluencers(data.map(_mapApiItem)))
      .catch(() => setInfluencers(FALLBACK_INFLUENCERS))
      .finally(() => setLoading(false));
  }, [product?.category, product?.subCategory]);

  const openDetail = (item) => {
    setSelected(item);
    setAiMessage(null);
    setAiLoading(true);
    fetch(`${API_URL}/buyer/ai-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        influencer_name:   item.name ?? "",
        persona:           item.persona ?? "",
        cosine_score:      item.cosine_score ?? 0,
        h01_risk:          item.h01_risk ?? "",
        market_share:      item.market_share ?? 0,
        content_direction: item.content_direction ?? "",
        target_audience:   item.target_audience ?? "",
        platform:          item.platform ?? "Instagram",
        followers:         String(item.followers ?? ""),
        product_name:      product?.name ?? "",
        product_brand:     product?.brand ?? "",
      }),
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setAiMessage(data.message))
      .catch(() => setAiMessage(null))
      .finally(() => setAiLoading(false));
  };
  const closeDetail = () => { setSelected(null); setAiMessage(null); };

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      {/* 상단바 — 흰색 배경 검정 글씨 */}
      <TopBar light titleLeft={false} title="인플루언서 페르소나" onBack={onBack} />

      {/* 매칭 상품 정보 카드 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View style={ms.productCard}>
          <Text style={ms.productCardLabel}>매칭 상품</Text>
          <Text style={ms.productCardBrand}>{product?.brand || "아누아"}</Text>
          <Text style={ms.productCardName}>{product?.name || "어성초 77 히알루론산 수분 진정 토너"}</Text>
          {(product?.spec || product?.category) && (
            <Text style={ms.productCardMeta}>
              {[product?.category, product?.spec, product?.price ? `$${product.price}` : null]
                .filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>
      </View>

      {/* 카운트 + 뷰 토글 */}
      <View style={ms.controlRow}>
        <Text style={ms.countLabel}>{loading ? "매칭 중…" : `${influencers.length}명 매칭됨`}</Text>
        <View style={ms.toggleGroup}>
          <TouchableOpacity
            style={[ms.toggleBtn, viewMode === "card" && ms.toggleBtnOn]}
            onPress={() => setViewMode("card")}
            activeOpacity={0.8}
          >
            <View style={ms.gridIcon}>
              <View style={ms.gridRow}>
                <View style={[ms.gridCell, viewMode === "card" && ms.gridCellOn]} />
                <View style={[ms.gridCell, viewMode === "card" && ms.gridCellOn]} />
              </View>
              <View style={ms.gridRow}>
                <View style={[ms.gridCell, viewMode === "card" && ms.gridCellOn]} />
                <View style={[ms.gridCell, viewMode === "card" && ms.gridCellOn]} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ms.toggleBtn, viewMode === "list" && ms.toggleBtnOn]}
            onPress={() => setViewMode("list")}
            activeOpacity={0.8}
          >
            <View style={ms.listIcon}>
              <View style={[ms.listLine, viewMode === "list" && ms.listLineOn]} />
              <View style={[ms.listLine, viewMode === "list" && ms.listLineOn]} />
              <View style={[ms.listLine, viewMode === "list" && ms.listLineOn]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 로딩 ── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.coral} />
          <Text style={{ marginTop: 14, fontSize: 14, color: "#848488" }}>인플루언서 페르소나 추천 중...</Text>
        </View>
      ) : viewMode === "card" ? (
      /* ── 카드뷰 ── */
        <View style={{ marginTop: 12, overflow: "visible" }}>
          <FlatList
            data={influencers}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
            style={{ flexGrow: 0 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <CardItem item={item} onDetail={openDetail} index={index} scrollX={scrollX} />
            )}
          />
        </View>
      ) : (
        /* ── 리스트뷰 ── */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={ms.listCard}>
            {influencers.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={[ms.listItem, i < influencers.length - 1 && ms.listItemBorder]}
                onPress={() => openDetail(item)}
                activeOpacity={0.85}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={ms.listAvatar} />
                ) : (
                  <View style={[ms.listAvatar, { backgroundColor: item.color }]}>
                    <Text style={ms.listAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={ms.listCategory}>{item.category} · {item.persona}</Text>
                  <Text style={ms.listName}>@{item.name}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 3 }}>
                    {item.tags.slice(0, 2).map((tag, ti) => (
                      <Text key={ti} style={ms.listTag}>{tag}</Text>
                    ))}
                  </View>
                </View>
                <View style={ms.listScore}>
                  <Text style={ms.listScoreText}>{item.score}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── 상세 분석 바텀시트 ── */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={bs.overlay}>
          <View style={bs.sheet}>
            <TouchableOpacity style={bs.closeBtn} onPress={closeDetail}>
              <Text style={bs.closeX}>✕</Text>
            </TouchableOpacity>
            <View style={bs.handle} />

            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={bs.sheetHeader}>EDA 기반 의사결정 리포트</Text>

                {/* 프로필 */}
                <View style={bs.profile}>
                  <Image source={{ uri: selected.image }} style={bs.profileAvatar} />
                  <View>
                    <Text style={bs.profileName}>@{selected.name}</Text>
                    <Text style={bs.profileSub}>{selected.location} · {selected.followers}만 팔로워</Text>
                  </View>
                </View>

                {/* 스탯 */}
                <View style={bs.statRow}>
                  <View style={bs.sBox}>
                    <Text style={bs.sLab}>매칭 적합도</Text>
                    <Text style={[bs.sVal, { color: colors.coral }]}>{selected.score}%</Text>
                  </View>
                  <View style={[bs.sBox, { flex: 1.5 }]}>
                    <Text style={bs.sLab}>주 타겟</Text>
                    <Text style={bs.sVal}>{selected.target_audience}</Text>
                  </View>
                </View>

                {/* 채널 */}
                <View style={bs.channelRow}>
                  <Text style={bs.channelLabel}>채널</Text>
                  <Text style={bs.platformText}>{selected.platform}</Text>
                </View>

                {/* 핵심 키워드 */}
                <View style={bs.section}>
                  <Text style={bs.sectionTitle}>핵심 매칭 키워드 (리뷰 분석)</Text>
                  <View style={bs.keywordWrap}>
                    {selected.keywords.map((kw, idx) => (
                      <View key={idx} style={bs.kwBadge}>
                        <Text style={bs.kwText}>#{kw}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 인사이트 근거 */}
                <View style={bs.section}>
                  <Text style={bs.sectionTitle}>분석 인사이트 근거</Text>

                  <View style={bs.evidenceItem}>
                    <View style={bs.h01Badge}>
                      <Text style={bs.h01Text}>H01</Text>
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={bs.evidenceLabel}>해결 리스크 (EDA)</Text>
                      <Text style={bs.evidenceValue}>{selected.h01_risk}</Text>
                    </View>
                  </View>

                  {/* CORE PERSONA 배너 */}
                  <View style={bs.personaBanner}>
                    <Text style={bs.coreLabel}>CORE PERSONA</Text>
                    <View style={bs.personaDivRow}>
                      <Text style={bs.personaNameLg}>{selected.persona}</Text>
                      <View style={bs.vDivider} />
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={bs.shareLabel}>시장 수요</Text>
                        <Text style={bs.shareVal}>{selected.market_share}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* AI 분석 메시지 */}
                  <View style={bs.aiBox}>
                    <View style={bs.aiHeader}>
                      <Text style={bs.aiStar}>✦</Text>
                      <Text style={bs.aiTitle}>AI 분석 추천 메시지</Text>
                    </View>
                    {aiLoading ? (
                      <ActivityIndicator size="small" color={colors.coral} style={{ marginVertical: 12 }} />
                    ) : aiMessage ? (
                      <ParsedText text={aiMessage} baseStyle={bs.aiTxt} coralStyle={bs.aiCoral} />
                    ) : (
                      <Text style={[bs.aiTxt, { color: "#848488" }]}>추천 메시지를 불러올 수 없습니다.</Text>
                    )}
                  </View>
                </View>

                {/* 마케팅 소스 보기 버튼 */}
                <View style={{ paddingBottom: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    style={bs.matchBtn}
                    onPress={() => { closeDetail(); onPersonaDetail?.(selected); }}
                    activeOpacity={0.85}
                  >
                    <Text style={bs.matchBtnText}>마케팅 소스 보기 →</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────

// ── 카드 스타일 (구 App_인플루언서 디자인) ────────────────────
const cs = {
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    overflow: "hidden",
    padding: 25,
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  fitBadge: {
    backgroundColor: colors.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  fitText:     { color: "#fff", fontWeight: "900", fontSize: 13 },
  personaText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  nameText:    { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 8 },
  tagRow:      { flexDirection: "row", marginBottom: 20 },
  tagText:     { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  actionBtn: {
    backgroundColor: colors.coral,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
};

// ── 화면 레이아웃 스타일 ─────────────────────────────────────
const ms = {
  // 상품 정보 카드
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardLabel: { fontSize: 11, fontWeight: "600", color: colors.coral, marginBottom: 4 },
  productCardBrand: { fontSize: 12, color: "#848488", marginBottom: 2 },
  productCardName:  { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  productCardMeta:  { fontSize: 12, color: "#848488", marginTop: 4 },

  // 카운트 + 토글 행
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  countLabel: { fontSize: 12, color: "#848488" },

  // 토글 버튼
  toggleGroup:  { flexDirection: "row", gap: 6 },
  toggleBtn:    { width: 36, height: 36, borderRadius: 8, backgroundColor: "#E5E5EA", alignItems: "center", justifyContent: "center" },
  toggleBtnOn:  { backgroundColor: "#1C1C1E" },
  gridIcon:     { gap: 3 },
  gridRow:      { flexDirection: "row", gap: 3 },
  gridCell:     { width: 6, height: 6, borderRadius: 1, backgroundColor: "#848488" },
  gridCellOn:   { backgroundColor: "#fff" },
  listIcon:     { gap: 3 },
  listLine:     { width: 16, height: 2, borderRadius: 1, backgroundColor: "#848488" },
  listLineOn:   { backgroundColor: "#fff" },

  // 리스트뷰 카드
  listCard:       { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  listItem:       { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: "#EBEBEF" },
  listAvatar:     { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  listAvatarText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  listCategory:   { fontSize: 11, fontWeight: "600", color: colors.coral, marginBottom: 2 },
  listName:       { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  listTag:        { fontSize: 11, color: "#848488" },
  listScore:      { backgroundColor: colors.coralBg, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  listScoreText:  { fontSize: 13, fontWeight: "700", color: colors.coral },
};

// ── 바텀시트 스타일 ──────────────────────────────────────────
const bs = {
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet:         { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "90%" },
  closeBtn:      { position: "absolute", top: 20, right: 24, zIndex: 10 },
  closeX:        { fontSize: 20, color: "#848488" },
  handle:        { width: 36, height: 4, backgroundColor: "#E5E5EA", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  sheetHeader:   { textAlign: "center", fontSize: 11, fontWeight: "600", color: "#848488", marginBottom: 20, letterSpacing: 1 },

  profile:       { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14, backgroundColor: "#F2F2F7" },
  profileName:   { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  profileSub:    { fontSize: 13, fontWeight: "500", color: "#848488", marginTop: 2 },

  statRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  sBox:    { flex: 1, backgroundColor: "#F8F8F8", padding: 12, borderRadius: 10, alignItems: "center" },
  sLab:    { fontSize: 11, fontWeight: "500", color: "#848488", marginBottom: 4 },
  sVal:    { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },

  channelRow:   { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  channelLabel: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", borderLeftWidth: 3, borderLeftColor: colors.coral, paddingLeft: 10, marginRight: 12 },
  platformText: { fontSize: 14, fontWeight: "600", color: colors.coral },

  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.coral, paddingLeft: 10 },

  keywordWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kwBadge:     { backgroundColor: "#F8F8F8", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#E5E5EA" },
  kwText:      { fontSize: 12, fontWeight: "600", color: "#1C1C1E" },

  evidenceItem:  { flexDirection: "row", marginBottom: 14 },
  h01Badge:      { paddingHorizontal: 7, height: 20, borderRadius: 4, marginTop: 2, justifyContent: "center", backgroundColor: colors.coral },
  h01Text:       { color: "#fff", fontSize: 10, fontWeight: "700" },
  evidenceLabel: { fontSize: 12, fontWeight: "500", color: "#848488", marginBottom: 2 },
  evidenceValue: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },

  personaBanner:  { backgroundColor: "#1C1C1E", paddingHorizontal: 20, paddingVertical: 20, borderRadius: 10, marginBottom: 14 },
  coreLabel:      { fontSize: 9, fontWeight: "700", color: colors.coral, letterSpacing: 1.5, marginBottom: 14 },
  personaDivRow:  { flexDirection: "row", alignItems: "center" },
  personaNameLg:  { fontSize: 20, fontWeight: "700", color: "#fff", flex: 1 },
  vDivider:       { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 18 },
  shareLabel:     { fontSize: 10, fontWeight: "500", color: "rgba(255,255,255,0.5)", marginBottom: 5 },
  shareVal:       { fontSize: 22, fontWeight: "700", color: "#fff" },

  aiBox:    { backgroundColor: "#F8F8F8", padding: 16, borderRadius: 10 },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  aiStar:   { fontSize: 13, color: colors.coral },
  aiTitle:  { fontSize: 14, fontWeight: "700", color: colors.coral, marginLeft: 5 },
  aiTxt:    { fontSize: 13, fontWeight: "400", color: "#3A3A3C", lineHeight: 24 },
  aiCoral:  { fontSize: 14, fontWeight: "700", color: colors.coral },
  aiBold:   { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },

  matchBtn:     { backgroundColor: "#1C1C1E", borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  matchBtnText: { fontSize: 15, fontWeight: "500", color: "#fff" },
};
