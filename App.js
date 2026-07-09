import { useState, useEffect } from "react";
import { View, StatusBar, Dimensions, Text } from "react-native";
import { colors as dsColors } from "./src/styles";
import { useFonts } from "expo-font";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import EntryScreen      from "./src/screens/EntryScreen";
import BrandHome        from "./src/screens/Step1.brand/BrandHome";
import BrandProductList from "./src/screens/Step1.brand/BrandProductList";
import Step1            from "./src/screens/Step1.brand/Step1ProductBasic";
import Step2            from "./src/screens/Step1.brand/Step2Ingredients";
import Step3            from "./src/screens/Step1.brand/Step3FitScore";
import BuyerHome        from "./src/screens/Step2.buyer/BuyerHome";
import BuyerProductList from "./src/screens/Step2.buyer/BuyerProductList";
import BuyerNegotiation from "./src/screens/Step2.buyer/BuyerNegotiation";
import BuyerTrend       from "./src/screens/Step2.buyer/BuyerTrend";
import BuyerAiMode      from "./src/screens/Step2.buyer/BuyerAiMode";
import NotificationBanner  from "./src/components/NotificationBanner";
import MarketingTab        from "./src/screens/Step3.marketing/MarketingTab";
import MarketingInfluencer from "./src/screens/Step3.marketing/MarketingInfluencer";
import MarketingSource     from "./src/screens/Step3.marketing/MarketingSource";
import BuyerInfluencer     from "./src/screens/Step2.buyer/BuyerInfluencer";

const SCREEN_W = Dimensions.get("window").width;
const DESIGN_W = 390; // iPhone 14 기준 (pt)

