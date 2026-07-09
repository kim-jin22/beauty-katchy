import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Pressable, ScrollView,
  Modal, Animated, KeyboardAvoidingView, Platform,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import TopBar from "../../components/TopBar";
import StepBar from "../../components/StepBar";
import { common, colors, pageBg } from "../../styles";
import { INGREDIENT_LIST } from "../../data/ingredients";

// ─── 한글 ㅐ↔ㅔ 정규화 (유사 발음 혼동 처리) ────────────────
const normalizeVowel = (str) => {
  let r = "";
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 0xAC00 && c <= 0xD7A3) {
      const base = c - 0xAC00;
      const cho  = Math.floor(base / (21 * 28));
      let   jung = Math.floor(base / 28) % 21;
      const jong = base % 28;
      if (jung === 1)  jung = 8;  // ㅐ → ㅔ
      if (jung === 3)  jung = 10; // ㅒ → ㅖ
      r += String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
    } else {
      r += str[i];
    }
  }
  return r;
};

// ─── 편집 거리 (Levenshtein) ─────────────────────────────────
const editDist = (a, b) => {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = a[i-1] === b[j-1] ? d[i-1][j-1]
        : 1 + Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]);
  return d[m][n];
};

// ─── 유사 성분 탐색 (ㅐ↔ㅔ + 편집거리 ≤ 2) ─────────────────
const findSimilar = (name) => {
  if (!name || name.length < 2) return [];
  const normName = normalizeVowel(name);
  const lowerName = name.toLowerCase();
  return INGREDIENT_LIST
    .map((item) => ({
      item,
      dist: Math.min(
        editDist(normName, normalizeVowel(item.kor)),
        editDist(lowerName, item.eng.toLowerCase())
      ),
    }))
    .filter(({ dist, item }) => dist <= 2 || item.kor.includes(name.slice(0, 2)))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4)
    .map(({ item }) => item);
};

