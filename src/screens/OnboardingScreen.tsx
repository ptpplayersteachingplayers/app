import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ImageBackground, TouchableOpacity, ViewToken, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { PrimaryButton } from '../components';
import { colors, spacing, typography } from '../theme';
import { ONBOARDING_SLIDES, LOGO } from '../constants/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_COMPLETE_KEY = 'ptp_onboarding_complete';

interface OnboardingScreenProps { onComplete: () => void; }

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const handleComplete = async () => {
    try { await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true'); } catch {}
    onComplete();
  };

  const handleNext = () => {
    if (isLastSlide) { handleComplete(); }
    else { flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true }); }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) { setActiveIndex(viewableItems[0].index); }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: { item: typeof ONBOARDING_SLIDES[number] }) => (
    <ImageBackground source={{ uri: item.image }} style={styles.slide} resizeMode="cover">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.slideContent}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: LOGO.primary }} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      <FlatList ref={flatListRef} data={ONBOARDING_SLIDES} renderItem={renderSlide} keyExtractor={(_, i) => i.toString()}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig} getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        snapToInterval={SCREEN_WIDTH} decelerationRate="fast" />
      <SafeAreaView style={styles.controls} edges={['bottom']}>
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, i) => <View key={i} style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]} />)}
        </View>
        <View style={styles.buttonsContainer}>
          {!isLastSlide && <TouchableOpacity onPress={handleComplete} style={styles.skipButton}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>}
          <PrimaryButton title={isLastSlide ? 'Get Started' : 'Next'} onPress={handleNext} style={styles.nextButton} />
        </View>
      </SafeAreaView>
    </View>
  );
};

export const checkOnboardingComplete = async (): Promise<boolean> => {
  try { const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY); return value === 'true'; } catch { return false; }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  slide: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  overlay: { flex: 1, backgroundColor: 'rgba(14, 15, 17, 0.5)' },
  slideContent: { flex: 1, justifyContent: 'space-between', paddingBottom: 140 },
  logoContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  logo: { width: 100, height: 70 },
  textContainer: { paddingHorizontal: spacing.xxl, alignItems: 'center' },
  title: { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, color: colors.white, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.lg, color: colors.white, opacity: 0.9, textAlign: 'center', maxWidth: 320 },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  dotInactive: { backgroundColor: 'rgba(255, 255, 255, 0.4)', width: 8 },
  buttonsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipButton: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  skipText: { fontSize: typography.sizes.md, color: colors.white, opacity: 0.8 },
  nextButton: { flex: 1, marginLeft: spacing.lg },
});

export default OnboardingScreen;
