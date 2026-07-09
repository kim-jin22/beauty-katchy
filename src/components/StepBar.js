import { View, Text } from "react-native";
import { Svg, Path } from "react-native-svg";
import { colors } from "../styles";

// ─── 레이아웃 조정 상수 — 숫자를 바꿔서 위치·크기 조정 ───────────
const LAYOUT = {
  wrapPaddingV:      20,  // 스텝바 상하 여백
  wrapPaddingH:      20,  // 외부 컨테이너 좌우 여백

  dotRowPaddingH:    50,  // ← 원(1·2·3) 행 좌우 인셋 (이것만 조정하면 원 위치 변경)
  labelRowPaddingH:  40,  // ← 글자(기본정보 등) 행 좌우 인셋 (이것만 조정하면 글자 위치 변경)

  dotSize:           28,  // 원 지름 (px)
  dotFontSize:       12,  // 원 안 숫자 크기
  dotLabelGap:        8,  // 원 행과 글자 행 사이 간격
  labelFontSize:     11,  // 라벨 글자 크기
  lineMarginH:        6,  // 연결선 좌우 여백
};

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 256 256">
    <Path
      d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z"
      fill="#fff"
    />
  </Svg>
);

const LABELS = ["기본 정보", "성분 입력", "Fit Score"];

// completed=true 이면 모든 단계를 완료(체크) 상태로 표시
export default function StepBar({ current = 1, completed = false }) {
  return (
    <View style={s.wrap}>

      {/* ── 원 + 연결선 행 ──────────────────────────────── */}
      <View style={s.dotRow}>
        {LABELS.map((_, i) => {
          const num    = i + 1;
          const done   = completed || num < current;
          const active = !completed && num === current;
          return [
            /* 원 */
            <View key={`dot-${i}`} style={[s.dot, done ? s.dotDone : active ? s.dotActive : s.dotInactive]}>
              {done
                ? <CheckIcon />
                : <Text style={[s.dotText, active ? s.dotTextLight : s.dotTextGray]}>{String(num)}</Text>
              }
            </View>,
            /* 연결선 (마지막 원 이후엔 없음) */
            i < LABELS.length - 1 && (
              <View key={`line-${i}`} style={[s.line, { backgroundColor: done ? colors.coral : colors.grayLight }]} />
            ),
          ];
        })}
      </View>

      {/* ── 라벨 행 (원 행과 독립적으로 위치 조정) ──────── */}
      <View style={s.labelRow}>
        {LABELS.map((label, i) => {
          const active = !completed && (i + 1) === current;
          return (
            <Text
              key={i}
              style={[
                s.label,
                active && s.labelActive,
                i === 0                  ? { textAlign: "left" }
                : i === LABELS.length - 1 ? { textAlign: "right" }
                : { textAlign: "center" },
              ]}
            >
              {label}
            </Text>
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
  // [STYLE CHANGED: borderBottomWidth 제거 — 스텝바 하단 선 삭제]
  wrap: {
    paddingVertical: LAYOUT.wrapPaddingV,
    paddingHorizontal: LAYOUT.wrapPaddingH,
  },

  // ─── 원 행 ───────────────────────────────────────────
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: LAYOUT.dotRowPaddingH,
  },
  dot: {
    width: LAYOUT.dotSize,
    height: LAYOUT.dotSize,
    borderRadius: LAYOUT.dotSize / 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dotDone:     { backgroundColor: colors.coral },
  dotActive:   { backgroundColor: colors.coral },
  dotInactive: { backgroundColor: colors.grayLight },
  dotText:     { fontSize: LAYOUT.dotFontSize, fontWeight: "700", textAlign: "center", lineHeight: LAYOUT.dotFontSize + 2, includeFontPadding: false },
  dotTextLight: { color: "#fff" },
  dotTextGray:  { color: colors.grayMid },

  line: {
    flex: 1,
    height: 1.5,
    marginHorizontal: LAYOUT.lineMarginH,
    backgroundColor: colors.grayLight,
  },

  // ─── 라벨 행 ─────────────────────────────────────────
  labelRow: {
    flexDirection: "row",
    marginHorizontal: LAYOUT.labelRowPaddingH,
    marginTop: LAYOUT.dotLabelGap,
  },
  label: {
    flex: 1,
    fontSize: LAYOUT.labelFontSize,
    color: colors.grayMid,
    minWidth: 40,
  },
  labelActive: { color: colors.coral, fontWeight: "700" },
};
