/**
 * 화장품 성분 데이터
 * type: "active" | "base" | "regulated"
 */
export const INGREDIENT_LIST = [
  // ── 액티브 — 미백/브라이트닝 ────────────────────────────
  { kor: "나이아신아마이드",           eng: "niacinamide",                   type: "active" },
  { kor: "비타민C",                   eng: "ascorbic acid",                 type: "active" },
  { kor: "아스코르브산",              eng: "ascorbic acid",                  type: "active" },
  { kor: "에칠아스코르빌에텔",        eng: "ethyl ascorbyl ether",           type: "active" },
  { kor: "아스코르빌글루코사이드",    eng: "ascorbyl glucoside",              type: "active" },
  { kor: "알파알부틴",               eng: "alpha-arbutin",                   type: "active" },
  { kor: "트라넥사믹애씨드",         eng: "tranexamic acid",                 type: "active" },
  { kor: "글루타치온",               eng: "glutathione",                     type: "active" },
  { kor: "코직산",                   eng: "kojic acid",                      type: "active" },
  { kor: "글라브리딘",               eng: "glabridin",                       type: "active" },

  // ── 액티브 — 주름/리프팅 ─────────────────────────────────
  { kor: "레티놀",                   eng: "retinol",                         type: "active" },
  { kor: "레티닐팔미테이트",         eng: "retinyl palmitate",               type: "active" },
  { kor: "바쿠치올",                 eng: "bakuchiol",                       type: "active" },
  { kor: "아데노신",                 eng: "adenosine",                       type: "active" },
  { kor: "펩타이드",                 eng: "peptide",                         type: "active" },
  { kor: "아세틸헥사펩타이드",       eng: "acetyl hexapeptide",              type: "active" },
  { kor: "팔미토일펜타펩타이드",     eng: "palmitoyl pentapeptide",          type: "active" },
  { kor: "구리펩타이드",             eng: "copper peptide",                  type: "active" },
  { kor: "EGF",                     eng: "epidermal growth factor",          type: "active" },
  { kor: "토코페롤",                 eng: "tocopherol",                      type: "active" },
  { kor: "토코페릴아세테이트",       eng: "tocopheryl acetate",              type: "active" },
  { kor: "레스베라트롤",             eng: "resveratrol",                     type: "active" },

  // ── 액티브 — 보습/장벽 ──────────────────────────────────
  { kor: "세라마이드",               eng: "ceramide",                        type: "active" },
  { kor: "세라마이드NP",             eng: "ceramide np",                     type: "active" },
  { kor: "히알루론산",               eng: "hyaluronic acid",                 type: "active" },
  { kor: "히아루론산",               eng: "hyaluronic acid",                 type: "active" },
  { kor: "소듐하이알루로네이트",     eng: "sodium hyaluronate",              type: "active" },
  { kor: "판테놀",                   eng: "panthenol",                       type: "active" },
  { kor: "알란토인",                 eng: "allantoin",                       type: "active" },
  { kor: "스쿠알란",                 eng: "squalane",                        type: "active" },
  { kor: "엑토인",                   eng: "ectoin",                          type: "active" },

  // ── 액티브 — 진정/트러블 ─────────────────────────────────
  { kor: "센텔라아시아티카",         eng: "centella asiatica",               type: "active" },
  { kor: "병풀추출물",               eng: "centella asiatica extract",       type: "active" },
  { kor: "마데카소사이드",           eng: "madecassoside",                   type: "active" },
  { kor: "아시아티코사이드",         eng: "asiaticoside",                    type: "active" },
  { kor: "살리실산",                 eng: "salicylic acid",                  type: "active" },
  { kor: "아젤라익애씨드",           eng: "azelaic acid",                    type: "active" },
  { kor: "카페인",                   eng: "caffeine",                        type: "active" },
  { kor: "녹차추출물",               eng: "green tea extract",               type: "active" },
  { kor: "감초추출물",               eng: "licorice extract",                type: "active" },
  { kor: "어성초추출물",             eng: "heartleaf houttuynia extract",    type: "active" },
  { kor: "쑥추출물",                 eng: "artemisia extract",               type: "active" },
  { kor: "알로에베라",               eng: "aloe vera",                       type: "active" },

  // ── 액티브 — 첨단/바이오 ─────────────────────────────────
  { kor: "엑소좀",                   eng: "exosome",                         type: "active" },
  { kor: "엑소솜",                   eng: "exosome",                         type: "active" },
  { kor: "PDRN",                    eng: "pdrn",                             type: "active" },
  { kor: "폴리데옥시리보뉴클레오타이드", eng: "pdrn",                        type: "active" },
  { kor: "NAD",                     eng: "nad",                              type: "active" },
  { kor: "락토바실러스",             eng: "lactobacillus",                   type: "active" },

  // ── 액티브 — AHA/BHA/PHA ─────────────────────────────────
  { kor: "글라이콜릭애씨드",         eng: "glycolic acid",                   type: "active" },
  { kor: "락틱애씨드",               eng: "lactic acid",                     type: "active" },
  { kor: "젖산",                     eng: "lactic acid",                     type: "active" },
  { kor: "만델릭애씨드",             eng: "mandelic acid",                   type: "active" },
  { kor: "글루코노락톤",             eng: "gluconolactone",                  type: "active" },

  // ── 액티브 — 선케어 자외선차단 ──────────────────────────
  { kor: "징크옥사이드",             eng: "zinc oxide",                      type: "active" },
  { kor: "산화아연",                 eng: "zinc oxide",                      type: "active" },
  { kor: "티타늄디옥사이드",         eng: "titanium dioxide",                type: "active" },
  { kor: "아보벤존",                 eng: "avobenzone",                      type: "active" },
  { kor: "옥티녹세이트",             eng: "octinoxate",                      type: "active" },
  { kor: "호모살레이트",             eng: "homosalate",                      type: "active" },
  { kor: "옥토크릴렌",               eng: "octocrylene",                     type: "active" },

  // ── 액티브 — 클렌징 계면활성제 (고급) ───────────────────
  { kor: "소듐코코일글루타메이트",   eng: "sodium cocoyl glutamate",         type: "active" },
  { kor: "소듐라우로일글루타메이트", eng: "sodium lauroyl glutamate",        type: "active" },
  { kor: "코카미도프로필베타인",     eng: "cocamidopropyl betaine",          type: "active" },
  { kor: "코코아미도프로필베타인",   eng: "cocamidopropyl betaine",          type: "active" },
  { kor: "데실글루코사이드",         eng: "decyl glucoside",                 type: "active" },
  { kor: "라우릴글루코사이드",       eng: "lauryl glucoside",                type: "active" },
  { kor: "코코글루코사이드",         eng: "coco glucoside",                  type: "active" },
  { kor: "카프릴릭/카프릭트리글리세라이드", eng: "caprylic/capric triglyceride", type: "active" },

  // ── 베이스 — 용매/보습 ──────────────────────────────────
  { kor: "정제수",                   eng: "water",                           type: "base" },
  { kor: "물",                       eng: "water",                           type: "base" },
  { kor: "글리세린",                 eng: "glycerin",                        type: "base" },
  { kor: "부틸렌글라이콜",           eng: "butylene glycol",                 type: "base" },
  { kor: "프로판다이올",             eng: "propanediol",                     type: "base" },
  { kor: "펜틸렌글라이콜",           eng: "pentylene glycol",                type: "base" },
  { kor: "헥산다이올",               eng: "hexanediol",                      type: "base" },
  { kor: "베타인",                   eng: "betaine",                         type: "base" },
  { kor: "소듐PCA",                  eng: "sodium pca",                      type: "base" },

  // ── 베이스 — 유화제/증점제 ──────────────────────────────
  { kor: "카보머",                   eng: "carbomer",                        type: "base" },
  { kor: "잔탄검",                   eng: "xanthan gum",                     type: "base" },
  { kor: "세틸알코올",               eng: "cetyl alcohol",                   type: "base" },
  { kor: "세테아릴알코올",           eng: "cetearyl alcohol",                type: "base" },
  { kor: "베헤닐알코올",             eng: "behenyl alcohol",                 type: "base" },
  { kor: "하이드록시에칠셀룰로오스", eng: "hydroxyethyl cellulose",          type: "base" },

  // ── 베이스 — 오일/에모리언트 ────────────────────────────
  { kor: "호호바씨오일",             eng: "jojoba seed oil",                 type: "base" },
  { kor: "아르간오일",               eng: "argan oil",                       type: "base" },
  { kor: "시어버터",                 eng: "shea butter",                     type: "base" },
  { kor: "올리브오일",               eng: "olive oil",                       type: "base" },

  // ── 베이스 — 보존제/pH 조절 ─────────────────────────────
  { kor: "페녹시에탄올",             eng: "phenoxyethanol",                  type: "base" },
  { kor: "에칠헥실글리세린",         eng: "ethylhexylglycerin",              type: "base" },
  { kor: "1,2-헥산다이올",           eng: "1,2-hexanediol",                  type: "base" },
  { kor: "소듐벤조에이트",           eng: "sodium benzoate",                 type: "base" },
  { kor: "포타슘소르베이트",         eng: "potassium sorbate",               type: "base" },
  { kor: "시트릭애씨드",             eng: "citric acid",                     type: "base" },
  { kor: "구연산",                   eng: "citric acid",                     type: "base" },
  { kor: "소듐하이드록사이드",       eng: "sodium hydroxide",                type: "base" },

  // ── 베이스 — 클렌징 계면활성제 (일반) ───────────────────
  { kor: "소듐라우릴설페이트",       eng: "sodium lauryl sulfate",           type: "base" },
  { kor: "소듐라우레스설페이트",     eng: "sodium laureth sulfate",          type: "base" },
  { kor: "암모늄라우릴설페이트",     eng: "ammonium lauryl sulfate",         type: "base" },
  { kor: "암모늄라우레스설페이트",   eng: "ammonium laureth sulfate",        type: "base" },

  // ── 규제 성분 ────────────────────────────────────────────
  { kor: "파라벤",                   eng: "paraben",                         type: "regulated" },
  { kor: "메틸파라벤",               eng: "methylparaben",                   type: "regulated" },
  { kor: "프로필파라벤",             eng: "propylparaben",                   type: "regulated" },
  { kor: "부틸파라벤",               eng: "butylparaben",                    type: "regulated" },
  { kor: "에틸파라벤",               eng: "ethylparaben",                    type: "regulated" },
  { kor: "트리클로산",               eng: "triclosan",                       type: "regulated" },
  { kor: "포름알데히드",             eng: "formaldehyde",                    type: "regulated" },
  { kor: "하이드로퀴논",             eng: "hydroquinone",                    type: "regulated" },
  { kor: "옥시벤존",                 eng: "oxybenzone",                      type: "regulated" },
  { kor: "BHA",                     eng: "butylated hydroxyanisole",          type: "regulated" },
];
