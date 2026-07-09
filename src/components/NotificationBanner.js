import { useEffect, useRef, useState } from "react";
import { Animated, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Svg, Path, Circle } from "react-native-svg";
import { colors } from "../styles";

export default function NotificationBanner({ visible, onDismiss, onPress }) {
  const [active, setActive] = useState(false);
  const translateY = useRef(new Animated.Value(-180)).current;
  const timerRef  = useRef(null);

  useEffect(() => {
    if (visible) {
      setActive(true);
      translateY.setValue(-180);
      Animated.spring(translateY, {
        toValue: 0,
        tension: 90,
        friction: 13,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(slideOut, 4500);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible]);

  const slideOut = () => {
    clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: -180,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      setActive(false);
      onDismiss?.();
    });
  };

  const handlePress = () => {
    slideOut();
    onPress?.();
  };

  if (!active) return null;

  return (
    <Animated.View style={[s.wrapper, { transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
        <View style={s.card}>

          {/* 헤더: 앱 아이콘 + 이름 + 시간 */}
          <View style={s.header}>
            <View style={s.appIcon}>
              <Image source={require("../../assets/images/logo/logo_icon_w.png")} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
            </View>
            <Text style={s.appName}>Beauty Katchy</Text>
            <Text style={s.time}>지금</Text>
          </View>

          {/* 알림 내용 */}
          <View style={s.body}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>매칭 완료 🎉</Text>
              <Text style={s.message}>바이어가 상품 매칭을 완료했어요.{"\n"}마케팅 탭에서 확인하세요.</Text>
            </View>
            {/* 우측 알림 아이콘 */}
            <View style={s.iconWrap}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke={colors.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
                <Path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke={colors.coral} strokeWidth="1.8" strokeLinecap="round"
                />
                <Circle cx="18" cy="5" r="4" fill={colors.coral} />
              </Svg>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 12,
    left: 10,
    right: 10,
    zIndex: 9999,
  },
  card: {
    backgroundColor: "rgba(242,242,247,0.97)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },

  // ── 헤더 ─────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  appIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appIconText: { fontSize: 7, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
  appName:    { flex: 1, fontSize: 12, fontWeight: "600", color: "#848488" },
  time:       { fontSize: 12, color: "#848488" },

  // ── 본문 ─────────────────────────────────────────────────
  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title:   { fontSize: 14, fontWeight: "700", color: "#1C1C1E", marginBottom: 3 },
  message: { fontSize: 13, color: "#3A3A3C", lineHeight: 19 },

  // ── 우측 아이콘 ─────────────────────────────────────────
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.coralBg,
    alignItems: "center",
    justifyContent: "center",
  },
});