// ─── 성분 파싱 공통 함수 ──────────────────────────────────────
const parseIngredient = (name) => {
  const found = INGREDIENT_LIST.find(
    (i) => i.kor === name || i.eng.toLowerCase() === name.toLowerCase()
  );
  return found
    ? { name: found.kor, eng: found.eng, type: found.type }
    : { name, eng: name, type: "unknown" };
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Step2Ingredients({ onNext, onBack, initialIngredients, onIngredientsChange }) {
  // 확정된 액티브 성분 — 메인 화면에 표시
  const [confirmedActive, setConfirmedActive] = useState(
    (initialIngredients ?? []).filter((i) => i.type === "active")
  );

  // 바텀시트
  const [showSheet, setShowSheet]           = useState(false);
  const [sheetStep, setSheetStep]           = useState(1);
  const [sheetIngredients, setSheetIngredients] = useState([]);
  const slideAnim = useRef(new Animated.Value(600)).current;

  const activeInSheet    = sheetIngredients.filter((i) => i.type === "active");
  const unknownInSheet   = sheetIngredients.filter((i) => i.type === "unknown");
  const regulatedInSheet = sheetIngredients.some((i) => i.type === "regulated");

  const openSheet = () => {
    setSheetIngredients(initialIngredients ?? []);
    setSheetStep(1);
    setShowSheet(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(
      () => setShowSheet(false)
    );
  };

  const confirmIngredients = () => {
    const active = sheetIngredients.filter((i) => i.type === "active");
    setConfirmedActive(active);
    onIngredientsChange?.(sheetIngredients);
    closeSheet();
  };

  const canProceed = confirmedActive.length > 0;

  // 다음 버튼 핸들러
  const handleNext = () => {
    if (regulatedInSheet) return;
    if (sheetStep < 3) { setSheetStep((p) => p + 1); return; }
    confirmIngredients();
  };

  return (
    <View style={[common.screen, { backgroundColor: pageBg }]}>
      <TopBar light titleLeft={false} title="상품 등록" onBack={onBack} />
      <StepBar current={2} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 공지 카드 — 노란 둥근 네모 */}
        {/* [STYLE CHANGED: noticeBanner → noticeCard 둥근 카드 — 디자인 요청] */}
        <View style={s.noticeCard}>
          <View style={[s.alertIcon, { backgroundColor: "#FAAD14" }]}>
            <Text style={s.alertIconText}>!</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.alertTitle, { color: "#614700" }]}>성분 순서가 중요해요</Text>
            <Text style={[s.alertDesc, { color: "#7C5500" }]}>
              함량이 많은 순서대로 앞에서부터 입력해주세요. 순서가 Fit Score에 직접 영향을 줘요.
            </Text>
          </View>
        </View>

        {/* 등록된 성분 카드 */}
        <View style={s.card}>
          <View style={common.secHeader}>
            <Text style={common.secLabel}>등록된 성분</Text>
            <Text style={{
              fontSize: 12,
              color: confirmedActive.length > 0 ? colors.mint : colors.grayMid,
              fontWeight: confirmedActive.length > 0 ? "700" : "400",
            }}>
              {confirmedActive.length > 0 ? `액티브 ${confirmedActive.length}개 확정` : "아직 없어요"}
            </Text>
          </View>

          {/* 성분 없음 — 회색 추가 버튼 */}
          {confirmedActive.length === 0 ? (
            <TouchableOpacity style={s.addArea} onPress={openSheet} activeOpacity={0.7}>
              <Text style={s.addAreaIcon}>+</Text>
              <Text style={s.addAreaText}>성분을 추가하세요</Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* 확정된 액티브 성분 칩 */}
              <View style={s.tagRow}>
                {confirmedActive.map((ing, idx) => (
                  <View key={idx} style={s.tagActive}>
                    <Text style={s.tagActiveNum}>{idx + 1}</Text>
                    <Text style={s.tagActiveName}>{ing.name}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={s.editBtn} onPress={openSheet} activeOpacity={0.7}>
                <Text style={s.editBtnText}>성분 수정하기 ›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 상태 알림 */}
        {canProceed && (
          <View style={s.alertSuccess}>
            <View style={[s.alertIcon, { backgroundColor: "#52C41A" }]}>
              <Svg width={12} height={12} viewBox="0 0 256 256">
                <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.alertTitle, { color: "#135200" }]}>성분 확정 완료</Text>
              <Text style={[s.alertDesc, { color: "#237804" }]}>
                액티브 성분 {confirmedActive.length}개 · Fit Score 진단을 시작할 수 있어요.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={common.bottomBar}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={[common.btnDefault, { flex: 1 }]} onPress={onBack}>
            <Text style={common.btnDefaultText}>이전</Text>
          </TouchableOpacity>
          <Pressable
            style={({ pressed }) => [
              s.ctaBtn,
              !canProceed ? s.ctaInactive : (pressed ? s.ctaPressed : s.ctaActive),
              { flex: 2 },
            ]}
            onPress={canProceed ? onNext : undefined}
          >
            <Text style={[s.ctaText, !canProceed ? s.ctaTextInactive : s.ctaTextActive]}>
              Fit Score 진단 →
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── 바텀시트 ───────────────────────────────────────────── */}
      <Modal transparent animationType="none" visible={showSheet} onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 40}
        >
          <View style={ss.overlay}>
            <TouchableOpacity style={ss.dim} activeOpacity={1} onPress={closeSheet} />
            <Animated.View style={[ss.sheet, { transform: [{ translateY: slideAnim }] }]}>

              {/* 핸들 */}
              <View style={ss.handle} />

              {/* 단계 헤더 */}
              <View style={ss.stepHeader}>
                <View style={ss.stepDots}>
                  {[1, 2, 3].map((n) => (
                    <View key={n} style={[ss.stepDot, sheetStep >= n && ss.stepDotActive]} />
                  ))}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ss.stepTitle}>
                    {sheetStep === 1 ? "전성분 입력" : sheetStep === 2 ? "미인식 성분 확인" : "액티브 성분 확인"}
                  </Text>
                  <Text style={ss.stepSub}>
                    {sheetStep === 1 && "성분을 검색하거나 쉼표로 붙여넣기"}
                    {sheetStep === 2 && `미인식 ${unknownInSheet.length}개 · 탭하여 교체`}
                    {sheetStep === 3 && `액티브 ${activeInSheet.length}개 · ↑↓로 순서 조정`}
                  </Text>
                </View>
                <Text style={ss.stepNum}>{sheetStep}/3</Text>
              </View>

              {/* 단계별 컨텐츠 */}
              {sheetStep === 1 && (
                <SheetStep1
                  ingredients={sheetIngredients}
                  onIngredients={setSheetIngredients}
                />
              )}
              {sheetStep === 2 && (
                <SheetStep2
                  ingredients={sheetIngredients}
                  onIngredients={setSheetIngredients}
                />
              )}
              {sheetStep === 3 && (
                <SheetStep3
                  ingredients={sheetIngredients}
                  onIngredients={setSheetIngredients}
                />
              )}

              {/* 하단 버튼 */}
              {sheetStep === 3 && regulatedInSheet && (
                <Text style={ss.regulatedWarn}>규제 성분을 제거해야 확정할 수 있어요</Text>
              )}
              <View style={ss.btns}>
                <TouchableOpacity
                  style={ss.btnBack}
                  onPress={sheetStep === 1 ? closeSheet : () => setSheetStep((p) => p - 1)}
                >
                  <Text style={ss.btnBackText}>{sheetStep === 1 ? "닫기" : "이전"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ss.btnNext, regulatedInSheet && ss.btnNextDisabled]}
                  onPress={handleNext}
                  disabled={regulatedInSheet}
                >
                  <Text style={[ss.btnNextText, sheetStep === 3 && regulatedInSheet && { color: "#8E8E93" }]}>
                    {sheetStep === 3 ? "성분 확정" : "다음 →"}
                  </Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — 전성분 입력
