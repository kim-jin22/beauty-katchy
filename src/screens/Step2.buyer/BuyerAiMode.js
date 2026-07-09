import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Animated, Easing, Platform, KeyboardAvoidingView,
  StyleSheet, Modal, Image,
} from "react-native";
import TopBar from "../../components/TopBar";
import { colors, pageBg } from "../../styles";
import { getProductImage } from "../../data/productImages";

const CORAL   = "#F05C5C";
const API_URL = "https://finalteam4-production-e6c4.up.railway.app";


const BUYER_NEEDS = [
  { id: "sticky",    title: "끈적임 해결",  desc: "끈적임 없는 선케어 소싱하기", accentColor: "#F05C5C", bgColor: "#FFF2F2", query: "끈적임 없는 선크림 찾아줘" },
  { id: "acne",      title: "여드름 유발↓", desc: "논코메도제닉 소싱",           accentColor: "#3EC9A7", bgColor: "#EDFAF6", query: "여드름 유발 없는 논코메도제닉 선크림 찾아줘" },
  { id: "whitecast", title: "백탁 제로",    desc: "무백탁 무기자차 제품 찾기",    accentColor: "#E5A000", bgColor: "#FFF8E0", query: "백탁 없는 무기자차 선크림 찾아줘" },
];

const CHIPS = [
  { label: "트렌드 탐색",    query: "트렌드 탐색",    coral: true, hasSub: true },
  { label: "제품 검색",      query: "제품 검색",      coral: true  },
  { label: "마진 계산",      query: "마진 계산",      coral: true  },
  { label: "조건 모르겠어요", query: "조건 모르겠어요", coral: false },
];

const TREND_CATEGORIES = [
  { label: "전체",    query: "전체 카테고리 트렌드 분석해줘" },
  { label: "선케어",  query: "선케어 트렌드 분석해줘" },
  { label: "스킨케어", query: "스킨케어 트렌드 분석해줘" },
  { label: "클렌징",  query: "클렌징 트렌드 분석해줘" },
  { label: "마스크팩",  query: "마스크팩 트렌드 분석해줘" },
];

const TRENDING_POOL = [
  { label: "무기자차",      growth: "+39%" },
  { label: "비건인증",      growth: "+28%" },
  { label: "glass skin",    growth: "+22%" },
  { label: "ceramide",      growth: "+21%" },
  { label: "niacinamide",   growth: "+18%" },
  { label: "barrier cream", growth: "+15%" },
  { label: "hyaluronic",    growth: "+31%" },
  { label: "retinol",       growth: "+26%" },
  { label: "SPF50+",        growth: "+19%" },
  { label: "centella",      growth: "+17%" },
  { label: "peptide",       growth: "+23%" },
  { label: "vegan cert",    growth: "+20%" },
];

// 시연 중 등록되는 상품 — 매칭 결과 최상단 고정
const DEMO_SUPPLIER = {
  name:  "어성초 77 히알루론산 수분 진정 토너",
  cert:  "어성초추출물, 히알루론산",
  score: 85,
};

const STEPS = [
  "키워드 분석 중...",
  "시장 트렌드 검색 중...",
  "공급업체 DB 매칭 중...",
  "Fit Score 계산 중...",
];

async function buildAiResponse(query) {
  const q = query.toLowerCase();

  // 시연 상품 상세보기 — 가격 통계는 DB에서 fetch
  if (q.includes("어성초 77 히알루론산") && q.includes("상세보기")) {
    const priceStats = await fetch(`${API_URL}/buyer/price-stats?category=스킨케어`)
      .then(r => r.json())
      .catch(() => ({ min: 5, avg: 54, max: 146 }));
    return {
      type: "ai", id: Date.now(),
      summary: "어성초 77 히알루론산 수분 진정 토너 상세 정보예요!",
      detail: {
        name:         "어성초 77 히알루론산 수분 진정 토너",
        fitScore:     85,
        category:     "토너",
        price:        33,
        moq:          100,
        spf:          null,
        ingredients:  ["판테놀", "알란토인", "소듐하이알루로네이트"],
        pricePosition: priceStats,
      },
      actions: [{ label: "협상가이드" }],
    };
  }

  // UI 전용 분기 — 서버 호출 불필요
  if (q === "트렌드 탐색") {
    return { type: "ai", id: Date.now(), summary: "어떤 카테고리 트렌드를 분석해드릴까요?\n직접 입력하거나 아래에서 선택해주세요.", trendSelect: true };
  }
  if (q.includes("모르겠") || q.includes("clarify")) {
    return { type: "ai", id: Date.now(), summary: "소싱 조건을 좁혀드릴게요! 아래에서 선택해주세요.", clarify: true };
  }

  // 나머지는 백엔드로
  try {
    const res = await fetch(`${API_URL}/buyer/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, show_all: q.includes("전체") }),
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return { type: "ai", id: Date.now(), ...data };
  } catch {
    return {
      type: "ai", id: Date.now(),
      summary: "일시적으로 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.",
    };
  }
}

// ── 트렌드 바 채움 애니메이션 ──────────────────────────────────
function TrendBar({ pct, color, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 750,
      delay: 1000 + index * 150,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, []);
  const animWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${Math.round(pct * 100)}%`],
  });
  return <Animated.View style={[s.trendBarFill, { width: animWidth, backgroundColor: color }]} />;
}

