import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, ZoomIn } from "react-native-reanimated";

export default function LandingPage() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false} 
        pagingEnabled={false}
      >
        
        {/* PAGE 1: FULL SCREEN HERO IMAGE */}
        <View style={[styles.fullHero, { height: height, width: width }]}>
          <Image
            source={require("../../assets/images/Safety-At-Work.jpg")}
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
            style={StyleSheet.absoluteFill}
          />
          
          <SafeAreaView style={styles.navBar}>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#00A86B" />
              </View>
              <Text style={styles.logoText}>SafeGuard AI</Text>
            </Animated.View>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <Animated.View entering={FadeInLeft.delay(300).duration(1000)}>
              <Text style={styles.badgeText}>FUTURE OF INDUSTRIAL SAFETY</Text>
              <Text style={styles.heroTitle}>
                Zero Accidents{"\n"}
                Through <Text style={{ color: "#00FF88" }}>AI Intelligence.</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Deploying advanced computer vision and geofencing to protect lives in high-risk environments.
              </Text>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(600).duration(800)} 
              style={styles.buttonContainer}
            >
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.primaryBtnText}>Initialize System</Text>
                <Ionicons name="rocket-outline" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryBtnText}>Personnel Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(1200)} style={styles.scrollIndicator}>
            <Text style={styles.scrollText}>Swipe up to explore</Text>
            <Ionicons name="chevron-down" size={20} color="#00FF88" />
          </Animated.View>
        </View>

        {/* PAGE 2: CORE FEATURES (SIMPLE CARDS) */}
        <View style={[styles.pageSection, { width: width }]}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Compliance</Text>
            <Text style={styles.sectionSubtitle}>Seamlessly integrated safety protocols.</Text>
          </Animated.View>

          <View style={styles.featureGrid}>
            <SimpleFeatureCard 
              icon="camera-outline" 
              title="PPE Detection" 
              desc="Real-time helmet & vest verification."
              color="#F0FFF4"
              iconColor="#00A86B"
              delay={300}
            />
            <SimpleFeatureCard 
              icon="map-outline" 
              title="Risk Zones" 
              desc="Dynamic geofencing alert system."
              color="#EBF8FF"
              iconColor="#3182CE"
              delay={400}
            />
            <SimpleFeatureCard 
              icon="book-outline" 
              title="AI Training" 
              desc="Interactive safety SOP modules."
              color="#FAF5FF"
              iconColor="#805AD5"
              delay={500}
            />
            <SimpleFeatureCard 
              icon="flash-outline" 
              title="Rapid SOS" 
              desc="Instant emergency escalation."
              color="#FFF5F5"
              iconColor="#E53E3E"
              delay={600}
            />
          </View>
        </View>

        {/* PAGE 3: IMAGE BANNER SECTIONS (MISSION & IMPACT) */}
        <Animated.View entering={FadeInUp} style={[styles.bannerContainer, { width: width - 40 }]}>
          <ImageBackground 
            source={require("../../assets/images/safety.jpg")} 
            style={styles.bannerImage}
          >
            <LinearGradient colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
            <View style={styles.bannerContent}>
              <Animated.View entering={ZoomIn.delay(400)}>
                <Text style={styles.bannerBadge}>OUR MISSION</Text>
                <Text style={styles.bannerTitle}>Protecting Every Life</Text>
                <Text style={styles.bannerDesc}>
                  Our AI technology works tirelessly to ensure that every worker returns home safely, every single day.
                </Text>
              </Animated.View>
            </View>
          </ImageBackground>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={FadeInUp} style={[styles.bannerContainer, { width: width - 40 }]}>
          <ImageBackground 
            source={require("../../assets/images/istockphoto-2212563380-612x612.jpg")} 
            style={styles.bannerImage}
          >
            <LinearGradient colors={["rgba(0,168,107,0.3)", "rgba(0,0,0,0.8)"]} style={StyleSheet.absoluteFill} />
            <View style={styles.bannerContent}>
              <Animated.View entering={ZoomIn.delay(600)}>
                <Text style={styles.bannerBadge}>THE IMPACT</Text>
                <Text style={styles.bannerTitle}>Reduced Incident Rate</Text>
                <Text style={styles.bannerDesc}>
                  Implementing SafeGuard AI leads to a 60% reduction in safety violations within the first month.
                </Text>
              </Animated.View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>© 2026 SafeGuard Industrial AI System</Text>
          <Text style={styles.footerSub}>Reinventing Industrial Compliance</Text>
        </View>
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function SimpleFeatureCard({ icon, title, desc, color, iconColor, delay }: any) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={[styles.simpleCard, { backgroundColor: color }]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={[styles.simpleTitle, { color: iconColor }]}>{title}</Text>
      <Text style={styles.simpleDesc}>{desc}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: 0, alignItems: 'center' },
  
  // PAGE 1: FULL HERO
  fullHero: {
    justifyContent: "center",
    paddingHorizontal: 30,
    overflow: 'hidden',
  },
  navBar: {
    position: 'absolute',
    top: 50,
    left: 30,
    right: 30,
    zIndex: 10,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  logoText: { marginLeft: 15, fontSize: 20, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5 },
  heroContent: { marginTop: 40 },
  badgeText: { color: "#00FF88", fontSize: 13, fontWeight: "900", letterSpacing: 2.5, marginBottom: 20 },
  heroTitle: { fontSize: 48, fontWeight: "900", color: "#FFFFFF", lineHeight: 56, letterSpacing: -1 },
  heroSubtitle: { fontSize: 18, color: "rgba(255,255,255,0.75)", marginTop: 25, lineHeight: 28 },
  buttonContainer: { marginTop: 50, gap: 15 },
  primaryBtn: { backgroundColor: "#00A86B", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, borderRadius: 25, gap: 10, shadowColor: "#00A86B", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  secondaryBtn: { backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 20, borderRadius: 25, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  secondaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  scrollIndicator: { position: 'absolute', bottom: 40, alignSelf: 'center', alignItems: 'center' },
  scrollText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 5, fontWeight: '700' },

  // PAGE 2: FEATURES
  pageSection: { paddingHorizontal: 25, paddingVertical: 80, backgroundColor: '#fff' },
  sectionHeader: { marginBottom: 40, alignItems: 'center' },
  sectionTitle: { fontSize: 32, fontWeight: "900", color: "#1A1A1A" },
  sectionSubtitle: { fontSize: 16, color: "#888", marginTop: 8 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  simpleCard: { width: "48%", padding: 25, borderRadius: 35, marginBottom: 15, elevation: 2 },
  iconCircle: { width: 54, height: 54, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  simpleTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  simpleDesc: { fontSize: 13, color: "#666", lineHeight: 18 },

  // PAGE 3: BANNERS
  bannerContainer: { height: 350, maxWidth: 600, alignSelf: 'center', borderRadius: 40, overflow: 'hidden', elevation: 10, marginVertical: 10 },
  bannerImage: { width: '100%', height: '100%', justifyContent: 'center', padding: 30 },
  bannerContent: { zIndex: 1 },
  bannerBadge: { color: '#00FF88', fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  bannerTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 15 },
  bannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22 },
  spacer: { height: 20 },

  // FOOTER
  footer: { marginTop: 80, alignItems: "center", paddingBottom: 40 },
  footerLine: { width: 60, height: 4, backgroundColor: '#00A86B', borderRadius: 2, marginBottom: 25 },
  footerText: { color: "#1A1A1A", fontSize: 14, fontWeight: '800' },
  footerSub: { color: "#AAA", fontSize: 12, marginTop: 5 },
});
