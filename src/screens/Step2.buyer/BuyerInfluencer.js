import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import TopBar from "../../components/TopBar";
import BottomBar from "../../components/BottomBar";
import { colors, pageBg } from "../../styles";

const INFLUENCERS = [
  {
    id: 1, name: "marisajmakeup", category: "Suncare", persona: "무백탁 전문", score: 92.4,
    followers: "5만", location: "미국 서부 (LA)", platform: "Instagram",
    image: "https://plus.unsplash.com/premium_photo-1752089322306-3d57928d4e2f?q=80&w=715&auto=format&fit=crop",
    tags: ["#nowhitecast", "#mineralspf"], target_audience: "2030 여성",
    h01_risk: "백탁 현상 해결 (r=-0.71)", h01_unmet: "미국 선케어 불만 1·2위 — 백탁·끈적임",
    keywords: ["White Cast", "Non-greasy", "SPF50+", "Absorb"],
    product_feature: "무기자차/가벼운 제형", content_direction: "백탁 없는 선크림 전문 리뷰 / no white cast 콘텐츠",
    cosine_score: 0.804, market_share: 14.0,
  },
  {
    id: 2, name: "sarahpalmyra", category: "Skincare", persona: "보습데일리", score: 88.0,
    followers: "81만", location: "USA", platform: "Instagram",
    image: "https://images.unsplash.com/photo-1609357912334-e96886c0212b?w=800",
    tags: ["#k-beauty", "#moisturizer"], target_audience: "2040 여성",
    h01_risk: "효능 부족 및 향 자극 해결", h01_unmet: "스킨케어 불만 1·2위 — 효능 부족·향 자극",
    keywords: ["Hydration", "Barrier", "Night Routine", "Glow"],
    product_feature: "나이아신아마이드 배합", content_direction: "보습 크림·데일리 스킨케어 루틴 인플루언서",
    cosine_score: 0.661, market_share: 37.5,
  },
  {
    id: 3, name: "glowwithava", category: "Masks", persona: "트러블케어", score: 85.2,
    followers: "45만", location: "New York", platform: "Instagram",
    image: "https://plus.unsplash.com/premium_photo-1679750866883-b1c549f65da9?q=80&w=687&auto=format&fit=crop",
    tags: ["#sheetmask", "#acnecare"], target_audience: "1020 여성",
    h01_risk: "피부 진정 속도 개선", h01_unmet: "마스크팩 불만 1·2위 — 자극·건조",
    keywords: ["Soothing", "Acne", "Cooling", "Redness"],
    product_feature: "티트리 추출물 함유", content_direction: "여드름·트러블 피부 마스크팩 솔루션 인플루언서",
    cosine_score: 0.690, market_share: 39.1,
  },
  {
    id: 4, name: "dermguru", category: "Cleansing", persona: "메이크업제거", score: 89.8,
    followers: "172.4만", location: "USA", platform: "Instagram",
    image: "https://images.unsplash.com/photo-1581182815808-b6eb627a8798?q=80&w=765&auto=format&fit=crop",
    tags: ["#doublecleanse", "#oilcleanser"], target_audience: "2030 여성",
    h01_risk: "클렌징 효과 불만 해결 (68.9%)", h01_unmet: "클렌징 불만 1위 — 세정력 부족 (68.9%)",
    keywords: ["Double Cleanse", "Pore Care", "Gentle", "Makeup Remove"],
    product_feature: "오일·밤 더블클렌징 제형", content_direction: "클렌징 오일·밤 메이크업 제거 전문 인플루언서",
    cosine_score: 0.898, market_share: 16.9,
  },
  {
    id: 5, name: "glowyamelie", category: "Masks", persona: "보습케어", score: 96.4,
    followers: "20.4만", location: "USA", platform: "Instagram",
    image: "https://plus.unsplash.com/premium_photo-1679046948909-ab47e96082e7?q=80&w=687&auto=format&fit=crop",
    tags: ["#hydration", "#sheetmask"], target_audience: "2030 여성",
    h01_risk: "건조 피부 보습 지속력 개선", h01_unmet: "마스크팩 불만 1·2위 — 자극·건조",
    keywords: ["Hydrating", "Brightening", "Sensitive", "Night Care"],
    product_feature: "히알루론산 고함량 제형", content_direction: "건조 피부 집중 보습 마스크팩 전문 인플루언서",
    cosine_score: 0.964, market_share: 15.5,
  },
];

