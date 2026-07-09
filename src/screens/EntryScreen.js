import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../styles";

export default function EntryScreen({ onBrand, onBuyer }) {
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* 상단 여백 — 세로 중앙 정렬용 */}
        <View style={{ flex: 1 }} />

        {/* 로고 + 카드 그룹 */}
        <View>
          <View style={s.logoWrap}>
            <Image
              source={require("../../assets/images/logo/BK_W.png")}
              style={s.logoImg}
              resizeMode="contain"
            />
            <Text style={s.logoTitle}>
              K-뷰티, 세계로 연결 하다
            </Text>
            <Text style={s.logoSub}>
              브랜드사와 글로벌 바이어를{"\n"}데이터로 이어드려요
            </Text>
          </View>

          {/* 역할 선택 카드 */}
          <View style={s.cardsWrap}>
            {/* 브랜드사 */}
            <TouchableOpacity style={[s.roleCard, s.cardBrand]} onPress={onBrand} activeOpacity={0.85}>
              <View style={s.cardAccentBrand} pointerEvents="none" />
              <View style={[s.cardArrow, s.arrowBrand]}>
                <Text style={{ color: "#fff", fontSize: 14 }}>→</Text>
              </View>
              <Text style={[s.cardTag, { color: "rgba(255,255,255,0.65)" }]}>Brand</Text>
              <Text style={[s.cardTitle, { color: "#fff" }]}>
                브랜드사로{"\n"}시작하기
              </Text>
              <Text style={[s.cardDesc, { color: "rgba(255,255,255,0.65)" }]}>
                상품을 등록하고{"\n"}Fit Score로 미국 시장 적합도를 확인하세요
              </Text>
            </TouchableOpacity>

            {/* 바이어 */}
            <TouchableOpacity style={[s.roleCard, s.cardBuyer]} onPress={onBuyer} activeOpacity={0.85}>
              <View style={s.cardAccentBuyer} pointerEvents="none" />
              <View style={[s.cardArrow, s.arrowBuyer]}>
                <Text style={{ color: "#fff", fontSize: 14 }}>→</Text>
              </View>
              <Text style={[s.cardTag, { color: "rgba(255,255,255,0.5)" }]}>Buyer</Text>
              <Text style={[s.cardTitle, { color: "#fff" }]}>
                바이어로{"\n"}시작하기
              </Text>
              <Text style={[s.cardDesc, { color: "rgba(255,255,255,0.55)" }]}>
                K-뷰티 상품을 탐색하고{"\n"}트렌드 데이터 기반으로 소싱하세요
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 여백 — 세로 중앙 정렬용 */}
        <View style={{ flex: 1 }} />

        {/* 하단 */}
        <View style={s.bottomInfo}>
          <Text style={s.bottomText}>
            이미 계정이 있으신가요?{" "}
            <Text style={{ color: colors.black, fontWeight: "500" }}>로그인</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: "#fff" },
  sb: {
    backgroundColor: "#fff",
    height: 52,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sbTime: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  sbIcons: { flexDirection: "row", alignItems: "center", gap: 6 },
  scroll: { flexGrow: 1 },
  logoWrap: { paddingTop: 20, paddingHorizontal: 28, paddingBottom: 20, alignItems: "center" },
  logoImg: { width: 160, height: 130 },
  logoTag: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.grayMid,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: -1,
    marginBottom: 6,
    lineHeight: 30,
    textAlign: "center",
  },
  logoSub: {
    fontSize: 13,
    color: colors.grayMid,
    lineHeight: 19,
    textAlign: "center",
  },
  cardsWrap: { paddingHorizontal: 20, gap: 10, marginTop: 16 },
  roleCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  cardBrand: { backgroundColor: colors.coral },
  cardBuyer: { backgroundColor: colors.black, borderColor: "transparent" },
  cardAccentBrand: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    opacity: 0.06,
  },
  cardAccentBuyer: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    opacity: 0.08,
  },
  cardArrow: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBrand: { backgroundColor: "rgba(255,255,255,0.1)" },
  arrowBuyer: { backgroundColor: "rgba(255,255,255,0.1)" },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    lineHeight: 26,
  },
  cardDesc: { fontSize: 12, lineHeight: 18 },
  bottomInfo: { paddingVertical: 28, paddingHorizontal: 28, alignItems: "center" },
  bottomText: { fontSize: 12, color: "#C7C7CC", lineHeight: 20 },
};
