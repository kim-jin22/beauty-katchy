import { View, Text, TouchableOpacity } from "react-native";
import { Svg, Path, Rect, Circle, Line, Polyline } from "react-native-svg";

// ─── FAB 아이콘 — SVG 파일 대신 path 데이터 직접 인라인 사용
// (SVG 파일은 CSS 클래스 기반 스타일이라 react-native-svg에서 정렬 오류 발생)

// 브랜드 FAB: 코랄 테두리 원 + AppleSDGothicNeoR00 폰트 + 기호
const FabProductRegister = () => (
  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", borderWidth: 2, borderColor: "#F05C5C", alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: 25, color: "#F05C5C", fontFamily: "AppleSDGothicNeoR00", lineHeight: 25, includeFontPadding: false, textAlignVertical: "center" }}>+</Text>
  </View>
);

// 바이어 FAB: 검정 원 + 흰색 AI 텍스트
const FabAI = () => (
  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff", letterSpacing: 0.5 }}>AI</Text>
  </View>
);

// 아이콘 컴포넌트
const IconHome = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={active ? "#1C1C1E" : "none"}
      stroke={active ? "none" : "#C7C7CC"}
      strokeWidth="1.8" />
  </Svg>
);

const IconGrid = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#1C1C1E" : "#C7C7CC"} strokeWidth="1.8" strokeLinecap="round">
    <Rect x="3" y="3" width="7" height="7" rx="1" />
    <Rect x="14" y="3" width="7" height="7" rx="1" />
    <Rect x="3" y="14" width="7" height="7" rx="1" />
    <Rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);

const IconSearch = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#1C1C1E" : "#C7C7CC"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

const IconTrend = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#1C1C1E" : "#C7C7CC"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

const IconUser = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#1C1C1E" : "#C7C7CC"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const BRAND_TABS = [
  { key: "홈",      label: "홈",      Icon: IconHome },
  { key: "상품",    label: "상품",    Icon: IconGrid },
  { key: "상품등록", isFab: true },
  { key: "트렌드",  label: "트렌드",  Icon: IconTrend },
  { key: "MY",  label: "MY",  Icon: IconUser },
];

const BUYER_TABS = [
  { key: "홈",     label: "홈",     Icon: IconHome },
  { key: "탐색",   label: "탐색",   Icon: IconSearch },
  { key: "AI",     isAiFab: true },
  { key: "마케팅", label: "마케팅", Icon: IconTrend },
  { key: "MY",     label: "MY",     Icon: IconUser },
];

export default function BottomBar({ role = "brand", active = "홈", onTab, onFab }) {
  const tabs = role === "brand" ? BRAND_TABS : BUYER_TABS;

  return (
    <View style={s.wrap}>
      <View style={s.tabbar}>
        {tabs.map((tab) => {
          const isActive = active === tab.key;

          if (tab.isFab) {
            return (
              <View key={tab.key} style={s.fabWrap}>
                <TouchableOpacity
                  style={s.fabBtn}
                  onPress={() => { onFab?.(); onTab?.(tab.key); }}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FabProductRegister />
                </TouchableOpacity>
              </View>
            );
          }

          if (tab.isAiFab) {
            return (
              <View key={tab.key} style={s.fabWrap}>
                <TouchableOpacity
                  style={s.fabBtn}
                  onPress={() => onTab?.(tab.key)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FabAI />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={s.tabItem}
              onPress={() => onTab?.(tab.key)}
              activeOpacity={0.7}
            >
              <View style={s.tabIcon}>
                <tab.Icon active={isActive} />
              </View>
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────
const s = {
  wrap: { backgroundColor: "#fff" },
  tabbar: {
    borderTopWidth: 1,
    borderTopColor: "#D8D8DE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 28,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 4,
  },
  tabIcon: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 11, fontWeight: "500", color: "#C7C7CC" },
  tabLabelActive: { color: "#1C1C1E", fontWeight: "700" },
  fabWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  // [STYLE CHANGED: fabBtnBrand/fabBtnAi → fabBtn — SVG 아이콘으로 교체, 배경/보더 제거]
  fabBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
};
