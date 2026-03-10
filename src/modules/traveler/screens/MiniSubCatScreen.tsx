/**
 * ============================================================
 * MiniSubCatScreen - 副貓圖鑑畫面
 * ============================================================
 * #060 副貓圖鑑
 *
 * 功能：
 * - 顯示副貓收集進度（進度條 + 計數）
 * - 類型篩選（全部 / 探索 / 資源 / 功能 / 福利）
 * - 2 欄 Grid 顯示副貓卡片（已擁有 vs 未擁有）
 * - 點擊已擁有副貓顯示詳情 Modal
 * - 加成效果總覽
 * - 下拉刷新
 *
 * 串接 API：
 * - GET /api/mini/sub-cats/catalog    → useSubCatCatalog(type?)
 * - GET /api/mini/sub-cats/collection → useSubCatCollection()
 * - GET /api/mini/sub-cats/bonuses    → useSubCatBonuses()
 *
 * 更新日期：2026-03-10
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../context/AppContext';
import {
  useSubCatCatalog,
  useSubCatCollection,
  useSubCatBonuses,
} from '../../../hooks/useMiniQueries';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { BOTTOM_SPACER_HEIGHT } from '../../../constants/businessDefaults';
import type { SubCat, SubCatType, SubCatRarity } from '../../../types/mini';

// ============ 常數 ============

/** 稀有度色彩對照 */
const RARITY_COLORS: Record<SubCatRarity, string> = {
  common: '#A0A0A0',
  rare: '#4A90D9',
  epic: '#9B59B6',
  legendary: '#F39C12',
};

/** 類型篩選選項 */
interface TypeFilterOption {
  key: SubCatType | 'all';
  label: string;
}

/** Grid 間距常數 */
const GRID_GAP = Spacing.md;
const GRID_PADDING = Spacing.lg;

// ============ 主元件 ============

