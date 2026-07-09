// ┌─────────────────────────────────────────────────────────────┐
// │           ⛔  DESIGN SYSTEM — DO NOT MODIFY  ⛔            │
// │  이 파일은 디자인 전담 작업 파일입니다.                        │
// │  기능 연결 작업 시 절대 수정하지 마세요.                       │
// │  수정이 꼭 필요한 경우 반드시 주석으로 변경 내역 기록 요망      │     
// └─────────────────────────────────────────────────────────────┘
// BeautyBridge Design System — React Native 버전
// 8pt 그리드 / Pretendard / 2025

// ─── 색상 팔레트 ─────────────────────────────────────────────
// 페이지 연한 배경색
export const pageBg = "#F2F2F8";

export const colors = {
  coral:        "#F05C5C",          // 메인 포인트 색 (버튼, 배지, 그래프)
  coralDark:    "#b13737",          // 버튼 눌림 상태 (Pressed)
  coralBg:      "rgba(240,92,92,0.10)", // 코랄 연한 배경
  black:        "#1C1C1E",          // 메인 텍스트, 검정 배경
  grayMid:      "#848488",          // 보조 텍스트, 비활성 라벨
  grayLight:    "#E5E5EA",          // 버튼·칩·입력 테두리 (원래값 유지)
  // [STYLE CHANGED: #D8D8DE → #EBEBEF — 구분선 연하게]
  grayBg:       "#EBEBEF",          // 섹션 구분선 전용
  graySurface:  "#F8F8F8",          // 카드 배경, 입력 영역
  white:        "#FFFFFF",
  mint:         "#2EC4A0",          // 성공·완료 상태 (거래 성사 등)
  mintDark:     "#0a4b38",          // 민트 텍스트
  mintBg:       "rgba(46,196,160,0.10)",
  yellow:       "#FAAD14",          // 경고 상태
  yellowDark:   "#7C5500",
  yellowBg:     "rgba(250,173,20,0.10)",
  yellowBorder: "#FFE58F",
};

// ─── 간격 토큰 ───────────────────────────────────────────────
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  pageH: 24,                        // 페이지 좌우 기본 여백
};

// ─── 공통 화면 스타일 (브랜드 등록 플로우 Step1~3 공용) ──────
export const common = {
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  sb: {                             // 상태바 (현재 미사용)
    backgroundColor: colors.black,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  sbText: { fontSize: 12, color: colors.white, fontWeight: "500" },
  header: {                         // 페이지 헤더 영역 (현재 미사용)
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBg,
  },
  brandLabel: {
    fontSize: 11,
    color: colors.grayMid,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "500",
    color: colors.black,
    letterSpacing: -0.5,
  },
  backBtn: {                        // 뒤로가기 버튼 (현재 TopBar 컴포넌트로 대체)
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.graySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 18, color: colors.black },

  // ─── 스크롤 본문 영역 ──────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: 28,          // 좌우 여백 28px
    paddingTop: 20,                 // [STYLE CHANGED: 상단 여백 추가]
  },

  // ─── 섹션 블록 (구분선 + 내부 여백) ────────────────────
  secBlock: {
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: colors.grayBg,
  },
  secHeader: {                      // 섹션 제목 하단 구분선 영역
    // [STYLE CHANGED: flexDirection row 추가 — 제목/초기화 버튼 좌우 배치]
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBg,
    marginBottom: 20,
  },
  secLabel: {                       // 섹션 제목 (대문자 소형)
    // [STYLE CHANGED: fontSize 12→15, fontWeight 700→600, color grayMid→black]
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // ─── 입력 필드 ─────────────────────────────────────────
  field: { marginBottom: 24 },
  fieldLabel: {                     // 필드 위 라벨 (상품명, 브랜드명 등)
    // [STYLE CHANGED: fontSize 12→11→13 — 라벨 크기 확대]
    fontSize: 13,
    fontWeight: "500",
    color: colors.grayMid,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  required: { color: colors.coral }, // * 필수 표시
  textInput: {                      // 하단 선만 있는 텍스트 입력
    borderBottomWidth: 1.5,
    borderBottomColor: colors.grayLight,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 15,
    fontWeight: "500",
    color: colors.black,
    backgroundColor: "transparent",
  },
  hint: { fontSize: 11, color: colors.grayMid, marginTop: 6 }, // 입력 하단 안내 텍스트

  // ─── 선택 칩 (카테고리·소분류 버튼) ────────────────────
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {                           // 비선택 칩
    backgroundColor: colors.white,
    // [STYLE CHANGED: borderWidth 1.5 → 1 — 테두리 두께 감소]
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: { fontSize: 14, fontWeight: "500", color: colors.grayMid },
  chipOn: {                         // 선택된 칩 — 코랄 테두리 (브랜드 등록 전용)
    backgroundColor: colors.white,
    // [STYLE CHANGED: borderWidth 1.5 → 1 — 테두리 두께 감소]
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  chipOnText: { fontSize: 14, fontWeight: "600", color: colors.coral },

  // ─── 하단 버튼 바 ──────────────────────────────────────
  bottomBar: {
    paddingTop: 14,
    paddingBottom: 24,
    // [STYLE CHANGED: paddingHorizontal 28 → 20 — 버튼 좌우 여백 축소]
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: colors.grayBg,
  },
  btnPrimary: {                     // 코랄 채우기 버튼 (주요 액션)
    backgroundColor: colors.coral,
    borderRadius: 6,
    paddingVertical: 17,
    alignItems: "center",
  },
  btnPrimaryText: { fontSize: 15, fontWeight: "500", color: colors.white },
  btnDefault: {                     // 테두리 버튼 (보조 액션)
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    paddingVertical: 17,
    alignItems: "center",
  },
  btnDefaultText: { fontSize: 15, fontWeight: "500", color: colors.black },
};
