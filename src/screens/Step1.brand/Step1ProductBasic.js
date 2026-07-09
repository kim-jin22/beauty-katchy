import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Modal, Animated, Keyboard } from "react-native";
import TopBar from "../../components/TopBar";
import StepBar from "../../components/StepBar";
import { common, colors, pageBg } from "../../styles";

// TODO: [API] GET /api/categories → category_main 테이블 (category_main_id, name_kr) 에서 대분류 목록 조회
const CATEGORIES = ["스킨케어", "선케어", "클렌징", "마스크팩"];
// TODO: [API] GET /api/suncare/spf-options → suncare 테이블 (sun_id, max_concen) 에서 SPF 허용 수치 조회
const SPF_OPTIONS = ["15", "30", "50", "50+"];

// TODO: [API] GET /api/categories/:mainId/subs → category_sub (category_sub_id, name_kr) + category_detail (category_detail_id, name_kr) 연계 조회
const SUB_CATEGORIES = {
  스킨케어: ["스킨", "토너", "패드", "에센스", "세럼", "앰플", "스팟케어", "로션", "에멀젼", "크림", "올인원", "오일", "슬리핑팩", "젤", "밤/멀티밤", "아이크림", "미스트", "페이스에센스"],
  선케어:   ["선크림", "선스프레이", "선로션", "선스틱"],
  클렌징:   ["클렌징폼", "클렌징젤", "클렌징비누", "클렌징파우더", "클렌징오일", "클렌징워터", "클렌징밤", "클렌징밀크", "클렌징크림", "클렌징로션", "클렌징티슈", "클렌징패드", "필링/스크럽", "스크럽/필링패드", "립&아이리무버"],
  마스크팩: ["시트마스크", "워시오프팩", "필오프팩", "모델링/고무팩", "패치", "부분마스크/팩"],
};

const DEFAULT_FORM = {
  productName: "",
  brandName: "",
  category: "",
  subCategory: "",
  spf: "",
  price: "",
  volume: "",
};

