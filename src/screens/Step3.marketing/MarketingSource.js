import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import TopBar from "../../components/TopBar";
import { colors } from "../../styles";

const API_URL = "https://finalteam4-production-e6c4.up.railway.app";

function ParsedText({ text, baseStyle, coralStyle }) {
  if (!text) return null;
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[(.+)\]\]$/);
        return match ? <Text key={i} style={coralStyle}>{match[1]}</Text> : part;
      })}
    </Text>
  );
}

export default function MarketingSource({ persona, product, onBack }) {
  const p = persona || { name: "MJ Beauty", platform: "Instagram", color: colors.coral };
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!p?.name) return;
    setLoading(true);
    fetch(`${API_URL}/buyer/marketing-source`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        influencer_name:   p.name,
        persona:           p.persona || "",
        cosine_score:      p.cosine_score || 0,
        market_share:      p.market_share || 0,
        platform:          p.platform || "Instagram",
        followers:         String(p.followers || "50"),
        content_direction: p.content_direction || "",
        h01_risk:          p.h01_risk || "",
        target_audience:   p.target_audience || "",
        product_name:      product?.name || "",
        product_brand:     product?.brand || "",
        category_main_id:  p.category_main_id || 1,
      }),
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [p?.name]);

  const channels = data?.channels || [
    { name: "Instagram", pct: 48, color: "#1C1C1E" },
    { name: "TikTok",    pct: 34, color: "#8E8E93" },
    { name: "YouTube",   pct: 18, color: "#D1D1D6" },
  ];
  const keywords = data?.keywords || [];
  const scores   = data?.scores   || [
    { label: "트렌드 일치", score: 94, color: colors.coral },
    { label: "타깃 유사도", score: 87, color: "#A855F7" },
    { label: "시장 도달",   score: 78, color: "#3B82F6" },
    { label: "콘텐츠 적합", score: 82, color: colors.mint },
  ];
  const reach    = data?.reach    || [
    { label: "예상 노출 수", val: "—", sub: "7일 기준" },
    { label: "예상 리치",   val: "—", sub: "유니크 유저" },
  ];

  return (
    <View style={s.screen}>
      <TopBar light titleLeft={false} title="마케팅 소스" onBack={onBack} />

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* 페르소나 요약 */}
        <View style={[s.secBlock, { borderTopWidth: 0, paddingTop: 20 }]}>
          {/* 매칭 상품 정보 */}
          <View style={{ backgroundColor: "#F8F8F8", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, color: colors.coral, fontWeight: "600", marginBottom: 4 }}>매칭 상품</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E", marginBottom: 2 }}>
              {product?.name || "—"}
            </Text>
            <Text style={{ fontSize: 12, color: "#8E8E93" }}>
              {product?.brand || "—"}{product?.cat ? ` · ${product.cat}` : ""}
            </Text>
          </View>
          <View style={s.personaRow}>
            {p.image ? (
              <Image source={{ uri: p.image }} style={s.personaAvatar} />
            ) : (
              <View style={[s.personaAvatar, { backgroundColor: p.color || colors.coral, alignItems: "center", justifyContent: "center" }]}>
                <Text style={s.personaInitial}>{p.name?.charAt(0) || "M"}</Text>
              </View>
            )}
            <View>
              <Text style={s.personaName}>{p.name}</Text>
              <Text style={s.personaChannel}>{p.platform} · EDA 분석 결과</Text>
            </View>
          </View>
        </View>

        {/* AI 분석 기반 배지 */}
        <View style={s.aiBanner}>
          <Text style={s.aiStar}>✦</Text>
          <Text style={s.aiBannerText}>본 리포트는 미국 소비자 리뷰 EDA + AI 분석을 기반으로 자동 산출되었습니다.</Text>
        </View>

        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color={colors.coral} />
            <Text style={{ fontSize: 12, color: colors.grayMid, marginTop: 10 }}>AI 분석 중...</Text>
          </View>
        )}

        {!loading && (
          <>
            {/* ── 덩어리 1: AI 캠페인 전략 ── */}
            {data?.strategy && (
              <View style={s.secBlock}>
                <View style={s.secHeader}>
                  <Text style={s.secLabel}>AI 캠페인 전략</Text>
                  <Text style={s.secSub}>GPT-4o 기반</Text>
                </View>
                <ParsedText
                  text={data.strategy}
                  baseStyle={s.strategyText}
                  coralStyle={[s.strategyText, { color: colors.coral, fontWeight: "700" }]}
                />
              </View>
            )}

            {/* ── 덩어리 2: 데이터 시각화 — 구분 헤더 ── */}
            <View style={s.vizHeader}>
              <View style={s.vizDivider} />
              <Text style={s.vizLabel}>전략 기반 데이터 분석</Text>
              <View style={s.vizDivider} />
            </View>

            {/* 채널 분석 */}
            <View style={[s.secBlock, { borderTopWidth: 0 }]}>
              <View style={s.secHeader}>
                <Text style={s.secLabel}>타깃 채널 분석</Text>
                <Text style={s.secSub}>EDA + AI 기반</Text>
              </View>
              {channels.map((ch, i) => (
                <View key={i} style={[s.channelRow, { marginBottom: i < channels.length - 1 ? 14 : 0 }]}>
                  <Text style={s.channelName}>{ch.name}</Text>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${ch.pct}%`, backgroundColor: ch.color }]} />
                  </View>
                  <Text style={s.channelPct}>{ch.pct}%</Text>
                </View>
              ))}
            </View>

            {/* 콘텐츠 전략 키워드 */}
            {keywords.length > 0 && (
              <View style={s.secBlock}>
                <View style={s.secHeader}>
                  <Text style={s.secLabel}>콘텐츠 전략 키워드</Text>
                  <Text style={s.secSub}>AI + EDA Top 5</Text>
                </View>
                {keywords.map((h, i) => (
                  <View key={i} style={[s.hashRow, { borderBottomWidth: i < keywords.length - 1 ? 0.5 : 0, borderBottomColor: "#F8F8F8" }]}>
                    <Text style={s.hashNum}>{i + 1}</Text>
                    <Text style={s.hashTag}>{h.tag}</Text>
                    <Text style={s.hashVolume}>{h.volume}</Text>
                    <View style={s.hashTrend}>
                      <Text style={s.hashTrendText}>{h.trend}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 포지셔닝 점수 */}
            <View style={s.secBlock}>
              <View style={s.secHeader}>
                <Text style={s.secLabel}>포지셔닝 분석</Text>
                <Text style={s.secSub}>경쟁사 대비</Text>
              </View>
              <View style={s.scoreGrid}>
                {scores.map((item) => (
                  <View key={item.label} style={s.scoreCard}>
                    <Text style={s.scoreCardLabel}>{item.label}</Text>
                    <Text style={[s.scoreCardVal, { color: item.color }]}>{item.score}</Text>
                    <View style={s.scoreBarBg}>
                      <View style={[s.scoreBarFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 예상 도달 수치 */}
            <View style={[s.secBlock, { paddingBottom: 0 }]}>
              <View style={s.secHeader}>
                <Text style={s.secLabel}>예상 도달 수치</Text>
                <Text style={s.secSub}>7일 캠페인 기준</Text>
              </View>
              <View style={s.reachGrid}>
                {reach.map((r) => (
                  <View key={r.label} style={s.reachCard}>
                    <Text style={s.reachLabel}>{r.label}</Text>
                    <Text style={s.reachVal}>{r.val}</Text>
                    <Text style={s.reachSub}>{r.sub}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.btnPrimary}>
          <Text style={s.btnPrimaryText}>캠페인 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// ⛔ STYLES — DO NOT MODIFY | 스타일 수정 시 반드시 주석으로 변경 내역 기록
// 변경 예시: // [STYLE CHANGED: 카드 배경색 #F8F8F8 → #F2F2F7 — 디자인 요청]
// ─────────────────────────────────────────────────────────────
const s = {
  screen: { flex: 1, backgroundColor: "#fff" },
  body: { flex: 1, paddingHorizontal: 28 },
  secBlock: { paddingVertical: 24, borderTopWidth: 1, borderTopColor: "#D8D8DE" },
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#D8D8DE", marginBottom: 20 },
  secLabel: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  secSub: { fontSize: 11, color: colors.grayMid },

  // ─── 페르소나 요약 헤더 ──────────────────────────────────
  personaRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  personaAvatar: { width: 48, height: 48, borderRadius: 24 },
  personaInitial: { fontSize: 20, fontWeight: "700", color: "#fff" },
  personaName: { fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginBottom: 3 },
  personaChannel: { fontSize: 12, color: colors.grayMid },

  // ─── AI 캠페인 전략 텍스트 ──────────────────────────────
  strategyText: { fontSize: 13, color: "#3A3A3A", lineHeight: 21 },

  // ─── 두 덩어리 사이 구분선 ──────────────────────────────
  vizHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 8 },
  vizDivider: { flex: 1, height: 1, backgroundColor: "#E5E5EA" },
  vizLabel: { fontSize: 10, fontWeight: "600", color: "#A0A0A8", letterSpacing: 0.8 },

  // ─── 타깃 채널 분석 — 수평 바 ───────────────────────────
  channelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  channelName: { fontSize: 13, color: "#1C1C1E", width: 80 },
  barBg: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 4, height: 6 },
  barFill: { borderRadius: 4, height: 6 },
  channelPct: { fontSize: 12, fontWeight: "700", color: "#1C1C1E", width: 34, textAlign: "right" },

  // ─── 콘텐츠 전략 키워드 — 해시태그 순위 리스트 ──────────
  hashRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  hashNum: { fontSize: 12, fontWeight: "700", color: colors.coral, width: 18 },
  hashTag: { flex: 1, fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
  hashVolume: { fontSize: 12, color: colors.grayMid, width: 44 },
  hashTrend: { backgroundColor: "#E6FAF5", borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  hashTrendText: { fontSize: 11, fontWeight: "700", color: "#0A7A5A" },

  // ─── 포지셔닝 점수 — 2열 카드 그리드 ───────────────────
  scoreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  scoreCard: { width: "47.5%", backgroundColor: "#F8F8F8", borderRadius: 12, padding: 14 },
  scoreCardLabel: { fontSize: 11, color: colors.grayMid, marginBottom: 8 },
  scoreCardVal: { fontSize: 28, fontWeight: "700", marginBottom: 8, letterSpacing: -1 },
  scoreBarBg: { backgroundColor: "#E5E5EA", borderRadius: 4, height: 4 },
  scoreBarFill: { borderRadius: 4, height: 4 },

  // ─── 예상 도달 수치 — 가로 2칸 카드 ────────────────────
  reachGrid: { flexDirection: "row", gap: 12 },
  reachCard: { flex: 1, backgroundColor: "#F8F8F8", borderRadius: 12, padding: 16 },
  reachLabel: { fontSize: 11, color: colors.grayMid, marginBottom: 8 },
  reachVal: { fontSize: 24, fontWeight: "700", color: "#1C1C1E", marginBottom: 4, letterSpacing: -0.5 },
  // [STYLE CHANGED: fontSize 10 → 11 — iOS 최소 폰트 11pt 준수]
  reachSub: { fontSize: 11, color: colors.grayMid },

  // ─── AI 분석 기반 배지 ──────────────────────────────────────
  aiBanner: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#FEF0F0", borderRadius: 10, padding: 12, marginBottom: 20 },
  aiStar: { fontSize: 12, color: colors.coral, marginTop: 1 },
  aiBannerText: { flex: 1, fontSize: 12, color: colors.coral, fontWeight: "500", lineHeight: 18 },

  // ─── 하단 캠페인 시작 버튼 ──────────────────────────────
  bottomBar: { paddingTop: 14, paddingBottom: 36, paddingHorizontal: 28, borderTopWidth: 0.5, borderTopColor: "#D8D8DE" },
  btnPrimary: { backgroundColor: colors.coral, borderRadius: 8, paddingVertical: 17, alignItems: "center" },
  btnPrimaryText: { fontSize: 15, fontWeight: "600", color: "#fff" },
};
