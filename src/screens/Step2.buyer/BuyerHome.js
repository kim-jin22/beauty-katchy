import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Animated, Image } from "react-native";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";
import { getProductImage } from "../../data/productImages";

// TODO: [API] GET /api/buyer/:buyerId/recommended
//              → products + fit_scores (fitscore 높은 순) + ingredient_trend (kr_keyword 매칭) + category_detail JOIN 조회
const RECOMMENDED = [
  { brand: "이니스프리", name: "그린티 씨드 세럼 80ml", score: 91, kw: "centella", cat: "세럼", thumb: "INNISFREE" },
  { brand: "코스알엑스", name: "어드밴스드 스네일 96 에센스 100ml", score: 85, kw: "niacinamide", cat: "에센스", thumb: "COSRX" },
];
// TODO: [API] GET /api/buyer/:buyerId/wishlist → saved_prod 테이블 (save_id, product_id, saved_at) + products + fit_scores JOIN 조회
const WISHED = [
  { brand: "닥터지", name: "레드블레미쉬 클리어 크림 70ml", score: 88, thumb: "DR.G" },
  { brand: "토리든", name: "다이브인 히알루론산 세럼 50ml", score: 82, thumb: "TORRIDEN" },
];
// TODO: [API] GET /api/ingredient-trends/keywords → ingredient_trend 테이블 (kr_keyword, us_keyword, us_yoy_pct) — us_yoy_pct 기준 정렬하여 HOT/RISING 분류
const HOT_KW = ["glass skin", "centella", "ceramide"];
const RISING_KW = ["barrier cream", "niacinamide", "SPF50+"];
// TODO: [API] GET /api/buyer/:buyerId/summary
//              → saved_prod COUNT(찜) + sourcing COUNT(매칭 요청, status별) 집계
const SUMMARY = [
  { label: "찜한 상품", val: "12", sub: "+3", color: colors.coral },
  { label: "매칭 요청", val: "4",  sub: "진행 중 2", color: colors.grayMid },
  { label: "거래 성사", val: "1",  sub: "완료", color: colors.mint },
];