export default function BuyerInfluencer({ onTab, onTitlePress }) {
  const [selected, setSelected] = useState(null);
  const [matchComplete, setMatchComplete] = useState(false);

  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="인플루언서 페르소나" onHome={onTitlePress} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

        {/* 헤더 배너 */}
        <View style={s.heroBanner}>
          <Text style={s.heroLabel}>EDA 기반 매칭</Text>
          <Text style={s.heroTitle}>추천 인플루언서 페르소나</Text>
          <Text style={s.heroSub}>미국 소비자 리뷰 데이터 기반으로{"\n"}최적 인플루언서를 분석했어요</Text>
        </View>

        {/* 인플루언서 리스트 */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderLabel}>매칭 인플루언서</Text>
            <Text style={s.cardHeaderSub}>{INFLUENCERS.length}명</Text>
          </View>
          {INFLUENCERS.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[s.listItem, i < INFLUENCERS.length - 1 && s.listItemBorder]}
              onPress={() => setSelected(item)}
            >
              <Image source={{ uri: item.image }} style={s.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.itemCategory}>{item.category} · {item.persona}</Text>
                <Text style={s.itemName}>@{item.name}</Text>
                <View style={s.tagRow}>
                  {item.tags.map((tag, ti) => (
                    <Text key={ti} style={s.tagText}>{tag}</Text>
                  ))}
                </View>
              </View>
              <View style={s.scoreBadge}>
                <Text style={s.scoreText}>{item.score}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <BottomBar role="buyer" active="MY" onTab={onTab} />

      {/* 상세 분석 모달 */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
              <Text style={s.closeX}>✕</Text>
            </TouchableOpacity>
            <View style={s.handle} />
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.modalHeader}>EDA 기반 의사결정 리포트</Text>

                <View style={s.profile}>
                  <Image source={{ uri: selected.image }} style={s.profileAvatar} />
                  <View>
                    <Text style={s.profileName}>@{selected.name}</Text>
                    <Text style={s.profileSub}>{selected.location} · {selected.followers} 팔로워</Text>
                  </View>
                </View>

                <View style={s.statRow}>
                  <View style={s.sBox}>
                    <Text style={s.sLab}>매칭 적합도</Text>
                    <Text style={[s.sVal, { color: colors.coral }]}>{selected.score}%</Text>
                  </View>
                  <View style={[s.sBox, { flex: 1.5 }]}>
                    <Text style={s.sLab}>주 타겟</Text>
                    <Text style={s.sVal}>{selected.target_audience}</Text>
                  </View>
                </View>

                <View style={s.channelRow}>
                  <Text style={s.channelLabel}>채널</Text>
                  <Text style={s.platformText}>{selected.platform}</Text>
                </View>

                <View style={s.evidenceSection}>
                  <Text style={s.sectionTitle}>핵심 매칭 키워드 (리뷰 분석)</Text>
                  <View style={s.keywordContainer}>
                    {selected.keywords.map((kw, idx) => (
                      <View key={idx} style={s.kwBadge}>
                        <Text style={s.kwText}>#{kw}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={s.evidenceSection}>
                  <Text style={s.sectionTitle}>분석 인사이트 근거</Text>
                  <View style={s.evidenceItem}>
                    <View style={[s.badgeLabel, { backgroundColor: colors.coral }]}>
                      <Text style={s.badgeText}>H01</Text>
                    </View>
                    <View style={s.evidenceContent}>
                      <Text style={s.evidenceLabel}>해결 리스크 (EDA)</Text>
                      <Text style={s.evidenceValue}>{selected.h01_risk}</Text>
                    </View>
                  </View>

                  <View style={s.shareBanner}>
                    <Text style={s.corePersonaLabel}>CORE PERSONA</Text>
                    <View style={s.shareDividerRow}>
                      <Text style={s.sharePersonaName}>{selected.persona}</Text>
                      <View style={s.shareVerticalDivider} />
                      <View style={s.shareRightBlock}>
                        <Text style={s.shareRightLabel}>시장 수요</Text>
                        <Text style={s.sharePercent}>{selected.market_share}%</Text>
                      </View>
                    </View>
                  </View>

                  <View style={s.mBox}>
                    <View style={s.ragHeader}>
                      <Text style={s.sparkle}>✦</Text>
                      <Text style={s.mTxtTitle}>AI 분석 추천 메시지</Text>
                    </View>
                    <Text style={s.mTxt}>
                      {"미국 소비자 리뷰 데이터 기반 의미적 매칭 유사도 "}
                      <Text style={s.mTxtCoralBold}>{selected.cosine_score}</Text>
                      {"로 검증 임계치(0.6)를 통과한 인플루언서입니다.\n\n"}
                      <Text style={s.mTxtBold}>'{selected.h01_unmet}'</Text>
                      {" 리스크를 해결하는 콘텐츠 방향과 정확히 일치하며, "}
                      <Text style={s.mTxtBold}>'{selected.persona}'</Text>
                      {" 페르소나는 카테고리 시장 수요의 "}
                      <Text style={s.mTxtCoralBold}>{selected.market_share}%</Text>
                      {"를 점유합니다.\n\n귀하 제품의 "}
                      <Text style={s.mTxtBold}>'{selected.product_feature}'</Text>
                      {" 속성은 "}
                      <Text style={s.mTxtBold}>{selected.target_audience}</Text>
                      {" 팔로워의 핵심 니즈와 직결되어 실제 구매 전환으로 이어질 가능성이 높습니다.\n\n콘텐츠 방향: "}
                      <Text style={s.mTxtBold}>{selected.content_direction}</Text>
                    </Text>
                  </View>
                </View>

                <View style={s.modalActionRow}>
                  <TouchableOpacity
                    style={s.matchBtn}
                    onPress={() => { setSelected(null); setTimeout(() => setMatchComplete(true), 300); }}
                  >
                    <Text style={s.matchBtnText}>매칭하기</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 매칭 완료 알림 */}
      <Modal visible={matchComplete} transparent animationType="fade">
        <View style={s.alertOverlay}>
          <View style={s.letterBox}>
            <View style={s.letterContent}>
              <Image source={{ uri: INFLUENCERS[0].image }} style={s.letterAvatar} />
              <Text style={s.letterTitle}>매칭이 완료되었습니다!</Text>
              <Text style={s.letterSub}>인플루언서님께 제안서가 안전하게 발송되었습니다.</Text>
              <View style={s.letterBtns}>
                <TouchableOpacity style={s.moreBtn} onPress={() => setMatchComplete(false)}>
                  <Text style={s.moreBtnText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.supportBtn} onPress={() => setMatchComplete(false)}>
                  <Text style={s.supportBtnText}>마케팅 지원받기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = {
  screen: { flex: 1, backgroundColor: pageBg },

  // ─── 헤더 배너 ───────────────────────────────────────────
  heroBanner: { backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 12, paddingHorizontal: 20, paddingVertical: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  heroLabel: { fontSize: 11, fontWeight: "600", color: colors.coral, letterSpacing: 1.2, marginBottom: 6 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: colors.black, marginBottom: 6 },
  heroSub: { fontSize: 13, fontWeight: "500", color: colors.grayMid, lineHeight: 20 },

  // ─── 카드 ─────────────────────────────────────────────────
  card: { backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.grayBg, marginBottom: 4 },
  cardHeaderLabel: { fontSize: 15, fontWeight: "600", color: colors.black },
  cardHeaderSub: { fontSize: 12, fontWeight: "500", color: colors.grayMid },

  // ─── 리스트 아이템 ───────────────────────────────────────
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.grayBg },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.graySurface },
  itemCategory: { fontSize: 11, fontWeight: "600", color: colors.coral, marginBottom: 2 },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.black, marginBottom: 4 },
  tagRow: { flexDirection: "row", gap: 6 },
  tagText: { fontSize: 11, fontWeight: "500", color: colors.grayMid },
  scoreBadge: { backgroundColor: colors.coralBg, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  scoreText: { fontSize: 13, fontWeight: "700", color: colors.coral },

  // ─── 상세 모달 ───────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "90%" },
  closeBtn: { position: "absolute", top: 20, right: 24, zIndex: 10 },
  closeX: { fontSize: 20, color: colors.grayMid },
  handle: { width: 36, height: 4, backgroundColor: colors.grayLight, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalHeader: { textAlign: "center", fontSize: 11, fontWeight: "600", color: colors.grayMid, marginBottom: 20, letterSpacing: 1 },
  profile: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14, backgroundColor: colors.graySurface },
  profileName: { fontSize: 17, fontWeight: "700", color: colors.black },
  profileSub: { fontSize: 13, fontWeight: "500", color: colors.grayMid, marginTop: 2 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  sBox: { flex: 1, backgroundColor: colors.graySurface, padding: 12, borderRadius: 10, alignItems: "center" },
  sLab: { fontSize: 11, fontWeight: "500", color: colors.grayMid, marginBottom: 4 },
  sVal: { fontSize: 18, fontWeight: "700", color: colors.black },
  channelRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  channelLabel: { fontSize: 14, fontWeight: "600", color: colors.black, borderLeftWidth: 3, borderLeftColor: colors.coral, paddingLeft: 10, marginRight: 12 },
  platformText: { fontSize: 14, fontWeight: "500", color: colors.black },
  evidenceSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.black, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.coral, paddingLeft: 10 },
  keywordContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kwBadge: { backgroundColor: colors.graySurface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: colors.grayLight },
  kwText: { fontSize: 12, fontWeight: "600", color: colors.black },
  evidenceItem: { flexDirection: "row", marginBottom: 14 },
  badgeLabel: { paddingHorizontal: 7, height: 20, borderRadius: 4, marginTop: 2, justifyContent: "center" },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
  evidenceContent: { marginLeft: 10, flex: 1 },
  evidenceLabel: { fontSize: 12, fontWeight: "500", color: colors.grayMid, marginBottom: 2 },
  evidenceValue: { fontSize: 14, fontWeight: "600", color: colors.black },
  shareBanner: { backgroundColor: colors.black, padding: 14, borderRadius: 10, marginBottom: 14 },
  corePersonaLabel: { fontSize: 9, fontWeight: "700", color: colors.coral, letterSpacing: 1.5, marginBottom: 8 },
  shareDividerRow: { flexDirection: "row", alignItems: "center" },
  sharePersonaName: { fontSize: 18, fontWeight: "700", color: colors.white, flex: 1 },
  shareVerticalDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 14 },
  shareRightBlock: { alignItems: "flex-end" },
  shareRightLabel: { fontSize: 10, fontWeight: "500", color: "rgba(255,255,255,0.5)", marginBottom: 3 },
  sharePercent: { fontSize: 20, fontWeight: "700", color: colors.white },
  mBox: { backgroundColor: colors.graySurface, padding: 16, borderRadius: 10 },
  ragHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sparkle: { fontSize: 13, color: colors.coral },
  mTxtTitle: { fontSize: 14, fontWeight: "700", color: colors.coral, marginLeft: 5 },
  mTxt: { fontSize: 14, fontWeight: "500", color: colors.black, lineHeight: 22 },
  mTxtCoralBold: { fontSize: 14, fontWeight: "700", color: colors.coral },
  mTxtBold: { fontSize: 14, fontWeight: "700", color: colors.black },
  modalActionRow: { paddingBottom: 10, marginTop: 16 },
  matchBtn: { backgroundColor: colors.black, borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  matchBtnText: { fontSize: 15, fontWeight: "500", color: colors.white },

  // ─── 매칭 완료 알림 ──────────────────────────────────────
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 28 },
  letterBox: { width: "100%", backgroundColor: colors.white, borderRadius: 16, overflow: "hidden" },
  letterContent: { padding: 28, alignItems: "center" },
  letterAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 16, backgroundColor: colors.graySurface },
  letterTitle: { fontSize: 18, fontWeight: "700", color: colors.black, marginBottom: 8 },
  letterSub: { fontSize: 14, fontWeight: "500", color: colors.grayMid, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  letterBtns: { flexDirection: "row", width: "100%", gap: 8 },
  moreBtn: { flex: 1, backgroundColor: colors.grayLight, borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  moreBtnText: { fontSize: 15, fontWeight: "500", color: colors.black },
  supportBtn: { flex: 1.8, backgroundColor: colors.coral, borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  supportBtnText: { fontSize: 15, fontWeight: "500", color: colors.white },
};