// ─── 바텀시트 컴포넌트 ────────────────────────────────────────
function BottomSheet({ visible, title, items, selected, onSelect, onClose }) {
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 500,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={bs.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[bs.sheet, { transform: [{ translateY }] }]}>
          <View style={bs.handle} />
          <Text style={bs.title}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={bs.list}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={[bs.item, selected === item && bs.itemActive]}
                onPress={() => { onSelect(item); onClose(); }}
                activeOpacity={0.7}
              >
                <Text style={[bs.itemText, selected === item && bs.itemTextActive]}>{item}</Text>
                {selected === item && <Text style={bs.check}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function Step1ProductBasic({ onNext, onBack, initialForm, onFormChange }) {
  const [form, setForm] = useState(initialForm ?? DEFAULT_FORM);
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [showSubSheet, setShowSubSheet] = useState(false);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    onFormChange?.(DEFAULT_FORM);
  };

  const set = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    onFormChange?.(next);
  };

  const handleCategoryChange = (cat) => {
    const next = { ...form, category: cat, subCategory: "", spf: "" };
    setForm(next);
    onFormChange?.(next);
  };

  const isSuncare = form.category === "선케어";
  const canNext =
    form.productName.trim() &&
    form.brandName.trim() &&
    form.subCategory &&
    form.price.trim() &&
    (!isSuncare || form.spf);

  return (
    <KeyboardAvoidingView style={[common.screen, { backgroundColor: pageBg }]} behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 35}>
      <TopBar light titleLeft={false} title="상품 등록" onBack={onBack} />
      <StepBar current={1} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 상품 기본 정보 카드 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>상품 기본 정보</Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={{ fontSize: 13, color: colors.grayMid, textDecorationLine: "underline" }}>초기화</Text>
            </TouchableOpacity>
          </View>

          <View style={common.field}>
            <Text style={common.fieldLabel}>
              상품명 <Text style={common.required}>*</Text>
            </Text>
            <TextInput
              style={[common.textInput, { borderBottomColor: form.productName ? colors.black : colors.grayLight }]}
              placeholder="예: 닥터지 레드블레미쉬 클리어 수딩 크림"
              placeholderTextColor={colors.grayLight}
              value={form.productName}
              onChangeText={(v) => set("productName", v)}
            />
          </View>

          <View style={common.field}>
            <Text style={common.fieldLabel}>
              브랜드명 <Text style={common.required}>*</Text>
            </Text>
            <TextInput
              style={[common.textInput, {
                borderBottomColor: form.brandName ? colors.black : colors.grayLight,
              }]}
              placeholder="예: 이니스프리"
              placeholderTextColor={colors.grayLight}
              value={form.brandName}
              onChangeText={(v) => set("brandName", v)}
            />
          </View>

          <View style={common.field}>
            <Text style={common.fieldLabel}>
              대분류 <Text style={common.required}>*</Text>
            </Text>
            <TouchableOpacity style={s.selector} onPress={() => { Keyboard.dismiss(); setShowCatSheet(true); }}>
              <Text style={form.category ? s.selectorVal : s.selectorPlaceholder}>
                {form.category || "카테고리 선택"}
              </Text>
              <Text style={s.selectorArrow}>▾</Text>
            </TouchableOpacity>
          </View>

          <View style={isSuncare ? common.field : [common.field, { marginBottom: 0 }]}>
            <Text style={common.fieldLabel}>
              소분류 <Text style={common.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[s.selector, !form.category && s.selectorDisabled]}
              onPress={() => { if (form.category) { Keyboard.dismiss(); setShowSubSheet(true); } }}
            >
              <Text style={form.subCategory ? s.selectorVal : s.selectorPlaceholder}>
                {form.subCategory || (form.category ? "소분류 선택" : "대분류를 먼저 선택하세요")}
              </Text>
              {form.category && <Text style={s.selectorArrow}>▾</Text>}
            </TouchableOpacity>
          </View>

          {/* SPF 지수 — 선케어 선택 시만 표시 */}
          {isSuncare && (
            <View style={[common.field, { marginBottom: 0 }]}>
              <Text style={common.fieldLabel}>
                SPF 지수 <Text style={common.required}>*</Text>
              </Text>
              <View style={common.chips}>
                {SPF_OPTIONS.map((spf) => (
                  <TouchableOpacity
                    key={spf}
                    style={form.spf === spf ? common.chipOn : common.chip}
                    onPress={() => set("spf", spf)}
                  >
                    <Text style={form.spf === spf ? common.chipOnText : common.chipText}>
                      SPF {spf}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 가격 및 용량 카드 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>가격 및 용량</Text>
          </View>

          <View style={common.field}>
            <Text style={common.fieldLabel}>
              공급가 (USD) <Text style={common.required}>*</Text>
            </Text>
            <TextInput
              style={common.textInput}
              placeholder="$ 0.00"
              placeholderTextColor={colors.grayLight}
              keyboardType="decimal-pad"
              value={form.price}
              onChangeText={(v) => set("price", v)}
            />
          </View>

          <View style={[common.field, { marginBottom: 0 }]}>
            <Text style={common.fieldLabel}>용량</Text>
            <TextInput
              style={common.textInput}
              placeholder="예: 50ml, 100g"
              placeholderTextColor={colors.grayLight}
              value={form.volume}
              onChangeText={(v) => set("volume", v)}
            />
          </View>
        </View>

      </ScrollView>

      {/* 다음 버튼 — ScrollView 밖, KAV 안 → 키보드 바로 위에 위치 */}
      <View style={common.bottomBar}>
        <Pressable
          style={({ pressed }) => [s.ctaBtn, canNext ? s.ctaActive : s.ctaInactive, pressed && canNext && s.ctaPressed]}
          onPress={canNext ? onNext : undefined}
        >
          <Text style={[s.ctaText, canNext ? s.ctaTextActive : s.ctaTextInactive]}>다음</Text>
        </Pressable>
      </View>

      <BottomSheet
        visible={showCatSheet}
        title="대분류 선택"
        items={CATEGORIES}
        selected={form.category}
        onSelect={handleCategoryChange}
        onClose={() => setShowCatSheet(false)}
      />
      <BottomSheet
        visible={showSubSheet}
        title="소분류 선택"
        items={SUB_CATEGORIES[form.category] ?? []}
        selected={form.subCategory}
        onSelect={(sub) => set("subCategory", sub)}
        onClose={() => setShowSubSheet(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────

// ─── 바텀시트 스타일 ───────────────────────────────────────────
const bs = {
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 24,
    maxHeight: "70%",
  },
  handle: { width: 36, height: 4, backgroundColor: "#D1D1D6", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", marginBottom: 12 },
  list: { flexGrow: 0 },
  item: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: "#EBEBEF",
  },
  itemActive: { backgroundColor: "transparent" },
  itemText: { fontSize: 16, color: "#1C1C1E" },
  itemTextActive: { color: "#F05C5C", fontWeight: "600" },
  check: { fontSize: 16, color: "#F05C5C", fontWeight: "700" },
};

const s = {
  // ─── 공통 카드 ────────────────────────────────────────────
  // [STYLE CHANGED: secBlock → card — 홈 화면 둥근 카드 레이아웃 통일]
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 카테고리 셀렉터 버튼 ────────────────────────────────
  selector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1.5, borderBottomColor: "#E5E5EA",
    paddingVertical: 12, marginTop: 10,
  },
  selectorDisabled: { opacity: 0.45 },
  selectorVal: { fontSize: 15, fontWeight: "500", color: "#1C1C1E" },
  selectorPlaceholder: { fontSize: 15, color: "#C7C7CC" },
  selectorArrow: { fontSize: 13, color: "#8E8E93" },

  // ─── 하단 다음 버튼 ──────────────────────────────────────
  // 필수 항목(상품명·브랜드명·소분류·공급가) 모두 채워지면 코랄로 활성화
  ctaBtn:         { borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  ctaInactive:    { backgroundColor: "#E5E5EA" },               // 미입력 — 회색
  ctaActive:      { backgroundColor: colors.coral },             // 입력 완료 — 코랄
  ctaPressed:     { backgroundColor: colors.coralDark },         // 누를 때 — 진한 코랄
  ctaText:        { fontSize: 15, fontWeight: "600" },
  ctaTextInactive:{ color: "#8E8E93" },
  ctaTextActive:  { color: "#fff" },
};
