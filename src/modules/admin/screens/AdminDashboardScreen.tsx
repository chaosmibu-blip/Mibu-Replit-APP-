import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { AdminUser, PlaceDraft, GlobalExclusion } from '../../../types';

type Tab = 'pending' | 'users' | 'drafts' | 'exclusions' | 'announcements';

export function AdminDashboardScreen() {
  const { state, getToken, setUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [drafts, setDrafts] = useState<PlaceDraft[]>([]);
  const [exclusions, setExclusions] = useState<GlobalExclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '管理後台' : 'Admin Dashboard',
    pendingTab: isZh ? '待審核' : 'Pending',
    usersTab: isZh ? '用戶' : 'Users',
    draftsTab: isZh ? '草稿' : 'Drafts',
    exclusionsTab: isZh ? '排除' : 'Exclusions',
    announcementsTab: isZh ? '公告' : 'Announcements',
    approve: isZh ? '核准' : 'Approve',
    reject: isZh ? '拒絕' : 'Reject',
    publish: isZh ? '發布' : 'Publish',
    delete: isZh ? '刪除' : 'Delete',
    loading: isZh ? '載入中...' : 'Loading...',
    noData: isZh ? '沒有資料' : 'No data',
    noPending: isZh ? '沒有待審核用戶' : 'No pending users',
    merchant: isZh ? '商家' : 'Merchant',
    specialist: isZh ? '專員' : 'Specialist',
    traveler: isZh ? '旅客' : 'Traveler',
    admin: isZh ? '管理員' : 'Admin',
    approved: isZh ? '已核准' : 'Approved',
    pending: isZh ? '待審核' : 'Pending',
    confirmApprove: isZh ? '確定要核准這位用戶嗎？' : 'Approve this user?',
    confirmReject: isZh ? '確定要拒絕這位用戶嗎？' : 'Reject this user?',
    confirmPublish: isZh ? '確定要發布這個草稿嗎？' : 'Publish this draft?',
    confirmDelete: isZh ? '確定要刪除嗎？' : 'Delete this item?',
    logout: isZh ? '登出' : 'Logout',
  };

  const handleLogout = async () => {
    setUser(null);
    router.replace('/login');
  };

  const roleLabels: Record<string, string> = {
    merchant: translations.merchant,
    specialist: translations.specialist,
    traveler: translations.traveler,
    admin: translations.admin,
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'merchant': return styles.roleMerchant;
      case 'specialist': return styles.roleSpecialist;
      case 'admin': return styles.roleAdmin;
      default: return styles.roleTraveler;
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      switch (activeTab) {
        case 'pending':
          const pendingData = await apiService.getAdminPendingUsers(token);
          setPendingUsers(pendingData.users || []);
          break;
        case 'users':
          const usersData = await apiService.getAdminUsers(token);
          setAllUsers(usersData.users || []);
          break;
        case 'drafts':
          const draftsData = await apiService.getPlaceDrafts(token);
          setDrafts(draftsData.drafts || []);
          break;
        case 'exclusions':
          const exclusionsData = await apiService.getGlobalExclusions(token);
          setExclusions(exclusionsData || []);
          break;
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApproveUser = async (userId: string, approve: boolean) => {
    Alert.alert(
      approve ? translations.approve : translations.reject,
      approve ? translations.confirmApprove : translations.confirmReject,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '確定' : 'Confirm',
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(userId);
              const token = await getToken();
              if (!token) return;
              await apiService.approveUser(token, userId, approve);
              loadData();
            } catch (error) {
              console.error('Failed to update user:', error);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handlePublishDraft = async (draftId: number) => {
    Alert.alert(translations.publish, translations.confirmPublish, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.publishPlaceDraft(token, draftId);
            loadData();
          } catch (error) {
            console.error('Failed to publish draft:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleDeleteDraft = async (draftId: number) => {
    Alert.alert(translations.delete, translations.confirmDelete, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`draft-${draftId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.deletePlaceDraft(token, draftId);
            loadData();
          } catch (error) {
            console.error('Failed to delete draft:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleDeleteExclusion = async (exclusionId: number) => {
    Alert.alert(translations.delete, translations.confirmDelete, [
      { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
      {
        text: isZh ? '確定' : 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(`exclusion-${exclusionId}`);
            const token = await getToken();
            if (!token) return;
            await apiService.removeGlobalExclusion(token, exclusionId);
            loadData();
          } catch (error) {
            console.error('Failed to delete exclusion:', error);
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['pending', 'users', 'drafts', 'exclusions', 'announcements'] as Tab[]).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {translations[`${tab}Tab` as keyof typeof translations]}
            {tab === 'pending' && pendingUsers.length > 0 && (
              <Text style={styles.badgeText}> ({pendingUsers.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPendingUsers = () => (
    <View style={styles.listContainer}>
      {pendingUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
          <Text style={styles.emptyText}>{translations.noPending}</Text>
        </View>
      ) : (
        pendingUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name || user.email || user.id}</Text>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, getRoleBadgeStyle(user.role)]}>
                    <Text style={styles.roleBadgeText}>{roleLabels[user.role] || user.role}</Text>
                  </View>
                  <Text style={styles.userDate}>{formatDate(user.createdAt)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveUser(user.id, true)}
                disabled={actionLoading === user.id}
              >
                {actionLoading === user.id ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleApproveUser(user.id, false)}
                disabled={actionLoading === user.id}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderAllUsers = () => (
    <View style={styles.listContainer}>
      {allUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
        </View>
      ) : (
        allUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name || user.email || user.id}</Text>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, getRoleBadgeStyle(user.role)]}>
                    <Text style={styles.roleBadgeText}>{roleLabels[user.role] || user.role}</Text>
                  </View>
                  <View style={[styles.statusBadge, user.isApproved ? styles.statusApproved : styles.statusPending]}>
                    <Text style={styles.statusBadgeText}>
                      {user.isApproved ? translations.approved : translations.pending}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderDrafts = () => (
    <View style={styles.listContainer}>
      {drafts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
        </View>
      ) : (
        drafts.map(draft => (
          <View key={draft.id} style={styles.draftCard}>
            <View style={styles.draftInfo}>
              <Text style={styles.draftName}>{draft.placeName}</Text>
              <Text style={styles.draftLocation}>
                {[draft.district, draft.city].filter(Boolean).join(', ')}
              </Text>
              {draft.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{draft.category}</Text>
                </View>
              )}
            </View>
            <View style={styles.draftActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.publishButton]}
                onPress={() => handlePublishDraft(draft.id)}
                disabled={actionLoading === `draft-${draft.id}`}
              >
                {actionLoading === `draft-${draft.id}` ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="cloud-upload" size={18} color="#ffffff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteDraft(draft.id)}
                disabled={actionLoading === `draft-${draft.id}`}
              >
                <Ionicons name="trash" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderExclusions = () => (
    <View style={styles.listContainer}>
      {exclusions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="ban-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noData}</Text>
        </View>
      ) : (
        exclusions.map(exclusion => (
          <View key={exclusion.id} style={styles.exclusionCard}>
            <View style={styles.exclusionInfo}>
              <Text style={styles.exclusionName}>{exclusion.placeName}</Text>
              <Text style={styles.exclusionLocation}>
                {[exclusion.district, exclusion.city].filter(Boolean).join(', ')}
              </Text>
              <Text style={styles.exclusionScore}>
                {isZh ? '扣分' : 'Penalty'}: {exclusion.penaltyScore}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteExclusion(exclusion.id)}
              disabled={actionLoading === `exclusion-${exclusion.id}`}
            >
              {actionLoading === `exclusion-${exclusion.id}` ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="trash" size={18} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>{translations.loading}</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'pending':
        return renderPendingUsers();
      case 'users':
        return renderAllUsers();
      case 'drafts':
        return renderDrafts();
      case 'exclusions':
        return renderExclusions();
      case 'announcements':
        return (
          <View style={styles.listContainer}>
            <TouchableOpacity
              style={{
                backgroundColor: '#7A5230',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={() => router.push('/announcement-manage' as any)}
            >
              <Ionicons name="megaphone-outline" size={20} color="#FFFEFA" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFEFA' }}>
                {isZh ? '前往公告管理' : 'Go to Announcement Manager'}
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{translations.title}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{translations.logout}</Text>
        </TouchableOpacity>
      </View>
      {renderTabs()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  badgeText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  listContainer: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTraveler: {
    backgroundColor: '#dbeafe',
  },
  roleMerchant: {
    backgroundColor: '#fef3c7',
  },
  roleSpecialist: {
    backgroundColor: '#d1fae5',
  },
  roleAdmin: {
    backgroundColor: '#fce7f3',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  publishButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  draftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  draftLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  draftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  exclusionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  exclusionInfo: {
    flex: 1,
  },
  exclusionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  exclusionLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  exclusionScore: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});
