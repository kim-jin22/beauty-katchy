import { View, Text, TouchableOpacity } from "react-native";
import { Svg, Rect, Path, Circle } from "react-native-svg";

// light=true → 흰 배경·검정 글씨 (서브 화면용)
// light=false (기본) → 검정 배경·흰 글씨 (메인 탭용)
// titleLeft=true → 타이틀 왼쪽 정렬·작은 폰트 (메인 홈용)
// bgColor → 배경색 직접 지정 시 light 설정 무시 (예: bgColor={colors.coral})
export default function TopBar({ title = "Beauty Katchy", onNotice, onBack, onHome, onTitlePress, titleLeft = false, light = false, bgColor, titleStyle }) {
  const bg      = bgColor ?? (light ? "#fff" : "#1C1C1E");
  const fg      = bgColor ? "#fff" : light ? "#1C1C1E" : "#fff";
  const border  = bgColor ? "transparent" : titleLeft ? "#D8D8DE" : light ? "#D8D8DE" : "rgba(255,255,255,0.08)";

  return (
    // [STYLE CHANGED: paddingTop 6 추가 — 상단 여백 확보]
    <View style={{ backgroundColor: bg, paddingTop: 6 }}>
      {/* 네비바 */}
      <View style={[s.navbar, { backgroundColor: bg, borderBottomColor: border }]}>
        {/* 뒤로가기 / 홈 — 왼쪽 (titleLeft 모드에서는 숨김) */}
        {/* [STYLE CHANGED: onHome 아이콘 navRight → navLeft로 이동] */}
        {!titleLeft && (
          <View style={s.navLeft}>
            {onBack && (
              <TouchableOpacity style={s.navBtn} onPress={onBack}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path
                    d="M15 18 9 12 15 6"
                    stroke={fg}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </TouchableOpacity>
            )}
            {onHome !== undefined && !onBack && (
              <TouchableOpacity style={s.navBtn} onPress={onHome}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M9 22V12h6v10" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        )}

        {onTitlePress ? (
          <TouchableOpacity onPress={onTitlePress} activeOpacity={0.7} style={{ flex: 1 }}>
            <Text style={[s.navTitle, { color: fg }, titleLeft && { textAlign: "left", fontSize: 19, fontWeight: "700", paddingLeft: 14, letterSpacing: -0.5 }, titleStyle]}>{title}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[s.navTitle, { color: fg }, titleLeft && { textAlign: "left", fontSize: 19, fontWeight: "700", paddingLeft: 14, letterSpacing: -0.5 }, titleStyle]}>{title}</Text>
        )}

        {/* 오른쪽 — 알림(메인 탭용) */}
        <View style={s.navRight}>
          {onNotice !== undefined && (
            <TouchableOpacity style={s.navBtn} onPress={onNotice}>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          )}
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

  // ─── 네비바 (뒤로가기 + 타이틀 + 알림) ──────────────────
  navbar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
  },
  navLeft:  { width: 44, alignItems: "flex-start",  justifyContent: "center" }, // 뒤로가기 버튼 영역
  navRight: { width: 44, alignItems: "flex-end",    justifyContent: "center" }, // 알림 버튼 영역
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  navBtn: {                                                       // 뒤로가기·알림 아이콘 공용 터치 영역
    // [STYLE CHANGED: 36×36 → 44×44 — iOS 최소 터치 영역 44pt 준수]
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
};
