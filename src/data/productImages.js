// ─── 상품명 → 로컬 이미지 매핑 ───────────────────────────────────
const PRODUCT_IMAGES = {
  // 선케어
  "선뮤즈 모이스처 선크림":    require("../../assets/images/products/sunmuse_moisture.jpg"),
  "선뮤즈 톤업":              require("../../assets/images/products/sunmuse_toneup.jpg"),
  "그린티 선크림":             require("../../assets/images/products/greentea_sun.jpg"),
  "무기자차 선크림":           require("../../assets/images/products/mineral_sun.jpg"),
  "논코메도제닉 선크림":       require("../../assets/images/products/noncomedo_sun.jpg"),
  "비건 선크림":               require("../../assets/images/products/vegan_sun.jpg"),
  "무향 선크림":               require("../../assets/images/products/unscented_sun.jpg"),

  // ── 아누아 스킨케어 ────────────────────────────────────────────
  "어성초 77 히알루론산 수분 진정 토너":          require("../../assets/images/products/어성초 77 히알루론산 수분 진정 토너.png"),
  "어성초 77 MHA 모공 클리어링 세럼":             require("../../assets/images/products/어성초 77 MHA 모공 클리어링 세럼 30ml.png"),
  "복숭아 나이아신아마이드 세럼":                  require("../../assets/images/products/복숭아 나이아신아마이드 세럼 30ml.webp"),
  "어성초 수분 크림":                              require("../../assets/images/products/어성초 수분 크림 50ml.webp"),
  "어성초 진정 앰플":                              require("../../assets/images/products/어성초 진정 앰플 30ml.jpg"),
  "어성초 클리어 에센스":                          require("../../assets/images/products/어성초 클리어 에센스 200ml.png"),
  "아누아 피디알엔 히알루론산 수분 캡슐 미스트":   require("../../assets/images/products/아누아 피디알엔 히알루론산 수분 캡슐 미스트 30ml.jpg"),
  "아누아 피디알엔 히알루론산 캡슐 100 세럼":      require("../../assets/images/products/아누아 피디알엔 히알루론산 캡슐 100 세럼 30mL.webp"),

  // ── 아누아 클렌징 ────────────────────────────────────────────
  "어성초 포어 컨트롤 클렌징오일":                 require("../../assets/images/products/어성초 포어 컨트롤 클렌징오일.webp"),
  "아누아 어성초 포어 컨트롤 클렌징오일 350ml":    require("../../assets/images/products/아누아 어성초 포어 컨트롤 클렌징오일 350ml.png"),
  "아누아 어성초 피지쏙 클렌징오일":               require("../../assets/images/products/아누아 어성초 피지쏙 클렌징오일 200ml.webp"),
  "아누아 어성초 피지쏙 모공 폼":                  require("../../assets/images/products/아누아 어성초 피지쏙 모공 폼 150ml.webp"),
  "아누아 어성초 석시닉 모이스처 클렌징폼":        require("../../assets/images/products/아누아 어성초 석시닉 모이스처 클렌징폼 150ml.webp"),
  "아누아 피디알엔 히알루론산 수분 클렌징폼":      require("../../assets/images/products/아누아 피디알엔 히알루론산 수분 클렌징폼 150ml.jpg"),
  "어성초 87 약산성 딥 클렌징워터":               require("../../assets/images/products/어성초 87 약산성 딥 클렌징워터.webp"),
  "라이스 효소 브라이트닝 클렌징 파우더":          require("../../assets/images/products/라이스 효소 브라이트닝 클렌징 파우더 40g.webp"),
  "어성초 모공 케어 패드":                         require("../../assets/images/products/어성초 모공 케어 패드 70매.jpg"),

  // ── 아누아 선케어 ────────────────────────────────────────────
  "아누아 제로캐스트 데일리 글로우 피니쉬 선스틱": require("../../assets/images/products/아누아 제로캐스트 데일리 글로우 피니쉬 선스틱 18g.png"),
  "아누아 매트벗글로우 커버 베이지":               require("../../assets/images/products/아누아 매트벗글로우 커버 베이지 50ml.png"),

  // ── 기타 브랜드 스킨케어 ─────────────────────────────────────
  "비타민C 브라이트닝 세럼":   require("../../assets/images/products/비타민C 브라이트닝 세럼.jpg"),
  "그린티 씨드 세럼":          require("../../assets/images/products/greentea_sun.jpg"),
  "시카테롤 토너":             require("../../assets/images/products/cicaterol_toner.jpg"),
  "스네일 에센스":             require("../../assets/images/products/snail_essence.jpg"),
  "세라마이드 토너":           require("../../assets/images/products/ceramide_toner.jpg"),
  "센텔라 진정 앰플":          require("../../assets/images/products/centella_ampoule.jpg"),
  "히알루론산 수분크림":       require("../../assets/images/products/ha_cream.jpg"),

  // ── 기타 브랜드 클렌징 ───────────────────────────────────────
  "녹두 약산성 클렌징폼":      require("../../assets/images/products/mungbean_foam.jpg"),
  "녹두 클렌징 오일":          require("../../assets/images/products/mungbean_oil.jpg"),
  "녹두 밀크 필링 젤":         require("../../assets/images/products/mungbean_peeling.jpg"),
  "비건 클렌징 폼":            require("../../assets/images/products/vegan_foam.jpg"),
  "저자극 클렌징 오일":        require("../../assets/images/products/gentle_oil.jpg"),
  "민감성 클렌징 워터":        require("../../assets/images/products/sensitive_water.jpg"),
  "딥클렌징 버블폼":           require("../../assets/images/products/bubble_foam.jpg"),
  "약산성 클렌징 젤":          require("../../assets/images/products/ph_gel.jpg"),

  // 마스크팩
  "시카 마스크팩":             require("../../assets/images/products/cica_mask.jpg"),
  "히알루론산 수분 마스크":    require("../../assets/images/products/ha_mask.jpg"),
  "비타민C 브라이트닝 마스크": require("../../assets/images/products/vitc_mask.jpg"),
  "콜라겐 탄력 마스크":        require("../../assets/images/products/collagen_mask.jpg"),
  "진정 수딩 마스크":          require("../../assets/images/products/soothing_mask.jpg"),
};

// ─── 카테고리별 상위 순위 이미지 ─────────────────────────────────
const CATEGORY_RANK_IMAGES = {
  "스킨케어": [require("../../assets/images/products/스킨케어.jpeg")],
  "클렌징":   [require("../../assets/images/products/클렌징.jpeg"), require("../../assets/images/products/클렌징2.jpeg")],
  "선케어":   [require("../../assets/images/products/선케어.jpeg")],
};

// ─── 상품명 기반 조회 ────────────────────────────────────────────
export function getProductImage(name) {
  if (!name) return null;
  if (PRODUCT_IMAGES[name]) return PRODUCT_IMAGES[name];
  const key = Object.keys(PRODUCT_IMAGES).find(
    k => name.includes(k) || k.includes(name)
  );
  return key ? PRODUCT_IMAGES[key] : null;
}

// ─── 카테고리 + 카테고리 내 순위 기반 조회 ──────────────────────
// catRank: 해당 카테고리에서 몇 번째로 높은 점수인지 (1부터 시작)
export function getCategoryRankImage(category, catRank) {
  const imgs = CATEGORY_RANK_IMAGES[category];
  if (imgs && catRank >= 1 && catRank <= imgs.length) {
    return imgs[catRank - 1];
  }
  return null;
}