export default function BuyerHome({ onTab, onProductDetail, matchingAlert, onTitlePress }) {
  const [refreshing, setRefreshing] = useState(false);

  const anim = useRef(SUMMARY.map(() => ({
    opacity: new Animated.Value(0),
    y: new Animated.Value(20),
  }))).current;

  const numAnim = useRef(SUMMARY.map(() => ({
    opacity: new Animated.Value(0),
    y: new Animated.Value(10),
  }))).current;

  const ALL_KW = [...HOT_KW, ...RISING_KW];
  const kwAnim = useRef(ALL_KW.map(() => ({
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
      const fadeIn  = 200 + Math.random() * 300;
      const hold    = 600 + Math.random() * 1200;
      const fadeOut = 150 + Math.random() * 250;
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
    const t1 = numAnim.map((a) => setTimeout(() => startLoop(a), Math.random() * 1200));
    const t2 = kwAnim.map((a)  => setTimeout(() => startLoop(a), Math.random() * 1500));
    return () => { alive = false; [...t1, ...t2].forEach(clearTimeout); };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    playAnim();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={s.screen}>
      <TopBar title="Beauty Katchy" titleLeft light onNotice={() => onTab?.("마케팅")} onTitlePress={onTitlePress} titleStyle={{ marginTop: 12 }} />


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
              <Text style={s.greetName}>남상윤 <Text style={{ fontWeight: "700" }}>바이어</Text>님</Text>
              <Text style={s.greetSub}>Beauty Katchy for Buyers</Text>
            </View>
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>Buyer</Text>
            </View>
          </View>
        </View>

        {/* 소싱 현황 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>나의 소싱 현황</Text>
          </View>
          <View style={s.summaryGrid}>
            {SUMMARY.map((item, i) => (
              <Animated.View key={i} style={[s.summaryCard, { opacity: anim[i].opacity, transform: [{ translateY: anim[i].y }] }]}>
                <Text style={s.summaryLabel}>{item.label}</Text>
                <Text style={s.summaryVal}>{item.val}</Text>
                {item.sub.startsWith("+") ? (
                  <Animated.View style={{ opacity: numAnim[i].opacity, transform: [{ translateY: numAnim[i].y }] }}>
                    <Text style={[s.summarySub, { color: item.color }]}>{item.sub}</Text>
                  </Animated.View>
                ) : (
                  <Text style={[s.summarySub, { color: item.color }]}>{item.sub}</Text>
                )}
              </Animated.View>
            ))}
          </View>
        </View>

        {/* AI 추천 상품 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>AI 추천 상품</Text>
            <Text style={s.secSub}>Fit Score 기반</Text>
          </View>
          {RECOMMENDED.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[s.recCard, { marginBottom: i < RECOMMENDED.length - 1 ? 10 : 0 }]}
              onPress={() => onProductDetail?.(p)}
              activeOpacity={0.8}
            >
              <View style={s.recInfo}>
                <Text style={s.recBrand}>{p.brand}</Text>
                <Text style={s.recName} numberOfLines={1}>{p.name}</Text>
                <View style={s.recTags}>
                  <View style={s.tagScore}><Text style={s.tagScoreText}>FS {p.score}</Text></View>
                  <View style={s.tagKw}><Text style={s.tagKwText}>{p.kw}</Text></View>
                  <View style={s.tagCat}><Text style={s.tagCatText}>{p.cat}</Text></View>
                </View>
              </View>
              <Text style={s.recArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 급상승 키워드 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>급상승 키워드</Text>
            <Text style={s.secSub}>BERTopic 기반</Text>
          </View>
          <View style={s.kwWrap}>
            {HOT_KW.map((kw, i) => (
              <Animated.View key={kw} style={[s.kwHot, { opacity: kwAnim[i].opacity, transform: [{ translateY: kwAnim[i].y }] }]}>
                <Text style={s.kwHotText}>{kw}</Text>
              </Animated.View>
            ))}
            {RISING_KW.map((kw, i) => (
              <Animated.View key={kw} style={[s.kwRising, { opacity: kwAnim[HOT_KW.length + i].opacity, transform: [{ translateY: kwAnim[HOT_KW.length + i].y }] }]}>
                <Text style={s.kwRisingText}>{kw}</Text>
              </Animated.View>
            ))}
          </View>
          <TouchableOpacity style={s.trendMore} onPress={() => onTab?.("트렌드")}>
            <Text style={s.trendMoreText}>트렌드 더보기 →</Text>
          </TouchableOpacity>
        </View>

        {/* 찜한 상품 */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Text style={s.secLabel}>찜한 상품</Text>
            <Text style={s.secSub}>전체보기</Text>
          </View>
          {WISHED.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[s.wishRow, { borderBottomWidth: i < WISHED.length - 1 ? 0.5 : 0, borderBottomColor: "#F8F8F8" }]}
              onPress={() => onProductDetail?.(p)}
            >
              <View style={s.wishThumb}>
                {getProductImage(p.name) && (
                  <Image source={getProductImage(p.name)} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                )}
              </View>
              <View style={s.wishInfo}>
                <Text style={s.wishBrand}>{p.brand}</Text>
                <Text style={s.wishName} numberOfLines={1}>{p.name}</Text>
              </View>
              <Text style={s.wishScore}>FS {p.score}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar role="buyer" active="홈" onTab={onTab} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  // ─── 전체 화면 ───────────────────────────────────────────
  screen: { flex: 1, backgroundColor: pageBg },

  // ─── 인사 카드 ───────────────────────────────────────────
  // [STYLE CHANGED: roleHeader 제거 → greetCard (ScrollView 내 카드)로 변경]
  greetHi:   { fontSize: 13, color: colors.grayMid, marginBottom: 4 },
  greetName: { fontSize: 20, fontWeight: "500", color: "#1C1C1E", letterSpacing: -0.3, marginBottom: 4 },
  greetSub:  { fontSize: 12, color: colors.grayMid },
  roleBadge: { backgroundColor: "#1C1C1E", borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  roleBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // ─── 매칭 수락 알림 배너 (상단에 뜨는 검정 띠) ──────────
  alertBanner: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  // [STYLE CHANGED: fontSize 20 → 15 — 알림 배너 텍스트 크기 조정]
  alertBannerText: { fontSize: 15, color: "#fff", fontWeight: "600" },

  // ─── 스크롤 영역 (좌우 여백 28) ─────────────────────────
  body: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 26, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 공통: 섹션 블록 / 헤더 / 제목 / 부제목 ─────────────
  secBlock: { paddingVertical: 24, borderTopWidth: 1, borderTopColor: "#EBEBEF" },
  // [STYLE CHANGED: borderBottomColor #D8D8DE → #EBEBEF, secLabel 15 → 18 — 구분선 연하게 + 폰트 키우기]
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#EBEBEF", marginBottom: 20 },
  secLabel: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 12, color: colors.grayMid },

  // ─── 나의 소싱 현황 — 숫자 카드 3개 가로 나열 ───────────
  summaryGrid: { flexDirection: "row", gap: 10 },                     // 카드 3개를 가로로 배치
  summaryCard: { flex: 1, backgroundColor: "#F8F8F8", borderRadius: 12, padding: 14 }, // 카드 한 개
  summaryLabel: { fontSize: 13, color: colors.grayMid, marginBottom: 6 },  // "찜한 상품" 라벨
  summaryVal: { fontSize: 25, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 },  // 큰 숫자
  summarySub: { fontSize: 12, fontWeight: "700" },                    // "+3 이번 주" 작은 설명

  // ─── AI 추천 상품 — 카드 (회색 배경 둥근 박스) ──────────
  recCard: { backgroundColor: "#F8F8F8", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, flexDirection: "row", gap: 10, alignItems: "center" },
  recInfo: { flex: 1 },                                                // 텍스트 영역 (나머지 공간 차지)
  recBrand: { fontSize: 12, color: colors.grayMid, marginBottom: 3 }, // 브랜드명 (이니스프리)
  recName: { fontSize: 15, fontWeight: "500", color: "#1C1C1E", marginBottom: 5 },     // 상품명
  recTags: { flexDirection: "row", gap: 5 },                          // 태그 가로 나열

  // ─── 태그 칩 3종 (FS점수 / 키워드 / 카테고리) ───────────
  tagScore: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#FEF0F0" },
  tagScoreText: { fontSize: 12, fontWeight: "500", color: colors.coral },   // 코랄 — FS 점수
  tagKw: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#E6FAF5" },
  tagKwText: { fontSize: 12, fontWeight: "500", color: "#0A7A5A" },         // 녹색 — 키워드
  tagCat: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 7, backgroundColor: "#F2F2F7" },
  tagCatText: { fontSize: 12, fontWeight: "500", color: colors.grayMid },   // 회색 — 카테고리

  recArrow: { fontSize: 35,  paddingRight: 12, color: "#C7C7CC"},                       // 카드 우측 › 화살표

  // ─── 급상승 키워드 — 칩 목록 ────────────────────────────
  kwWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },         // 칩들 줄바꿈 가로 나열
  kwHot: { backgroundColor: "#1C1C1E", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },   // HOT 키워드 — 검정
  kwHotText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  kwRising: { backgroundColor: "#F8F8F8", borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 }, // RISING 키워드 — 회색
  kwRisingText: { color: "#3A3A3C", fontSize: 12, fontWeight: "500" },
  trendMore: { borderWidth: 1.5, borderColor: "#E5E5EA", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 12 }, // "트렌드 더보기" 버튼
  trendMoreText: { fontSize: 13, fontWeight: "500", color: "#1C1C1E" },

  // ─── 찜한 상품 — 리스트 행 ───────────────────────────────
  wishRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }, // 행 한 줄
  wishThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" }, // 썸네일 박스
  wishInfo: { flex: 1 },                                               // 텍스트 영역
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  wishBrand: { fontSize: 11, color: colors.grayMid, marginBottom: 2 }, // 브랜드명
  wishName: { fontSize: 13, fontWeight: "500", color: "#1C1C1E" },     // 상품명
  wishScore: { fontSize: 11, fontWeight: "700", color: colors.coral },  // 우측 FS 점수
};