export function MiniSubCatScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Grid 欄位計算（依螢幕寬度動態計算）
  const cardWidth = (screenWidth - GRID_PADDING * 2 - GRID_GAP) / 2;

  // 稀有度顯示名稱（i18n）
  const rarityLabels: Record<SubCatRarity, string> = useMemo(() => ({
    common: (t as Record<string, string>).mini_subCatRarityCommon || '普通',
    rare: (t as Record<string, string>).mini_subCatRarityRare || '稀有',
    epic: (t as Record<string, string>).mini_subCatRarityEpic || '史詩',
    legendary: (t as Record<string, string>).mini_subCatRarityLegendary || '傳說',
  }), [t]);

  // 類型篩選選項（i18n）
  const typeFilters: TypeFilterOption[] = useMemo(() => [
    { key: 'all', label: (t as Record<string, string>).mini_subCatAll || '全部' },
    { key: 'exploration', label: (t as Record<string, string>).mini_subCatExploration || '探索' },
    { key: 'resource', label: (t as Record<string, string>).mini_subCatResource || '資源' },
    { key: 'function', label: (t as Record<string, string>).mini_subCatFunction || '功能' },
    { key: 'benefit', label: (t as Record<string, string>).mini_subCatBenefit || '福利' },
  ], [t]);

  // 篩選狀態
  const [selectedType, setSelectedType] = useState<SubCatType | 'all'>('all');
  const [detailCat, setDetailCat] = useState<SubCat | null>(null);

  // Query
  const catalogType = selectedType === 'all' ? undefined : selectedType;
  const catalogQuery = useSubCatCatalog(catalogType);
  const collectionQuery = useSubCatCollection();
  const bonusesQuery = useSubCatBonuses();

  const catalog = catalogQuery.data?.catalog ?? [];
  const collection = collectionQuery.data?.collection ?? [];
  const meta = collectionQuery.data?.meta;
  const bonusesData = bonusesQuery.data?.bonuses;

  // 合併目錄與收集狀態：以 catalog 為基礎，標記 owned
  const mergedCats = useMemo(() => {
    const ownedIds = new Set(collection.filter((c) => c.owned).map((c) => c.id));
    return catalog.map((cat) => ({
      ...cat,
      owned: ownedIds.has(cat.id) || cat.owned === true,
    }));
  }, [catalog, collection]);

  // 收集進度
  const totalCount = meta?.totalCount ?? mergedCats.length;
  const ownedCount = meta?.ownedCount ?? mergedCats.filter((c) => c.owned).length;
  const progressPercent = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  // ========== 事件處理 ==========

  const handleRefresh = useCallback(() => {
    catalogQuery.refetch();
    collectionQuery.refetch();
    bonusesQuery.refetch();
  }, [catalogQuery, collectionQuery, bonusesQuery]);

  const handleCatPress = useCallback((cat: SubCat) => {
    if (cat.owned) {
      setDetailCat(cat);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailCat(null);
  }, []);

  // ========== 翻譯輔助 ==========

  const getTypeLabel = (type: SubCatType): string => {
    const key = `mini_subCatType_${type}` as keyof typeof t;
    return (t[key] as string) || typeFilters.find((f) => f.key === type)?.label || type;
  };

  const getBonusLabel = (bonusType: string): string => {
    const key = `mini_bonus_${bonusType}` as keyof typeof t;
    return (t[key] as string) || bonusType;
  };

  // ========== 日期格式化 ==========

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // ========== Loading / Error ==========

  const isLoading = catalogQuery.isLoading || collectionQuery.isLoading;
  const hasError = catalogQuery.error || collectionQuery.error;

  if (isLoading) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={localStyles.centered}>
        <ErrorState
          message={catalogQuery.error?.message || collectionQuery.error?.message || 'Failed to load'}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // ========== Render 子元件 ==========

  const renderProgressCard = () => (
    <View style={localStyles.progressCard}>
      <View style={localStyles.progressHeader}>
        <Ionicons name="paw-outline" size={20} color={MibuBrand.copper} />
        <Text style={localStyles.progressTitle}>
          {(t as Record<string, string>).mini_subCatCollected || '已收集'}
        </Text>
        <Text style={localStyles.progressCount}>
          {ownedCount} / {totalCount}
        </Text>
      </View>
      <View style={localStyles.progressBar}>
        <View style={[localStyles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={localStyles.progressPercent}>{progressPercent}%</Text>
    </View>
  );

  const renderTypeFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={localStyles.filterScroll}
      contentContainerStyle={localStyles.filterContent}
    >
      {typeFilters.map((filter) => {
        const isActive = selectedType === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[localStyles.filterTab, isActive && localStyles.filterTabActive]}
            onPress={() => setSelectedType(filter.key)}
          >
            <Text style={[localStyles.filterTabText, isActive && localStyles.filterTabTextActive]}>
              {filter.key === 'all'
                ? filter.label
                : getTypeLabel(filter.key)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderCatCard = (cat: SubCat & { owned: boolean }) => {
    const rarityColor = RARITY_COLORS[cat.rarity];

    return (
      <TouchableOpacity
        key={cat.id}
        style={[localStyles.catCard, { width: cardWidth }]}
        onPress={() => handleCatPress(cat)}
        activeOpacity={cat.owned ? 0.7 : 1}
      >
        {/* 圖片區域 */}
        <View style={localStyles.catImageContainer}>
          {cat.owned ? (
            <ExpoImage
              source={{ uri: cat.imageUrl }}
              style={localStyles.catImage}
              contentFit="cover"
            />
          ) : (
            <View style={localStyles.catImageLocked}>
              <Ionicons name="help-outline" size={36} color={MibuBrand.brownLight} />
            </View>
          )}

          {/* 稀有度標籤 */}
          <View style={[localStyles.rarityBadge, { backgroundColor: rarityColor }]}>
            <Text style={localStyles.rarityBadgeText}>{rarityLabels[cat.rarity]}</Text>
          </View>
        </View>

        {/* 資訊區域 */}
        <View style={localStyles.catInfo}>
          {cat.owned ? (
            <Text style={localStyles.catName} numberOfLines={1}>{cat.name}</Text>
          ) : (
            <Text style={localStyles.catNameLocked} numberOfLines={2}>{cat.acquireHint}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    if (mergedCats.length === 0) {
      return (
        <View style={localStyles.emptyContainer}>
          <Ionicons name="paw-outline" size={48} color={MibuBrand.brownLight} />
          <Text style={localStyles.emptyText}>
            {(t as Record<string, string>).mini_subCatEmpty || '尚無副貓資料'}
          </Text>
        </View>
      );
    }

    // 手動排成 2 欄 Grid（用 row + 兩個 card）
    const rows: (typeof mergedCats)[] = [];
    for (let i = 0; i < mergedCats.length; i += 2) {
      rows.push(mergedCats.slice(i, i + 2));
    }

    return (
      <View style={localStyles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={localStyles.gridRow}>
            {row.map((cat) => renderCatCard(cat))}
            {/* 奇數個副貓時，最後一列補空位 */}
            {row.length === 1 && <View style={{ width: cardWidth }} />}
          </View>
        ))}
      </View>
    );
  };

  const renderBonusSummary = () => {
    if (!bonusesData) return null;

    const bonusEntries = Object.entries(bonusesData.bonuses);
    if (bonusEntries.length === 0) return null;

    return (
      <View style={localStyles.bonusCard}>
        <View style={localStyles.bonusHeader}>
          <Ionicons name="sparkles-outline" size={20} color={MibuBrand.copper} />
          <Text style={localStyles.bonusTitle}>
            {(t as Record<string, string>).mini_subCatBonuses || '加成效果'}
          </Text>
          <Text style={localStyles.bonusCount}>
            {bonusesData.bonusCatCount} / {bonusesData.totalCatCount}
          </Text>
        </View>
        {bonusEntries.map(([bonusType, value]) => (
          <View key={bonusType} style={localStyles.bonusRow}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={SemanticColors.successMain} />
            <Text style={localStyles.bonusLabel}>{getBonusLabel(bonusType)}</Text>
            <Text style={localStyles.bonusValue}>+{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!detailCat) return null;

    const rarityColor = RARITY_COLORS[detailCat.rarity];
    // 從 collection 中取得完整資料（含 acquiredAt）
    const collectionCat = collection.find((c) => c.id === detailCat.id);
    const acquiredAt = collectionCat?.acquiredAt || detailCat.acquiredAt;

    return (
      <Modal
        visible={!!detailCat}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDetail}
      >
        <TouchableOpacity
          style={localStyles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDetail}
        >
          <TouchableOpacity
            style={localStyles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* 關閉按鈕 */}
            <TouchableOpacity style={localStyles.modalClose} onPress={handleCloseDetail}>
              <Ionicons name="close" size={24} color={MibuBrand.brownDark} />
            </TouchableOpacity>

            {/* 圖片 */}
            <View style={localStyles.modalImageContainer}>
              <ExpoImage
                source={{ uri: detailCat.imageUrl }}
                style={localStyles.modalImage}
                contentFit="cover"
              />
            </View>

            {/* 名字 + 稀有度 */}
            <Text style={localStyles.modalName}>{detailCat.name}</Text>
            <View style={[localStyles.modalRarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={localStyles.modalRarityText}>{rarityLabels[detailCat.rarity]}</Text>
            </View>

            {/* 類型 */}
            <Text style={localStyles.modalType}>{getTypeLabel(detailCat.type)}</Text>

            {/* 描述 */}
            <Text style={localStyles.modalDescription}>{detailCat.description}</Text>

            {/* 加成資訊 */}
            {detailCat.hasBonus && (
              <View style={localStyles.modalBonusRow}>
                <Ionicons name="sparkles" size={16} color={MibuBrand.copper} />
                <Text style={localStyles.modalBonusText}>
                  {getBonusLabel(detailCat.bonusType)} +{detailCat.bonusValue}
                </Text>
              </View>
            )}

            {/* 取得日期 */}
            {acquiredAt && (
              <Text style={localStyles.modalAcquiredDate}>
                {(t as Record<string, string>).mini_subCatAcquiredAt || '取得日期'}：{formatDate(acquiredAt)}
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ========== Render ==========

  const isRefreshing =
    (catalogQuery.isFetching && !catalogQuery.isLoading) ||
    (collectionQuery.isFetching && !collectionQuery.isLoading);

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={[localStyles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>
          {(t as Record<string, string>).mini_subCatTitle || '副貓圖鑑'}
        </Text>
        <View style={localStyles.backButton} />
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={MibuBrand.brown}
            colors={[MibuBrand.brown]}
          />
        }
      >
        {/* 收集進度 */}
        {renderProgressCard()}

        {/* 類型篩選 */}
        {renderTypeFilters()}

        {/* Grid 顯示 */}
        {renderGrid()}

        {/* 加成總覽 */}
        {renderBonusSummary()}
      </ScrollView>

      {/* 詳情 Modal */}
      {renderDetailModal()}
    </View>
  );
}

// ============ 樣式 ============

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: MibuBrand.creamLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: GRID_PADDING,
    paddingBottom: BOTTOM_SPACER_HEIGHT,
  },

  // 收集進度卡片
  progressCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  progressCount: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  progressBar: {
    height: 8,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.full,
  },
  progressPercent: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },

  // 類型篩選
  filterScroll: {
    marginBottom: Spacing.lg,
  },
  filterContent: {
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.warmWhite,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  filterTabActive: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  filterTabText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: MibuBrand.brownDark,
  },
  filterTabTextActive: {
    color: UIColors.white,
  },

  // Grid
  gridContainer: {
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },

  // 副貓卡片
  catCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  catImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catImageLocked: {
    width: '100%',
    height: '100%',
    backgroundColor: MibuBrand.tanLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  rarityBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: UIColors.white,
  },
  catInfo: {
    padding: Spacing.sm,
  },
  catName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  catNameLocked: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    fontStyle: 'italic',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: MibuBrand.brownLight,
  },

  // 加成卡片
  bonusCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    ...Shadow.sm,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bonusTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  bonusCount: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  bonusLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  bonusValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: SemanticColors.successMain,
  },

  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.md,
  },
  modalClose: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: MibuBrand.creamLight,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalRarityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  modalRarityText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: UIColors.white,
  },
  modalType: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  modalDescription: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  modalBonusText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  modalAcquiredDate: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
  },
});