// ── 로딩 점 애니메이션 ──────────────────────────────────────────
function LoadingDots() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    const anims = dots.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 160),
      Animated.timing(v, { toValue: 1,   duration: 260, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.3, duration: 260, useNativeDriver: true }),
      Animated.delay(Math.max(0, 320 - i * 160)),
    ])));
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={{ flexDirection: "row", gap: 5, paddingVertical: 6 }}>
      {dots.map((v, i) => <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: CORAL, opacity: v }} />)}
    </View>
  );
}

// ── AI 응답 카드 ───────────────────────────────────────────────
function AiCard({ msg, onAction, onNegoRequest }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasData  = msg.trendSelect || msg.trends || msg.keywords || msg.suppliers || msg.detail || msg.clarify;
  const [expanded, setExpanded]         = useState(false);
  const [allSuppliers, setAllSuppliers] = useState(null);
  const [loadingExpand, setLoadingExpand] = useState(false);

  const canExpand = msg.actions?.some(a => a.label === "제품 전체 보기") && (msg.suppliers?.length ?? 0) > 0;
  const baseSuppliers = expanded && allSuppliers ? allSuppliers : (msg.suppliers || []);
  const displayedSuppliers = msg.suppliers
    ? [DEMO_SUPPLIER, ...baseSuppliers.filter(s => !s.name?.includes("토너"))]
    : [];

  const expandAll = async () => {
    if (expanded) { setExpanded(false); return; }
    if (allSuppliers) { setExpanded(true); return; }
    setLoadingExpand(true);
    try {
      const res = await fetch(`${API_URL}/buyer/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg._query || "", show_all: true }),
      });
      const data = res.ok ? await res.json() : {};
      setAllSuppliers(data.suppliers?.length ? data.suppliers : msg.suppliers);
    } catch {
      setAllSuppliers(msg.suppliers);
    }
    setExpanded(true);
    setLoadingExpand(false);
  };

  useEffect(() => {
    if (!hasData) return;
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.aiMsgWrap}>
      <View style={s.aiAvatar}><Text style={s.aiAvatarText}>AI</Text></View>
      <View style={s.aiBody}>
        <View style={s.aiBubble}>
          <Text style={s.aiBubbleText}>{msg.summary}</Text>
        </View>

        {hasData && (
          <Animated.View style={{ opacity: fadeAnim, gap: 8 }}>
            {msg.trendSelect && (
              <View style={s.dataCard}>
                <Text style={s.dataCardTitle}>카테고리 선택</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {TREND_CATEGORIES.map((cat, i) => (
                    <TouchableOpacity
                      key={i}
                      style={s.actionChipCoral}
                      onPress={() => onAction?.(cat.query)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.actionChipCoralText}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {msg.trends && (
              <View style={s.dataCard}>
                <Text style={s.dataCardTitle}>카테고리 트렌드</Text>
                {msg.trends.map((t, i) => (
                  <View key={i} style={s.trendRow}>
                    <Text style={s.trendName}>{t.name}</Text>
                    <View style={s.trendBarBg}>
                      <TrendBar pct={t.bar} color={t.hot ? CORAL : "#C7C7CC"} index={i} />
                    </View>
                    <Text style={[s.trendGrowth, { color: t.hot ? CORAL : "#8E8E93" }]}>{t.growth}</Text>
                  </View>
                ))}
              </View>
            )}

            {msg.keywords && (
              <View style={s.dataCard}>
                <Text style={s.dataCardTitle}>급상승 성분 키워드</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {msg.keywords.map((kw, i) => (
                    <View key={i} style={i < 2 ? s.kwHot : s.kwNormal}>
                      <Text style={i < 2 ? s.kwHotText : s.kwNormalText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {msg.suppliers && (
              <View style={s.dataCard}>
                <Text style={s.dataCardTitle}>매칭된 제품</Text>
                {displayedSuppliers.map((sp, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.supplierRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: "#F2F2F7", marginTop: 10, paddingTop: 10 }]}
                    onPress={() => onAction?.(`${sp.name} 상세보기`)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.supplierName}>{sp.name}</Text>
                      <Text style={s.supplierMeta}>성분: {sp.cert}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <View style={s.scoreTag}><Text style={s.scoreTagText}>FS {sp.score}</Text></View>
                      <Text style={{ fontSize: 11, color: "#AEAEB2" }}>상세 보기 →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {canExpand && (
                  <TouchableOpacity
                    onPress={expandAll}
                    activeOpacity={0.7}
                    disabled={loadingExpand}
                    style={{ alignItems: "center", marginTop: 12, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: "#E5E5EA" }}
                  >
                    {loadingExpand
                      ? <Text style={{ fontSize: 12, color: "#AEAEB2" }}>불러오는 중...</Text>
                      : <View style={{
                          width: 12,
                          height: 12,
                          borderRightWidth: 1.5,
                          borderBottomWidth: 1.5,
                          borderColor: "#8E8E93",
                          transform: [{ rotate: expanded ? "225deg" : "45deg" }],
                          marginTop: expanded ? 4 : -4,
                        }} />
                    }
                  </TouchableOpacity>
                )}
              </View>
            )}

            {msg.detail && (
              <View style={s.dataCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={s.dataCardTitle}>제품 상세정보</Text>
                  <View style={s.fsBadge}><Text style={s.fsBadgeText}>FS {msg.detail.fitScore}</Text></View>
                </View>
                {getProductImage(msg.detail.name) && (
                  <Image
                    source={getProductImage(msg.detail.name)}
                    style={{ width: "100%", height: 160, borderRadius: 10, resizeMode: "contain", marginBottom: 12, backgroundColor: "#F8F8F8" }}
                  />
                )}
                <View>
                  {[["카테고리", msg.detail.category], ["가격", `$${msg.detail.price}`], ["MOQ", `${msg.detail.moq}개`], ["SPF", msg.detail.spf ?? "없음"]].map(([label, value], i) => (
                    <View key={i} style={s.detailRow}>
                      <Text style={s.detailLabel}>{label}</Text>
                      <Text style={s.detailValue}>{value}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[s.detailLabel, { marginTop: 14, marginBottom: 8 }]}>주요 성분</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {msg.detail.ingredients.map((ing, i) => (
                    <View key={i} style={s.ingredientChip}>
                      <Text style={s.ingredientChipText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {msg.clarify && (
              <View style={s.dataCard}>
                <Text style={s.dataCardTitle}>카테고리를 선택해주세요</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {["스킨케어", "선케어", "클렌징", "마스크팩"].map((cat, i) => (
                    <TouchableOpacity key={i} style={s.kwNormal} onPress={() => onAction?.(`${cat} 제품 찾아줘`)}>
                      <Text style={s.kwNormalText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[s.dataCardTitle, { marginTop: 12 }]}>가격대는요?</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {["$10 이하", "$10~15", "$15 이상"].map((price, i) => (
                    <TouchableOpacity key={i} style={s.kwNormal} onPress={() => onAction?.(`${price} 제품 찾아줘`)}>
                      <Text style={s.kwNormalText}>{price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {msg.actions && msg.actions.length > 0 && (
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                {msg.actions.some(a => a.label === "협상가이드") && (
                  <TouchableOpacity
                    style={s.actionPrimary}
                    onPress={() => onNegoRequest?.(msg.detail)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.actionPrimaryText}>협상가이드</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function BuyerAiMode({ onTab, onBack, onMatchRequest }) {
  const [query, setQuery]             = useState("");
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [stepIdx, setStepIdx]         = useState(0);
  const [chatVisible, setChatVisible]   = useState(false);
  const [selectedChip, setSelectedChip] = useState(null);
  const [negoProduct, setNegoProduct]   = useState(null);
  const [showChatChips, setShowChatChips] = useState(false);
  const scrollRef      = useRef(null);
  const sendScale      = useRef(new Animated.Value(1)).current;
  const [trendItems, setTrendItems] = useState(() => TRENDING_POOL.slice(0, 6));
  const trendAnim = useRef(Array(6).fill(null).map(() => ({
    opacity: new Animated.Value(0),
    y: new Animated.Value(10),
  }))).current;
  const hadText        = useRef(false);
  const chipFadeAnim   = useRef(new Animated.Value(0)).current;
  const arrowAnim      = useRef(new Animated.Value(0)).current;
  const toggleChatChips = () => {
    const opening = !showChatChips;
    if (opening) {
      setShowChatChips(true);
      Animated.parallel([
        Animated.timing(chipFadeAnim, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(arrowAnim,    { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(chipFadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(arrowAnim,    { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => setShowChatChips(false));
    }
  };

  useEffect(() => {
    let alive = true;
    const startLoop = ({ opacity, y }, slotIdx) => {
      if (!alive) return;
      const fadeIn  = 600 + Math.random() * 600;
      const hold    = 3000 + Math.random() * 3000;
      const fadeOut = 500 + Math.random() * 500;
      opacity.setValue(0);
      y.setValue(6 + Math.random() * 6);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: fadeIn,  useNativeDriver: true }),
          Animated.timing(y,       { toValue: 0, duration: fadeIn,  useNativeDriver: true }),
        ]),
        Animated.delay(hold),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: fadeOut, useNativeDriver: true }),
          Animated.timing(y,       { toValue: -(4 + Math.random() * 5), duration: fadeOut, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && alive) {
          setTrendItems(prev => {
            const updated = [...prev];
            const usedLabels = updated.filter((_, idx) => idx !== slotIdx).map(p => p.label);
            const available  = TRENDING_POOL.filter(p => !usedLabels.includes(p.label));
            updated[slotIdx] = available[Math.floor(Math.random() * available.length)];
            return updated;
          });
          startLoop({ opacity, y }, slotIdx);
        }
      });
    };
    const timers = trendAnim.map((a, i) =>
      setTimeout(() => startLoop(a, i), Math.random() * 1500)
    );
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    const hasText = !!query.trim();
    if (hasText && !hadText.current) {
      Animated.sequence([
        Animated.spring(sendScale, { toValue: 1.22, useNativeDriver: true, speed: 28, bounciness: 16 }),
        Animated.spring(sendScale, { toValue: 1,    useNativeDriver: true, speed: 18, bounciness: 0 }),
      ]).start();
    }
    hadText.current = hasText;
  }, [!!query.trim()]);

  const goBack = () => {
    setChatVisible(false);
    setMessages([]);
    setSelectedChip(null);
  };

  const sendQuery = async (text) => {
    const q = (text || query).trim();
    if (!q || loading) return;
    setQuery("");
    if (!chatVisible) setChatVisible(true);
    setMessages(prev => [...prev, { type: "user", id: Date.now(), text: q }]);
    setLoading(true);
    setStepIdx(0);
    for (let i = 1; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setStepIdx(i);
    }
    await new Promise(r => setTimeout(r, 600));
    const response = await buildAiResponse(q);
    setMessages(prev => [...prev, { ...response, _query: q }]);
    setLoading(false);
  };

  const SendBtn = ({ large }) => {
    const active = !!query.trim() && !loading;
    return (
      <Animated.View style={{ transform: [{ scale: sendScale }] }}>
        <TouchableOpacity
          style={[large ? s.sendBtnLarge : s.sendBtnSmall, !active && s.sendBtnOff]}
          onPress={() => sendQuery()}
          disabled={!active}
          activeOpacity={0.75}
        >
          <Text style={large ? s.sendBtnLargeText : s.sendBtnSmallText}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ── 단일 화면 — 통합 ScrollView ──────────────────────────────
  return (
    <View style={s.screen}>
      <TopBar
        light
        titleLeft={false}
        title="AI 소싱 모드"
        onBack={chatVisible ? goBack : onBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 35 : 30}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.mainContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => chatVisible && scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {/* 메인 콘텐츠 */}
          <View style={s.heroSection}>
            <Text style={s.heroTitle}>AI 소싱 모드와 함께{"\n"}스마트 소싱</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 6 }}
          >
            {BUYER_NEEDS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[s.needCard, { backgroundColor: item.bgColor, borderColor: item.accentColor + "50" }]}
                onPress={() => sendQuery(item.query)}
                activeOpacity={0.82}
              >
                <Text style={[s.needTitle, { color: item.accentColor }]}>{item.title}</Text>
                <Text style={s.needDesc}>{item.desc}</Text>
                <View style={[s.needBtn, { backgroundColor: item.accentColor }]}>
                  <Text style={s.needBtnText}>분석 →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.trendingSection}>
            <Text style={s.trendingTitle}>지금 뜨는 키워드</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {trendItems.map((item, i) => (
                <Animated.View key={i} style={{ opacity: trendAnim[i].opacity, transform: [{ translateY: trendAnim[i].y }] }}>
                  <TouchableOpacity
                    style={s.trendingChip}
                    onPress={() => sendQuery(`${item.label} 찾아줘`)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.trendingChipLabel}>{item.label}</Text>
                    <Text style={s.trendingChipGrowth}>{item.growth}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {chatVisible && (
            <View>
              <View style={s.chatShortDivider} />
              <View style={s.chatMessagesWrap}>
                {messages.map(msg =>
                  msg.type === "user" ? (
                    <View key={msg.id} style={s.userMsgWrap}>
                      <View style={s.userBubble}>
                        <Text style={s.userBubbleText}>{msg.text}</Text>
                      </View>
                    </View>
                  ) : (
                    <AiCard key={msg.id} msg={msg} onAction={sendQuery} onNegoRequest={setNegoProduct} />
                  )
                )}
                {loading && (
                  <View style={s.aiMsgWrap}>
                    <View style={s.aiAvatar}><Text style={s.aiAvatarText}>AI</Text></View>
                    <View style={s.aiBubble}>
                      <Text style={s.stepText}>{STEPS[stepIdx]}</Text>
                      <LoadingDots />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 하단 고정: 채팅 중엔 작은 입력창만, 메인엔 칩+큰입력창 */}
        <View style={s.bottomFixed}>
          {chatVisible ? (
            <View>
              {/* 칩 패널 — 토글 시 페이드 */}
              {showChatChips && (
                <Animated.View style={{ opacity: chipFadeAnim }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
                  >
                    {CHIPS.map((c, i) => (
                      <TouchableOpacity
                        key={i}
                        style={c.coral ? s.actionChipCoral : s.actionChipGray}
                        onPress={() => { toggleChatChips(); sendQuery(c.query); }}
                        activeOpacity={0.7}
                      >
                        <Text style={c.coral ? s.actionChipCoralText : s.actionChipGrayText}>{c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}

              {/* 입력바 */}
              <View style={s.detailInputBar}>
                {/* 토글 화살표 버튼 */}
                <TouchableOpacity style={s.chipToggleBtn} onPress={toggleChatChips} activeOpacity={0.7}>
                  <Animated.View style={{
                    width: 8, height: 8,
                    borderRightWidth: 2, borderBottomWidth: 2, borderColor: "#8E8E93",
                    transform: [
                      { rotate: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: ["45deg", "225deg"] }) },
                      { translateY: arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
                    ],
                  }} />
                </TouchableOpacity>
                <TextInput
                  style={s.detailInput}
                  placeholder="추가 질문 입력..."
                  placeholderTextColor="#AEAEB2"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => sendQuery()}
                  returnKeyType="send"
                />
                <SendBtn />
              </View>
            </View>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 }}>
                {CHIPS.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={selectedChip === c.label ? s.actionChipSelected : c.coral ? s.actionChipCoral : s.actionChipGray}
                    onPress={() => { setSelectedChip(c.label); sendQuery(c.query); }}
                    activeOpacity={0.7}
                  >
                    <Text style={selectedChip === c.label ? s.actionChipSelectedText : c.coral ? s.actionChipCoralText : s.actionChipGrayText}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={s.detailInputBar}>
                <TextInput
                  style={s.detailInput}
                  placeholder="소싱 조건을 입력해보세요..."
                  placeholderTextColor="#AEAEB2"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => sendQuery()}
                  returnKeyType="send"
                />
                <SendBtn />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* 협상가이드 바텀시트 */}
      <NegotiationSheet
        product={negoProduct}
        visible={!!negoProduct}
        onClose={() => setNegoProduct(null)}
        onMatchRequest={() => { setNegoProduct(null); onMatchRequest?.(); }}
      />
    </View>
  );
}

// ── 협상가이드 바텀시트 ──────────────────────────────────────────
function NegotiationSheet({ product, visible, onClose, onMatchRequest }) {
  if (!product) return null;

  const p   = product.price || 37;
  const moq = product.moq || 100;

  // EDA H16 티어별 가격 탄력성 (ANOVA / Tukey HSD 분석 기반)
  const edaTier = p >= 40
    ? { mean: 0.0678, sd: 0.0176 }  // High tier (≥$40)
    : p >= 15
    ? { mean: 0.0332, sd: 0.0174 }  // Mid tier ($15~$40)
    : { mean: 0.0077, sd: 0.0108 }; // Mass tier (<$15)

  // 공급가: 소매가의 27/32/38% (K-뷰티 평균 구조)
  const t1 = +(p * 0.27).toFixed(2);
  const t2 = +(p * 0.32).toFixed(2);
  const t3 = +(p * 0.38).toFixed(2);

  // 미국 시장 판매가 — EDA 실측값 기반
  const FULL_PRICE = +p.toFixed(2);
  const AVG_PRICE  = +(p * (1 - edaTier.mean)).toFixed(2);
  const LOW_PRICE  = +(p * (1 - (edaTier.mean + edaTier.sd))).toFixed(2);

  const margin1 = Math.round(((AVG_PRICE - t1) / AVG_PRICE) * 100);
  const margin2 = Math.round(((AVG_PRICE - t2) / AVG_PRICE) * 100);
  const margin3 = Math.round(((AVG_PRICE - t3) / AVG_PRICE) * 100);

  const TIERS = [
    { label: "Tier 1", style: "t1", moq: "500개+",     price: `$${t1.toFixed(2)}`, margin: `${margin1}%`, marginColor: "#0A7A5A" },
    { label: "Tier 2", style: "t2", moq: "200개+",     price: `$${t2.toFixed(2)}`, margin: `${margin2}%`, marginColor: "#3A3A3C" },
    { label: "Tier 3", style: "t3", moq: `${moq}개+`, price: `$${t3.toFixed(2)}`, margin: `${margin3}%`, marginColor: "#8E8E93" },
  ];

  const MAX = FULL_PRICE;
  const BENCH = [
    { label: "정가",   fill: FULL_PRICE / MAX, val: `$${FULL_PRICE}`, mineLeft: `${Math.round((t1 / MAX) * 100)}%` },
    { label: "평균가", fill: AVG_PRICE  / MAX, val: `$${AVG_PRICE}`,  mineLeft: `${Math.round((t1 / MAX) * 100)}%` },
    { label: "최저가", fill: LOW_PRICE  / MAX, val: `$${LOW_PRICE}`,  mineLeft: `${Math.round((t1 / MAX) * 100)}%` },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={ns.sheet}>
          <View style={ns.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* 상품 헤더 */}
            <View style={ns.productRow}>
              <View style={ns.thumb}>
                {getProductImage(product.name) ? (
                  <Image source={getProductImage(product.name)} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                ) : (
                  <Text style={ns.thumbText}>{product.category || "선케어"}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ns.productName}>{product.name}</Text>
                <Text style={ns.productSub}>{product.category || "선케어"}{product.spf ? ` · SPF${product.spf}+` : ""}</Text>
                <View style={ns.fitBadge}><Text style={ns.fitBadgeText}>FS {product.fitScore || product.score || "—"}</Text></View>
              </View>
            </View>

            {/* 티어별 공급가 */}
            <View style={ns.section}>
              <View style={ns.sectionHeader}>
                <Text style={ns.sectionLabel}>티어별 공급가</Text>
                <Text style={ns.sectionSub}>MOQ 기준</Text>
              </View>
              {/* 테이블 헤더 */}
              <View style={ns.tableHeader}>
                {["티어", "MOQ", "공급가", "마진율"].map((h, i) => (
                  <Text key={h} style={[ns.th, i === 0 ? { flex: 1.2 } : { flex: 1, textAlign: "right" }]}>{h}</Text>
                ))}
              </View>
              {TIERS.map((t, i) => (
                <View key={i} style={[ns.tableRow, i < TIERS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: "#F8F8F8" }]}>
                  <View style={[ns.tierBadge, t.style === "t3" ? ns.tier1 : ns.tier23, { flex: 1.2 }]}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: t.style === "t3" ? "#fff" : "#1C1C1E" }}>{t.label}</Text>
                  </View>
                  <Text style={[ns.td, { flex: 1, textAlign: "right", color: "#8E8E93", fontSize: 12 }]}>{t.moq}</Text>
                  <Text style={[ns.td, { flex: 1, textAlign: "right", fontWeight: "700", fontSize: 14 }]}>{t.price}</Text>
                  <Text style={[ns.td, { flex: 1, textAlign: "right", fontWeight: "700", color: t.marginColor }]}>{t.margin}</Text>
                </View>
              ))}
            </View>

            {/* 미국 시장 가격 벤치마크 */}
            <View style={ns.section}>
              <View style={ns.sectionHeader}>
                <Text style={ns.sectionLabel}>미국 시장 가격 벤치마크</Text>
                <Text style={ns.sectionSub}>EDA 실측 분석 기준</Text>
              </View>
              {BENCH.map((b, i) => (
                <View key={i} style={[ns.benchRow, { marginBottom: i < BENCH.length - 1 ? 16 : 8 }]}>
                  <Text style={ns.benchLabel}>{b.label}</Text>
                  <View style={ns.benchBarBg}>
                    <View style={[ns.benchBarFill, { width: `${Math.round(b.fill * 100)}%` }]} />
                    <View style={[ns.benchMark, { left: b.mineLeft }]} />
                  </View>
                  <Text style={ns.benchVal}>{b.val}</Text>
                </View>
              ))}
              <View style={ns.legend}>
                <View style={ns.legendItem}>
                  <View style={[ns.legendDot, { backgroundColor: "#1C1C1E" }]} />
                  <Text style={ns.legendText}>미국 시장 가격</Text>
                </View>
                <View style={ns.legendItem}>
                  <View style={[ns.legendDot, { backgroundColor: CORAL, width: 2 }]} />
                  <Text style={ns.legendText}>Tier 1 공급가 기준</Text>
                </View>
              </View>
            </View>

            {/* 참고 */}
            <View style={[ns.section, { paddingBottom: 0 }]}>
              <View style={ns.sectionHeader}>
                <Text style={ns.sectionLabel}>참고</Text>
              </View>
              <View style={ns.alertBox}>
                <Text style={ns.alertText}>
                  {"Tier 1 공급가 "}
                  <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>${t1.toFixed(2)}</Text>
                  {" 기준 EDA 실측 평균 판매가("}
                  <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>${AVG_PRICE}</Text>
                  {") 대비 예상 마진은 "}
                  <Text style={{ color: "#1C1C1E", fontWeight: "700" }}>약 {margin1}%</Text>
                  {"예요.\n미국 시장 판매가는 EDA 분석결과 기반이에요."}
                </Text>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* 버튼 */}
          <View style={ns.btnRow}>
            <TouchableOpacity style={ns.btnPrimary} onPress={onMatchRequest} activeOpacity={0.85}>
              <Text style={ns.btnPrimaryText}>매칭 요청</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ns.btnSecondary} activeOpacity={0.85}>
              <Text style={ns.btnSecondaryText}>샘플 요청</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ns = StyleSheet.create({
  sheet:       { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 14, paddingBottom: Platform.OS === "ios" ? 35 : 30, maxHeight: "88%" },
  handle:      { width: 36, height: 4, backgroundColor: "#E5E5EA", borderRadius: 2, alignSelf: "center", marginBottom: 20 },

  productRow:  { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#F2F2F7" },
  thumb:       { width: 52, height: 52, borderRadius: 8, backgroundColor: "#F8F8F8", alignItems: "center", justifyContent: "center" },
  thumbText:   { fontSize: 11, color: "#C7C7CC", textAlign: "center" },
  productName: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", marginBottom: 3 },
  productSub:  { fontSize: 12, color: "#8E8E93", marginBottom: 6 },
  fitBadge:    { alignSelf: "flex-start", backgroundColor: CORAL, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  fitBadgeText:{ fontSize: 11, fontWeight: "700", color: "#fff" },

  section:       { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", marginBottom: 16 },
  sectionLabel:  { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  sectionSub:    { fontSize: 11, color: "#8E8E93" },

  tableHeader: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: "#E5E5EA", marginBottom: 4 },
  th:          { fontSize: 11, color: "#8E8E93", fontWeight: "500" },
  tableRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  td:          { fontSize: 13, color: "#3A3A3C" },
  tierBadge:   { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: "flex-start" },
  tier1:       { backgroundColor: CORAL },
  tier23:      { backgroundColor: "#F2F2F7" },

  benchRow:    { flexDirection: "row", alignItems: "center", gap: 10 },
  benchLabel:  { fontSize: 12, color: "#3A3A3C", width: 44 },
  benchBarBg:  { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 3, height: 5, position: "relative" },
  benchBarFill:{ borderRadius: 3, height: 5, backgroundColor: "#1C1C1E" },
  benchMark:   { position: "absolute", top: -3, width: 2, height: 11, backgroundColor: CORAL, borderRadius: 2 },
  benchVal:    { fontSize: 12, fontWeight: "700", color: "#1C1C1E", width: 46, textAlign: "right" },
  legend:      { flexDirection: "row", gap: 14, marginTop: 4 },
  legendItem:  { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:   { width: 8, height: 3, borderRadius: 2 },
  legendText:  { fontSize: 11, color: "#8E8E93" },

  alertBox:    { backgroundColor: "#F8F8F8", borderRadius: 8, padding: 14 },
  alertText:   { fontSize: 12, color: "#8E8E93", lineHeight: 20 },

  btnRow:          { flexDirection: "row", gap: 10, marginTop: 12 },
  btnPrimary:      { flex: 1, backgroundColor: CORAL, borderRadius: 8, paddingVertical: 18, alignItems: "center" },
  btnPrimaryText:  { fontSize: 14, fontWeight: "600", color: "#fff" },
  btnSecondary:    { flex: 1, borderWidth: 1.5, borderColor: "#D1D1D6", borderRadius: 8, paddingVertical: 18, alignItems: "center" },
  btnSecondaryText:{ fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
});

const s = StyleSheet.create({
  screen: { flex: 1 },

  // ── 메인 화면 ────────────────────────────────────────────────
  mainContent: { paddingTop: 4, paddingBottom: 24 },

  heroSection: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#1C1C1E", lineHeight: 31, letterSpacing: -0.5 },

  // 가로 스크롤 미충족 수요 카드
  needCard: {
    width: 148,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  needTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  needDesc:  { fontSize: 11, color: "#636366", lineHeight: 16, flex: 1 },
  needBtn:   { alignSelf: "flex-start", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, marginTop: 6 },
  needBtnText: { fontSize: 11, fontWeight: "600", color: "#fff" },

  // 빠른 액션 칩 (두 번째 행 — 트렌드탐색 등)
  actionChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 4,
  },
  // 트렌드 카테고리 선택 헤더
  trendSelectHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  trendSelectLabel:  { fontSize: 12, fontWeight: "700", color: CORAL },
  trendSelectClose:  { fontSize: 16, color: "#AEAEB2" },

  actionChipSelected: {
    backgroundColor: CORAL,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CORAL,
  },
  actionChipSelectedText: { fontSize: 13, color: "#fff", fontWeight: "600" },

  actionChipCoral: {
    backgroundColor: "#FFF2F2",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#FFCECE",
  },
  actionChipCoralText: { fontSize: 13, color: "#D94040", fontWeight: "500" },

  actionChipGray: {
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  actionChipGrayText: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },

  // 하단 고정 영역 (트렌드탐색 칩 + 입력창)
  bottomFixed: {
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
  },

  // 지금 뜨는 키워드 섹션 (스크롤뷰 내)
  trendingSection: { paddingLeft: 22, paddingRight: 16, marginTop: 16, paddingBottom: 20 },

  // 채팅 구분 짧은 선
  chatShortDivider: { width: "80%", height: 1, backgroundColor: "#E5E5EA", alignSelf: "center", marginVertical: 14 },
  // 채팅 메시지 래퍼
  chatMessagesWrap: { paddingHorizontal: 16, paddingBottom: 8, gap: 20 },
  trendingTitle:   { fontSize: 12, fontWeight: "700", color: CORAL, marginBottom: 10 },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D1D6",
  },
  trendingChipLabel:  { fontSize: 12, color: "#3A3A3C" },
  trendingChipGrowth: { fontSize: 11, color: CORAL, fontWeight: "700" },

  // 큰 입력창 (메인 화면 하단)
  mainInputArea: {
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: Platform.OS === "ios" ? 35 : 30,
    padding: 14,
  },
  mainInput: {
    fontSize: 15,
    color: "#1C1C1E",
    minHeight: 52,
    maxHeight: 120,
  },
  mainInputFooter: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },

  // 보내기 버튼 — 큰 (메인)
  sendBtnLarge:     { backgroundColor: CORAL, borderRadius: 50, width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  sendBtnLargeText: { color: "#fff", fontSize: 16, fontWeight: "700", lineHeight: 18 },

  // 보내기 버튼 — 작은 (채팅 상세)
  sendBtnSmall:     { backgroundColor: CORAL, borderRadius: 50, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  sendBtnSmallText: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 16 },

  // 비활성 공통
  sendBtnOff: { backgroundColor: "#D1D1D6" },

  // ── 채팅 상세 화면 ───────────────────────────────────────────
  chatContent: { padding: 16, paddingBottom: 20, gap: 24 },

  detailInputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 35 : 30,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  detailInput: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1C1C1E",
  },
  chipToggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── 채팅 메시지 ──────────────────────────────────────────────
  userMsgWrap:    { alignItems: "flex-end" },
  userBubble:     { backgroundColor: CORAL, borderRadius: 18, borderBottomRightRadius: 4, paddingVertical: 10, paddingHorizontal: 16, maxWidth: "78%" },
  userBubbleText: { fontSize: 14, color: "#fff", lineHeight: 21 },

  aiMsgWrap:    { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  aiAvatar:     { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center", marginTop: 2 },
  aiAvatarText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  aiBody:       { flex: 1, gap: 8, marginRight: 16 },
  aiBubble:     { backgroundColor: "#F2F2F7", borderRadius: 18, borderBottomLeftRadius: 4, paddingVertical: 10, paddingHorizontal: 14, alignSelf: "flex-start" },
  aiBubbleText: { fontSize: 14, color: "#1C1C1E", lineHeight: 21 },
  stepText:     { fontSize: 13, color: "#636366", marginBottom: 2 },

  dataCard:      { backgroundColor: "#F8F8F8", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 0.5, borderColor: "#E5E5EA" },
  dataCardTitle: { fontSize: 12, fontWeight: "700", color: "#1C1C1E", marginBottom: 10 },

  trendRow:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  trendName:    { fontSize: 12, color: "#1C1C1E", width: 70 },
  trendBarBg:   { flex: 1, height: 5, backgroundColor: "#E5E5EA", borderRadius: 3 },
  trendBarFill: { height: 5, borderRadius: 3 },
  trendGrowth:  { fontSize: 11, fontWeight: "700", width: 38, textAlign: "right" },

  kwHot:         { backgroundColor: "#1C1C1E", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  kwHotText:     { color: "#fff", fontSize: 12, fontWeight: "500" },
  kwNormal:      { backgroundColor: "#fff", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#E5E5EA" },
  kwNormalText:  { color: "#3A3A3C", fontSize: 12 },

  supplierRow:  { flexDirection: "row", alignItems: "center" },
  supplierName: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", marginBottom: 3 },
  supplierMeta: { fontSize: 11, color: "#8E8E93" },

  // 상세정보
  detailRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F2F2F7" },
  detailLabel:      { fontSize: 13, color: "#8E8E93" },
  detailValue:      { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
  fsBadge:          { backgroundColor: CORAL, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
  fsBadgeText:      { fontSize: 13, fontWeight: "700", color: "#fff" },
  ingredientChip:     { backgroundColor: "#E8FAF5", borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: "#B8EBD8" },
  ingredientChipText: { fontSize: 12, color: "#1A8F72", fontWeight: "600" },
  scoreTag:     { backgroundColor: "#FEF0F0", borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7 },
  scoreTagText: { fontSize: 11, fontWeight: "700", color: CORAL },

  actionPrimary:       { flex: 1, backgroundColor: CORAL, borderRadius: 8, paddingVertical: 11, alignItems: "center" },
  actionPrimaryText:   { fontSize: 13, fontWeight: "600", color: "#fff" },
  actionSecondary:     { flex: 1, borderWidth: 1.5, borderColor: "#E5E5EA", borderRadius: 8, paddingVertical: 11, alignItems: "center" },
  actionSecondaryText: { fontSize: 13, color: "#1C1C1E" },
});