export default function App() {
  const [fontsLoaded] = useFonts({
    "SF-Pro": require("./assets/fonts/SF-Pro.ttf"),
  });

  const [role, setRole]                       = useState(null);
  const [screen, setScreen]                   = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [matchingAlert, setMatchingAlert]     = useState(false);
  const [step1Form, setStep1Form]             = useState(null);
  const [step2Ingredients, setStep2Ingredients] = useState([]);
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [selectedBrandProduct, setSelectedBrandProduct]       = useState(null);
  const [deletedProductIds, setDeletedProductIds]             = useState(new Set());
  const [selectedMarketingProduct, setSelectedMarketingProduct] = useState(null);
  const [marketingSourceOrigin, setMarketingSourceOrigin]     = useState("buyer_marketing");

  // 폰트 로드 완료 후 모든 Text의 기본 폰트를 SF-Pro로 지정
  useEffect(() => {
    if (fontsLoaded) {
      Text.defaultProps = Text.defaultProps ?? {};
      Text.defaultProps.style = { fontFamily: "SF-Pro" };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const goHome = () => { setRole(null); setScreen(null); setMatchingAlert(false); };

  const handleBrandTab = (tab) => {
    if (tab === "홈")      return setScreen("brand_home");
    if (tab === "상품등록") return setScreen("step1");
    if (tab === "상품")    return setScreen("brand_products");
    if (tab === "트렌드")  return setScreen("brand_home");
    if (tab === "MY")  return setScreen("brand_home");
  };

  const handleBuyerTab = (tab) => {
    const map = {
      "홈":     "buyer_home",
      "탐색":   "buyer_list",
      "AI":     "buyer_ai",
      "마케팅": "buyer_marketing",
      "MY":     "buyer_influencer",
    };
    if (map[tab]) setScreen(map[tab]);
  };

  const renderScreen = () => {
    if (!role) {
      return (
        <EntryScreen
          onBrand={() => { setRole("brand"); setScreen("brand_home"); }}
          onBuyer={() => { setRole("buyer"); setScreen("buyer_home"); }}
        />
      );
    }

    if (role === "brand") {
      if (screen === "brand_products") return (
        <BrandProductList
          onTab={handleBrandTab}
          onBack={() => setScreen("brand_home")}
          onProductDetail={(p) => {
            setSelectedBrandProduct(p);
            setScreen("brand_product_detail");
          }}
          onFab={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("step1"); }}
          registeredProducts={registeredProducts}
          deletedProductIds={deletedProductIds}
        />
      );
      if (screen === "brand_product_detail") return (
        <Step3
          viewMode={true}
          viewProduct={selectedBrandProduct}
          onBack={() => setScreen("brand_products")}
          onHome={() => setScreen("brand_home")}
          onEdit={() => {
            setStep1Form({
              productName: selectedBrandProduct?.name || "",
              brandName:   selectedBrandProduct?.brand || "",
              subCategory: selectedBrandProduct?.cat || "",
              category:    selectedBrandProduct?.category || "",
            });
            setStep2Ingredients([]);
            setScreen("step1");
          }}
          onDelete={(pid) => {
            if (pid) setDeletedProductIds(prev => new Set([...prev, pid]));
            setRegisteredProducts(prev => prev.filter(p => p.id !== pid));
            setScreen("brand_products");
          }}
        />
      );
      if (screen === "brand_home") return (
        <BrandHome
          onTab={handleBrandTab}
          onRegister={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("step1"); }}
          onProductDetail={() => setScreen("step1")}
          onTitlePress={goHome}
          onFab={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("step1"); }}
        />
      );
      if (screen === "step1") return <Step1
        onBack={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("brand_home"); }}
        onNext={() => setScreen("step2")}
        initialForm={step1Form}
        onFormChange={setStep1Form}
      />;
      if (screen === "step2") return <Step2
        onBack={() => setScreen("step1")}
        onNext={() => setScreen("step3")}
        initialIngredients={step2Ingredients}
        onIngredientsChange={setStep2Ingredients}
      />;
      if (screen === "step3") return <Step3
        onBack={() => setScreen("step2")}
        onReset={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("step1"); }}
        onHome={() => { setStep1Form(null); setStep2Ingredients([]); setScreen("brand_home"); }}
        onRegister={(registeredProduct) => {
          if (registeredProduct) setRegisteredProducts(prev => [...prev, {
            ...registeredProduct,
            activeIngredients: step2Ingredients.filter(i => i.type === "active").map(i => i.name),
          }]);
          setStep1Form(null);
          setStep2Ingredients([]);
          setScreen("brand_products");
        }}
        product={step1Form}
        ingredients={step2Ingredients}
      />;
    }

    if (role === "buyer") {
      if (screen === "buyer_home") return (
        <BuyerHome
          onTab={handleBuyerTab}
          matchingAlert={matchingAlert}
          onProductDetail={(p) => { setSelectedProduct(p); setScreen("buyer_nego"); }}
          onTitlePress={goHome}
        />
      );
      if (screen === "buyer_list") return (
        <BuyerProductList
          onTab={handleBuyerTab}
          onMatchRequest={() => { setScreen("buyer_home"); setTimeout(() => setMatchingAlert(true), 5000); }}
        />
      );
      if (screen === "buyer_nego") return (
        <BuyerNegotiation
          product={selectedProduct}
          onBack={() => setScreen("buyer_list")}
          onMatchRequest={() => { setScreen("buyer_home"); setTimeout(() => setMatchingAlert(true), 5000); }}
        />
      );
      if (screen === "buyer_ai") return (
        <BuyerAiMode
          onTab={handleBuyerTab}
          onBack={() => setScreen("buyer_home")}
          onMatchRequest={() => { setScreen("buyer_home"); setTimeout(() => setMatchingAlert(true), 5000); }}
        />
      );
      if (screen === "buyer_trend")    return <BuyerTrend onTab={handleBuyerTab} />;
      if (screen === "buyer_influencer") return (
        <BuyerInfluencer
          onTab={handleBuyerTab}
          onTitlePress={goHome}
        />
      );
      if (screen === "buyer_marketing") return (
        <MarketingTab
          onTab={handleBuyerTab}
          onProductSelect={(p) => {
            setSelectedMarketingProduct(p);
            setScreen("marketing_influencer");
          }}
          onCampaignReport={(p) => {
            setSelectedMarketingProduct(p);
            setMarketingSourceOrigin("buyer_marketing");
            setScreen("marketing_source");
          }}
        />
      );
      if (screen === "marketing_influencer") return (
        <MarketingInfluencer
          product={selectedMarketingProduct}
          onBack={() => setScreen("buyer_marketing")}
          onPersonaDetail={(p) => {
            setSelectedPersona(p);
            setMarketingSourceOrigin("marketing_influencer");
            setScreen("marketing_source");
          }}
        />
      );
      if (screen === "marketing_source") return (
        <MarketingSource
          persona={selectedPersona}
          product={selectedMarketingProduct}
          onBack={() => setScreen(marketingSourceOrigin)}
        />
      );
    }

    return null;
  };

  const isBrandHome = screen === "brand_home";
  const notchBg = isBrandHome ? dsColors.coral : "#fff";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: notchBg }} edges={["top"]}>
        <StatusBar barStyle={isBrandHome ? "light-content" : "dark-content"} backgroundColor={notchBg} />
        {/* iPhone 14 기준(390pt) 고정 — 넓은 화면에서는 중앙 정렬 */}
        <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center" }}>
          <View style={{ flex: 1, width: Math.min(SCREEN_W, DESIGN_W), backgroundColor: "#fff" }}>
            {renderScreen()}
            <NotificationBanner
              visible={matchingAlert}
              onDismiss={() => setMatchingAlert(false)}
              onPress={() => { setMatchingAlert(false); handleBuyerTab("마케팅"); }}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
