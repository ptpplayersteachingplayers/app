import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, Badge } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { CampsStackParamList } from '../types';

type Props = NativeStackScreenProps<CampsStackParamList, 'CampDetail'>;

const CampDetailScreen: React.FC<Props> = ({ route }) => {
  const { camp } = route.params;

  const handleRegister = async () => {
    if (camp.product_url) {
      try { const supported = await Linking.canOpenURL(camp.product_url); if (supported) await Linking.openURL(camp.product_url);
        else Alert.alert('Unable to Open', 'Please visit ptpsummercamps.com to register.');
      } catch { Alert.alert('Error', 'Unable to open registration page.'); }
    } else {
      Alert.alert('Register', 'To register for this camp, please visit ptpsummercamps.com', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Visit Website', onPress: () => Linking.openURL('https://ptpsummercamps.com') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {camp.image ? (
          <Image source={{ uri: camp.image }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroImagePlaceholder]}><Text style={styles.heroPlaceholderText}>PTP</Text></View>
        )}
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            {camp.bestseller && <Badge label="Best Seller" variant="bestseller" style={styles.badge} />}
            {camp.almost_full && <Badge label="Almost Full" variant="almostFull" style={styles.badge} />}
          </View>
          <Text style={styles.title}>{camp.name}</Text>
          <Text style={styles.price}>{camp.price}</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Camp Details</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{camp.date || 'TBD'}</Text></View>
            {camp.time && <View style={styles.detailRow}><Text style={styles.detailLabel}>Time</Text><Text style={styles.detailValue}>{camp.time}</Text></View>}
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{camp.location}{camp.state ? `, ${camp.state}` : ''}</Text></View>
          </View>
          {camp.description && <View style={styles.descriptionSection}><Text style={styles.sectionTitle}>About This Camp</Text><Text style={styles.description}>{camp.description}</Text></View>}
        </View>
      </ScrollView>
      <View style={styles.bottomCta}>
        <View style={styles.bottomCtaContent}>
          <View><Text style={styles.bottomPrice}>{camp.price}</Text><Text style={styles.bottomPriceLabel}>per camper</Text></View>
          <PrimaryButton title="Register Now" onPress={handleRegister} style={styles.registerButton} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  scrollView: { flex: 1 },
  heroImage: { width: '100%', height: 220, backgroundColor: colors.border },
  heroImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  heroPlaceholderText: { fontSize: 48, fontWeight: typography.weights.bold, color: colors.primary },
  content: { padding: spacing.xl, paddingBottom: 120 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  badge: { marginRight: spacing.sm, marginBottom: spacing.xs },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.ink, marginBottom: spacing.sm },
  price: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: spacing.xl },
  detailsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  detailsTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.ink, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: typography.sizes.sm, color: colors.gray },
  detailValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.ink, textAlign: 'right', flex: 1, marginLeft: spacing.md },
  descriptionSection: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.ink, marginBottom: spacing.md },
  description: { fontSize: typography.sizes.md, color: colors.gray },
  bottomCta: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, paddingBottom: spacing.xl },
  bottomCtaContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomPrice: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.ink },
  bottomPriceLabel: { fontSize: typography.sizes.xs, color: colors.gray },
  registerButton: { minWidth: 160 },
});

export default CampDetailScreen;
