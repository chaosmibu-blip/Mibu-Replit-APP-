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
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface RoleSwitcherProps {
  compact?: boolean;
}

const ROLE_CONFIG: Record<UserRole, { label: { zh: string; en: string }; color: string; icon: string; route: string }> = {
  traveler: { label: { zh: '旅客', en: 'Traveler' }, color: '#6366f1', icon: 'airplane-outline', route: '/(tabs)' },
  merchant: { label: { zh: '企業端', en: 'Business' }, color: '#10b981', icon: 'storefront-outline', route: '/merchant-dashboard' },
  specialist: { label: { zh: '專員端', en: 'Specialist' }, color: '#a855f7', icon: 'shield-checkmark-outline', route: '/specialist-dashboard' },
  admin: { label: { zh: '管理端', en: 'Admin' }, color: '#f59e0b', icon: 'settings-outline', route: '/admin-dashboard' },
};

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { state, switchRole } = useApp();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  const user = state.user;
  if (!user?.isSuperAdmin || !user?.accessibleRoles || user.accessibleRoles.length <= 1) {
    return null;
  }

  const isZh = state.language === 'zh-TW';
  const currentRole = (user.activeRole || user.role || 'traveler') as UserRole;
  const currentConfig = ROLE_CONFIG[currentRole];

  const handleSwitchRole = async (role: UserRole) => {
    if (role === currentRole) {
      setShowMenu(false);
      return;
    }

    setSwitching(true);
    const success = await switchRole(role);
    setSwitching(false);
    setShowMenu(false);

    if (success) {
      const targetRoute = ROLE_CONFIG[role].route;
      router.replace(targetRoute as any);
    }
  };

  const accessibleRoles = user.accessibleRoles.filter(r => 
    ['traveler', 'merchant', 'specialist', 'admin'].includes(r)
  ) as UserRole[];

  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: currentConfig.color + '20' }]}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name={currentConfig.icon as any} size={18} color={currentConfig.color} />
          <Ionicons name="chevron-down" size={14} color={currentConfig.color} />
        </TouchableOpacity>

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
                {isZh ? '切換身份' : 'Switch Role'}
              </Text>
              {switching ? (
                <ActivityIndicator size="small" color="#6366f1" style={styles.loader} />
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
                        color={isActive ? config.color : '#64748b'}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && { color: config.color, fontWeight: '700' },
                        ]}
                      >
                        {isZh ? config.label.zh : config.label.en}
                      </Text>
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { borderColor: currentConfig.color }]}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name={currentConfig.icon as any} size={20} color={currentConfig.color} />
        <Text style={[styles.buttonText, { color: currentConfig.color }]}>
          {isZh ? currentConfig.label.zh : currentConfig.label.en}
        </Text>
        <Ionicons
          name={showMenu ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={currentConfig.color}
        />
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.dropdown}>
          {switching ? (
            <ActivityIndicator size="small" color="#6366f1" style={styles.loader} />
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
                    color={isActive ? config.color : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.dropdownText,
                      isActive && { color: config.color, fontWeight: '700' },
                    ]}
                  >
                    {isZh ? config.label.zh : config.label.en}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 15,
    color: '#334155',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minWidth: 200,
    maxWidth: 280,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },
  loader: {
    paddingVertical: 20,
  },
});