// ─────────────────────────────────────────────────────────────
function SheetStep1({ ingredients, onIngredients }) {
  const [input, setInput]           = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (text) => {
    setInput(text);
    const lower = text.toLowerCase();
    setSuggestions(
      text.trim()
        ? INGREDIENT_LIST.filter(
            (i) => i.kor.includes(text) || i.eng.toLowerCase().includes(lower)
          ).slice(0, 7)
        : []
    );
  };

  const selectSuggestion = (item) => {
    onIngredients((p) => [...p, { name: item.kor, eng: item.eng, type: item.type }]);
    setInput("");
    setSuggestions([]);
  };

  const addFromInput = () => {
    const items = input.split(",").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;
    onIngredients((p) => [...p, ...items.map(parseIngredient)]);
    setInput("");
    setSuggestions([]);
  };

  const remove = (idx) => onIngredients((p) => p.filter((_, i) => i !== idx));

  const BADGE = {
    active:    { bg: "#2EC4A0", label: "액티브", textColor: "#fff" },
    regulated: { bg: "#FF4D4F", label: "규제",   textColor: "#fff" },
    unknown:   { bg: "#F59E0B", label: "미인식", textColor: "#fff" },
    base:      { bg: "#E5E5EA", label: "베이스", textColor: "#6B6B6B" },
  };

  return (
    <ScrollView
      style={ss.stepContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 입력창 */}
      <View style={ss.inputRow}>
        <TextInput
          style={ss.input}
          placeholder="성분명 검색 또는 쉼표로 여러 성분 입력"
          placeholderTextColor={colors.grayMid}
          value={input}
          onChangeText={handleChange}
          onSubmitEditing={addFromInput}
          returnKeyType="done"
        />
        <TouchableOpacity style={ss.addBtn} onPress={addFromInput}>
          <Text style={ss.addBtnText}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* 자동완성 */}
      {suggestions.length > 0 && (
        <View style={ss.suggestBox}>
          {suggestions.map((item, i) => {
            const b = BADGE[item.type] ?? BADGE.base;
            return (
              <TouchableOpacity
                key={i}
                style={[ss.suggestRow, i < suggestions.length - 1 && ss.suggestBorder]}
                onPress={() => selectSuggestion(item)}
              >
                <Text style={ss.suggestKor}>{item.kor}</Text>
                <View style={[ss.badge, { backgroundColor: b.bg }]}>
                  <Text style={[ss.badgeText, { color: b.textColor }]}>{b.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 규제 성분 경고 */}
      {ingredients.filter(i => i.type === "regulated").length > 0 && (
        <View style={ss.regulatedCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <View style={[s.alertIcon, { backgroundColor: "#FF4D4F" }]}>
              <Text style={s.alertIconText}>!</Text>
            </View>
            <Text style={ss.regulatedCardTitle}>규제 성분이 포함되어 있어요</Text>
          </View>
          <Text style={ss.regulatedCardDesc}>아래 성분을 삭제해야 다음 단계로 진행할 수 있어요</Text>
          {ingredients.map((ing, idx) => ing.type !== "regulated" ? null : (
            <View key={idx} style={ss.regulatedItem}>
              <Text style={ss.regulatedItemName}>{ing.name}</Text>
              <TouchableOpacity onPress={() => remove(idx)} style={ss.regulatedDelBtn}>
                <Text style={ss.regulatedDelText}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 성분 목록 */}
      <Text style={ss.listHeader}>
        입력된 성분 {ingredients.length}개
        {ingredients.filter(i => i.type === "unknown").length > 0
          ? `  ·  미인식 ${ingredients.filter(i => i.type === "unknown").length}개`
          : ""}
        {ingredients.filter(i => i.type === "regulated").length > 0
          ? `  ·  규제 ${ingredients.filter(i => i.type === "regulated").length}개`
          : ""}
      </Text>

      {ingredients.length === 0 ? (
        <Text style={ss.emptyText}>성분을 검색하거나 쉼표로 구분해 입력하세요</Text>
      ) : (
        ingredients.map((ing, idx) => {
          const b = BADGE[ing.type] ?? BADGE.base;
          return (
            <View key={idx} style={ss.ingRow}>
              <Text style={ss.ingOrder}>{idx + 1}</Text>
              <Text style={ss.ingName} numberOfLines={1}>{ing.name}</Text>
              <View style={[ss.badge, { backgroundColor: b.bg }]}>
                <Text style={[ss.badgeText, { color: b.textColor }]}>{b.label}</Text>
              </View>
              <TouchableOpacity style={ss.ingRemove} onPress={() => remove(idx)}>
                <Text style={ss.ingRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — 미인식 성분 확인 & 교체
// ─────────────────────────────────────────────────────────────
function SheetStep2({ ingredients, onIngredients }) {
  const unknowns = ingredients
    .map((ing, idx) => ({ ing, idx }))
    .filter(({ ing }) => ing.type === "unknown");

  const replace = (idx, item) =>
    onIngredients((p) => {
      const next = [...p];
      next[idx] = { name: item.kor, eng: item.eng, type: item.type };
      return next;
    });

  const remove = (idx) => onIngredients((p) => p.filter((_, i) => i !== idx));

  if (unknowns.length === 0) {
    return (
      <View style={[ss.stepContent, ss.centeredContent]}>
        <View style={ss.allOkIcon}>
          <Svg width={32} height={32} viewBox="0 0 256 256">
            <Path d="M109.53,182.65h-.08c-3.65-.03-7.12-1.63-9.5-4.39l-37.87-43.98c-4.56-5.29-3.96-13.28,1.33-17.84,5.29-4.56,13.28-3.96,17.84,1.33l28.41,33,64.93-73.44c4.62-5.23,12.61-5.72,17.85-1.1,5.23,4.63,5.72,12.62,1.1,17.85l-74.52,84.3c-2.41,2.71-5.86,4.27-9.48,4.27Z" fill="#fff" />
          </Svg>
        </View>
        <Text style={ss.allOkTitle}>모든 성분 인식 완료</Text>
        <Text style={ss.allOkSub}>다음 단계에서 액티브 성분을 확인하세요</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={ss.stepContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={ss.step2Desc}>
        DB에서 찾을 수 없는 성분이에요. ㅐ↔ㅔ 혼동 포함 유사 성분을 제안해드려요.{"\n"}
        성분명을 탭해 직접 수정하거나 제안 성분으로 교체하세요.
      </Text>
      {unknowns.map(({ ing, idx }) => (
        <UnknownRow
          key={idx}
          ing={ing}
          idx={idx}
          onReplace={replace}
          onRemove={remove}
        />
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function UnknownRow({ ing, idx, onReplace, onRemove }) {
  const [editing, setEditing]           = useState(false);
  const [editVal, setEditVal]           = useState(ing.name);
  const [editSuggestions, setEditSuggestions] = useState([]);
  const similar = findSimilar(ing.name);

  const handleEditChange = (text) => {
    setEditVal(text);
    const lower = text.toLowerCase();
    setEditSuggestions(
      text.trim()
        ? INGREDIENT_LIST.filter(
            (i) => i.kor.includes(text) || i.eng.toLowerCase().includes(lower)
          ).slice(0, 5)
        : []
    );
  };

  return (
    <View style={ss.unknownCard}>
      {/* 성분명 행 */}
      <View style={ss.unknownNameRow}>
        <View style={ss.unknownQMark}>
          <Text style={ss.unknownQText}>?</Text>
        </View>
        {editing ? (
          <TextInput
            style={ss.unknownInput}
            value={editVal}
            onChangeText={handleEditChange}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => setEditing(false)}
          />
        ) : (
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditing(true)}>
            <Text style={ss.unknownName}>
              {ing.name}{"  "}
              <Text style={ss.unknownEditTag}>수정 ✎</Text>
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={ss.unknownRemove} onPress={() => onRemove(idx)}>
          <Text style={ss.unknownRemoveText}>삭제</Text>
        </TouchableOpacity>
      </View>

      {/* 편집 시 자동완성 */}
      {editing && editSuggestions.length > 0 && (
        <View style={ss.editSuggestBox}>
          {editSuggestions.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[ss.suggestRow, i < editSuggestions.length - 1 && ss.suggestBorder]}
              onPress={() => {
                onReplace(idx, item);
                setEditing(false);
                setEditSuggestions([]);
              }}
            >
              <Text style={ss.suggestKor}>{item.kor}</Text>
              <View style={[ss.badge, item.type === "active" ? { backgroundColor: "#2EC4A0" } : { backgroundColor: "#E5E5EA" }]}>
                <Text style={[ss.badgeText, item.type === "active" ? { color: "#fff" } : { color: "#6B6B6B" }]}>
                  {item.type === "active" ? "액티브" : "베이스"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 유사 성분 제안 (편집 아닐 때) */}
      {!editing && similar.length > 0 && (
        <View style={ss.similarWrap}>
          <Text style={ss.similarLabel}>혹시 이 성분인가요?</Text>
          <View style={ss.similarChips}>
            {similar.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[ss.similarChip, item.type === "active" && ss.similarChipActive]}
                onPress={() => onReplace(idx, item)}
              >
                <Text style={[ss.similarChipText, item.type === "active" && ss.similarChipTextActive]}>
                  {item.kor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — 액티브 성분 확인 & 순서 조정
// ─────────────────────────────────────────────────────────────
function SheetStep3({ ingredients, onIngredients }) {
  const [searching, setSearching]         = useState(false);
  const [searchInput, setSearchInput]     = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const actives = ingredients.map((ing, idx) => ({ ing, idx })).filter(({ ing }) => ing.type === "active");

  const move = (idx, dir) =>
    onIngredients((p) => {
      const next = [...p];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return p;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });

  const remove = (idx) => onIngredients((p) => p.filter((_, i) => i !== idx));

  const handleSearchChange = (text) => {
    setSearchInput(text);
    const lower = text.toLowerCase();
    setSearchSuggestions(
      text.trim()
        ? INGREDIENT_LIST.filter(
            (i) => i.type === "active" && (i.kor.includes(text) || i.eng.toLowerCase().includes(lower))
          ).slice(0, 6)
        : []
    );
  };

  const addActive = (item) => {
    onIngredients((p) => [...p, { name: item.kor, eng: item.eng, type: item.type }]);
    setSearchInput("");
    setSearchSuggestions([]);
    setSearching(false);
  };

  return (
    <ScrollView
      style={ss.stepContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={ss.step3Desc}>
        앞에 있을수록 고농도 성분으로 인식돼 Fit Score에 유리해요. ↑↓로 순서를 조정하세요.
      </Text>

      {actives.length === 0 ? (
        <Text style={ss.emptyText}>감지된 액티브 성분이 없어요. 아래 버튼으로 추가하세요.</Text>
      ) : (
        actives.map(({ ing, idx }, rank) => (
          <View key={idx} style={ss.activeRow}>
            <View style={ss.activeRankBadge}>
              <Text style={ss.activeRankText}>{rank + 1}</Text>
            </View>
            <Text style={ss.activeName} numberOfLines={1}>{ing.name}</Text>
            <View style={ss.arrows}>
              <TouchableOpacity
                style={[ss.arrowBtn, rank === 0 && { opacity: 0.25 }]}
                onPress={() => move(idx, -1)}
                disabled={rank === 0}
              >
                <Text style={ss.arrowText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ss.arrowBtn, rank === actives.length - 1 && { opacity: 0.25 }]}
                onPress={() => move(idx, 1)}
                disabled={rank === actives.length - 1}
              >
                <Text style={ss.arrowText}>↓</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ padding: 6 }} onPress={() => remove(idx)}>
              <Text style={{ fontSize: 15, color: "#C7C7CC" }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* 액티브 성분 추가 */}
      {!searching ? (
        <TouchableOpacity style={ss.addActiveBtn} onPress={() => setSearching(true)}>
          <Text style={ss.addActiveBtnText}>+ 액티브 성분 추가</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginTop: 10 }}>
          <TextInput
            style={ss.input}
            placeholder="액티브 성분 검색"
            placeholderTextColor={colors.grayMid}
            value={searchInput}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchSuggestions.length > 0 && (
            <View style={ss.suggestBox}>
              {searchSuggestions.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[ss.suggestRow, i < searchSuggestions.length - 1 && ss.suggestBorder]}
                  onPress={() => addActive(item)}
                >
                  <Text style={ss.suggestKor}>{item.kor}</Text>
                  <View style={[ss.badge, { backgroundColor: "#2EC4A0" }]}>
                    <Text style={[ss.badgeText, { color: "#fff" }]}>액티브</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={{ marginTop: 10, alignItems: "center" }} onPress={() => setSearching(false)}>
            <Text style={{ fontSize: 13, color: colors.grayMid }}>취소</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// ─────────────────────────────────────────────────────────────
const alertBase = {
  borderRadius: 8, padding: 14,
  flexDirection: "row", alignItems: "flex-start", gap: 10,
};

// 메인 화면 스타일
const s = {
  card: { backgroundColor: "#fff", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  // ─── 공지 카드 — 노란 둥근 네모 ─────────────────────────
  // [STYLE CHANGED: noticeBanner(띠형) → noticeCard(카드형 둥근 네모) — 디자인 요청]
  noticeCard: { backgroundColor: "#FFFBE6", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: "#FFE58F", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  alertIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 1 },
  alertIconText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  alertTitle: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  alertDesc: { fontSize: 12, lineHeight: 20 },

  // ─── 성분 추가 영역 (빈 상태) ────────────────────────────
  // [STYLE CHANGED: 회색 버튼 addArea 추가 — 디자인 요청]
  addArea: { backgroundColor: "#F8F8F8", borderRadius: 10, borderWidth: 1.5, borderColor: "#E5E5EA", borderStyle: "dashed", paddingVertical: 24, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  addAreaIcon: { fontSize: 22, color: colors.grayMid, lineHeight: 28 },
  addAreaText: { fontSize: 14, color: colors.grayMid, fontWeight: "500" },

  // ─── 확정된 액티브 성분 태그 ─────────────────────────────
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  tagActive: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E0F9F4", borderWidth: 1, borderColor: "#2EC4A0", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  tagActiveNum: { fontSize: 10, fontWeight: "700", color: "#2EC4A0", width: 14, textAlign: "center" },
  tagActiveName: { fontSize: 12, fontWeight: "600", color: "#0A7A5A" },

  // ─── 수정 버튼 ────────────────────────────────────────────
  editBtn: { alignSelf: "flex-end", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: "#E5E5EA" },
  editBtnText: { fontSize: 12, color: colors.grayMid },

  // ─── 성공 알림 ────────────────────────────────────────────
  alertSuccess: { ...alertBase, backgroundColor: "#F6FFED", borderWidth: 1, borderColor: "#B7EB8F", marginHorizontal: 16, marginBottom: 12 },

  // ─── 하단 CTA ─────────────────────────────────────────────
  ctaBtn:          { borderRadius: 6, paddingVertical: 17, alignItems: "center" },
  ctaInactive:     { backgroundColor: "#E5E5EA" },
  ctaActive:       { backgroundColor: colors.coral },
  ctaPressed:      { backgroundColor: colors.coralDark },
  ctaText:         { fontSize: 15, fontWeight: "600" },
  ctaTextInactive: { color: "#8E8E93" },
  ctaTextActive:   { color: "#fff" },
};

// 바텀시트 스타일
const ss = {
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  // [STYLE CHANGED: maxHeight → height 88% 고정 — 내용 안 보이는 문제 개선]
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "88%", paddingBottom: 8 },

  // ─── 핸들 + 단계 헤더 ────────────────────────────────────
  handle: { width: 36, height: 4, backgroundColor: "#D1D1D6", borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 16 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E5EA" },
  stepDots: { flexDirection: "row", gap: 5 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5E5EA" },
  stepDotActive: { backgroundColor: colors.coral },
  stepTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.3 },
  stepSub: { fontSize: 11, color: colors.grayMid, marginTop: 2 },
  stepNum: { fontSize: 12, color: colors.grayMid },

  // ─── 단계 컨텐츠 공통 ────────────────────────────────────
  stepContent: { flex: 1, paddingHorizontal: 20, paddingTop: 14 },
  centeredContent: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { fontSize: 13, color: colors.grayMid, textAlign: "center", paddingVertical: 28 },

  // ─── 입력창 ───────────────────────────────────────────────
  inputRow: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-end" },
  input: { flex: 1, borderBottomWidth: 1.5, borderBottomColor: "#E5E5EA", paddingVertical: 10, fontSize: 14, color: "#1C1C1E" },
  addBtn: { backgroundColor: "#1C1C1E", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { fontSize: 13, fontWeight: "500", color: "#fff" },

  // ─── 자동완성 + 공통 배지 ────────────────────────────────
  suggestBox: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#E5E5EA", marginBottom: 12, overflow: "hidden" },
  suggestRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11, paddingHorizontal: 14 },
  suggestBorder: { borderBottomWidth: 0.5, borderBottomColor: "#F2F2F7" },
  suggestKor: { fontSize: 13, color: "#1C1C1E", flex: 1 },
  badge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  badgeText: { fontSize: 11, fontWeight: "500" },

  // ─── 성분 목록 (Step 1) ──────────────────────────────────
  listHeader: { fontSize: 12, color: colors.grayMid, marginBottom: 8 },
  ingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F2F2F7", gap: 8 },
  ingOrder: { fontSize: 12, color: colors.grayMid, width: 22, textAlign: "right" },
  ingName: { flex: 1, fontSize: 13, color: "#1C1C1E" },
  ingRemove: { padding: 6 },
  ingRemoveText: { fontSize: 13, color: "#C7C7CC" },

  // ─── 미인식 성분 카드 (Step 2) ───────────────────────────
  step2Desc: { fontSize: 12, color: colors.grayMid, lineHeight: 18, marginBottom: 14 },
  unknownCard: { backgroundColor: "#FFFBEB", borderRadius: 10, borderWidth: 1, borderColor: "#FCD34D", padding: 12, marginBottom: 10 },
  unknownNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  unknownQMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" },
  unknownQText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  unknownName: { flex: 1, fontSize: 13, color: "#92400E", fontWeight: "500" },
  unknownEditTag: { fontSize: 11, color: "#B45309" },
  unknownInput: { flex: 1, fontSize: 13, color: "#1C1C1E", borderBottomWidth: 1.5, borderBottomColor: colors.coral, paddingVertical: 2 },
  unknownRemove: { paddingHorizontal: 8, paddingVertical: 4 },
  unknownRemoveText: { fontSize: 12, color: colors.grayMid },
  editSuggestBox: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#E5E5EA", overflow: "hidden", marginBottom: 6 },
  similarWrap: { marginTop: 4 },
  similarLabel: { fontSize: 11, color: "#B45309", marginBottom: 6 },
  similarChips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  similarChip: { borderRadius: 6, borderWidth: 1, borderColor: "#E5E5EA", backgroundColor: "#fff", paddingVertical: 5, paddingHorizontal: 12 },
  similarChipActive: { borderColor: "#2EC4A0", backgroundColor: "#E0F9F4" },
  similarChipText: { fontSize: 12, color: "#3A3A3C" },
  similarChipTextActive: { color: "#0A7A5A", fontWeight: "600" },

  // ─── 전부 인식 완료 (Step 2 빈 상태) ────────────────────
  allOkIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#52C41A", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  allOkTitle: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", marginBottom: 8 },
  allOkSub: { fontSize: 13, color: colors.grayMid },

  // ─── 액티브 성분 행 (Step 3) ─────────────────────────────
  step3Desc: { fontSize: 12, color: colors.grayMid, lineHeight: 18, marginBottom: 14 },
  activeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F2F2F7", gap: 8 },
  activeRankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#2EC4A0", alignItems: "center", justifyContent: "center" },
  activeRankText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  activeName: { flex: 1, fontSize: 13, fontWeight: "500", color: "#1C1C1E" },
  arrows: { flexDirection: "row", gap: 2 },
  arrowBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  arrowText: { fontSize: 16, color: "#8E8E93" },
  addActiveBtn: { marginTop: 14, borderRadius: 8, borderWidth: 1.5, borderColor: "#2EC4A0", paddingVertical: 12, alignItems: "center" },
  addActiveBtnText: { fontSize: 13, fontWeight: "600", color: "#2EC4A0" },

  // ─── 하단 버튼 ────────────────────────────────────────────
  regulatedWarn: { fontSize: 11, color: "#CF1322", textAlign: "center", marginBottom: 6, paddingHorizontal: 20 },
  regulatedCard: { backgroundColor: "#FFF1F0", borderRadius: 10, borderWidth: 1, borderColor: "#FFA39E", marginHorizontal: 16, marginBottom: 12, padding: 14 },
  regulatedCardTitle: { fontSize: 13, fontWeight: "700", color: "#CF1322" },
  regulatedCardDesc: { fontSize: 12, color: "#CF1322", marginBottom: 10 },
  regulatedItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 0.5, borderTopColor: "#FFA39E" },
  regulatedItemName: { fontSize: 13, color: "#1C1C1E", flex: 1 },
  regulatedDelBtn: { backgroundColor: "#FF4D4F", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  regulatedDelText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  btns: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: "#E5E5EA" },
  btnBack: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: "#E5E5EA", paddingVertical: 14, alignItems: "center" },
  btnBackText: { fontSize: 15, fontWeight: "600", color: "#3A3A3C" },
  btnNext: { flex: 2, borderRadius: 10, backgroundColor: colors.coral, paddingVertical: 14, alignItems: "center" },
  btnNextDisabled: { backgroundColor: "#E5E5EA" },
  btnNextText: { fontSize: 15, fontWeight: "700", color: "#fff" },
};

