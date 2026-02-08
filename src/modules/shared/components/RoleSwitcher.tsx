/**
 * RoleSwitcher - 身份切換器元件
 *
 * 讓超級管理員在不同身份間切換（旅客、商家、專員、管理員）。
 * 僅對 isSuperAdmin 且有多個 accessibleRoles 的用戶顯示。
 *
 * 提供兩種模式：
 * - 預設模式：顯示完整按鈕和下拉選單
 * - 精簡模式（compact）：僅顯示圖示按鈕，點擊彈出 Modal
 *
 * @example
 * // 預設模式（用於設定頁面）
 * <RoleSwitcher />
 *
 * // 精簡模式（用於導航列）
 * <RoleSwitcher compact />
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { UserRole } from '../../../types';
import { MibuBrand, UIColors, RoleColors } from '../../../../constants/Colors';

// ============ Props 介面定義 ============

/**
 * RoleSwitcher 元件的 Props 介面
 */
interface RoleSwitcherProps {
  /** 是否使用精簡模式（預設 false） */
  compact?: boolean;
}

// ============ 常數配置 ============

/**
 * 各角色的配置資料
 * 包含標籤、顏色、圖示和對應路由
 */
const ROLE_CONFIG: Record<UserRole, { labelKey: string; color: string; icon: string; route: string }> = {
  traveler: { labelKey: 'common_roleTraveler', color: MibuBrand.brown, icon: 'airplane-outline', route: '/(tabs)' },
  merchant: { labelKey: 'common_roleMerchant', color: RoleColors.merchant.main, icon: 'storefront-outline', route: '/merchant-dashboard' },
  specialist: { labelKey: 'common_roleSpecialist', color: RoleColors.specialist.main, icon: 'shield-checkmark-outline', route: '/specialist-dashboard' },
  admin: { labelKey: 'common_roleAdmin', color: '#f59e0b', icon: 'settings-outline', route: '/admin-dashboard' },
};

// ============ 主元件 ============

/**
 * 身份切換器元件
 *
 * 顯示條件：
 * - 用戶必須是超級管理員（isSuperAdmin）
 * - 用戶必須有超過一個可訪問的角色
 */
export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { state, switchRole, t } = useApp();
  const router = useRouter();
  // 控制選單/Modal 顯示狀態
  const [showMenu, setShowMenu] = useState(false);
  // 切換中的載入狀態
  const [switching, setSwitching] = useState(false);

  const user = state.user;

  // 檢查是否應該顯示切換器
  if (!user?.isSuperAdmin || !user?.accessibleRoles || user.accessibleRoles.length <= 1) {
    return null;
  }

  // 取得目前角色（優先使用 activeRole，否則使用 role，預設 traveler）
  const currentRole = (user.activeRole || user.role || 'traveler') as UserRole;
  const currentConfig = ROLE_CONFIG[currentRole];

  /**
   * 處理角色切換
   * 切換成功後導航到對應路由
   */
  const handleSwitchRole = async (role: UserRole) => {
    // 若選擇的是目前角色，直接關閉選單
    if (role === currentRole) {
      setShowMenu(false);
      return;
    }

    setSwitching(true);
    const success = await switchRole(role);
    setSwitching(false);
    setShowMenu(false);

    // 切換成功後導航到對應頁面
    if (success) {
      const targetRoute = ROLE_CONFIG[role].route;
      router.replace(targetRoute as any);
    }
  };

  // 過濾出有效的可訪問角色
  const accessibleRoles = user.accessibleRoles.filter(r =>
    ['traveler', 'merchant', 'specialist', 'admin'].includes(r)
  ) as UserRole[];

  // ============ 精簡模式渲染 ============
  if (compact) {
    return (
      <>
        {/* 精簡按鈕：僅顯示圖示 */}
        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: currentConfig.color + '20' }]}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name={currentConfig.icon as any} size={18} color={currentConfig.color} />
          <Ionicons name="chevron-down" size={14} color={currentConfig.color} />
        </TouchableOpacity>

        {/* 角色選擇 Modal */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>
                {t.common_switchRole}
              </Text>
              {switching ? (
                <ActivityIndicator size="small" color={MibuBrand.brown} style={styles.loader} />
              ) : (
                accessibleRoles.map((role) => {
                  const config = ROLE_CONFIG[role];
                  const isActive = role === currentRole;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.menuItem,
                        isActive && { backgroundColor: config.color + '15' },
                      ]}
                      onPress={() => handleSwitchRole(role)}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={20}
                        color={isActive ? config.color : UIColors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && { color: config.color, fontWeight: '700' },
                        ]}
                      >
                        {t[config.labelKey]}
                      </Text>
                      {/* 目前角色顯示勾選圖示 */}
                      {isActive && (
                        <Ionicons name="checkmark" size={18} color={config.color} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  // ============ 預設模式渲染 ============
  return (
    <View style={styles.container}>
      {/* 切換按鈕 */}
      <TouchableOpacity
        style={[styles.button, { borderColor: currentConfig.color }]}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name={currentConfig.icon as any} size={20} color={currentConfig.color} />
        <Text style={[styles.buttonText, { color: currentConfig.color }]}>
          {t[currentConfig.labelKey]}
        </Text>
        <Ionicons
          name={showMenu ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={currentConfig.color}
        />
      </TouchableOpacity>

      {/* 下拉選單 */}
      {showMenu && (
        <View style={styles.dropdown}>
          {switching ? (
            <ActivityIndicator size="small" color={MibuBrand.brown} style={styles.loader} />
          ) : (
            accessibleRoles.map((role) => {
              const config = ROLE_CONFIG[role];
              const isActive = role === currentRole;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: config.color + '15' },
                  ]}
                  onPress={() => handleSwitchRole(role)}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={18}
                    color={isActive ? config.color : UIColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.dropdownText,
                      isActive && { color: config.color, fontWeight: '700' },
                    ]}
                  >
                    {t[config.labelKey]}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  /** 容器：設定相對定位以支援下拉選單 */
  container: {
    position: 'relative',
    zIndex: 100,
  },
  /** 切換按鈕：橫向排列、圓角邊框 */
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: UIColors.white,
  },
  /** 按鈕文字 */
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  /** 下拉選單：絕對定位在按鈕下方 */
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: UIColors.white,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  /** 下拉選單項目 */
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  /** 下拉選單文字 */
  dropdownText: {
    fontSize: 15,
    color: MibuBrand.brownDark,
  },
  /** 精簡模式按鈕 */
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  /** Modal 背景遮罩 */
  modalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** Modal 選單容器 */
  menuContainer: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minWidth: 200,
    maxWidth: 280,
  },
  /** Modal 標題 */
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.dark,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  /** Modal 選單項目 */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  /** Modal 選單項目文字 */
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: MibuBrand.brownDark,
  },
  /** 載入指示器容器 */
  loader: {
    paddingVertical: 20,
  },
});
