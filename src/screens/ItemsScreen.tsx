import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export function ItemsScreen() {
  const { state } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {state.language === 'zh-TW' ? '道具箱' : 'Items'}
      </Text>

      <View style={styles.emptyState}>
        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={48} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>
          {state.language === 'zh-TW' ? '尚無道具' : 'No Items Yet'}
        </Text>
        <Text style={styles.emptyDesc}>
          {state.language === 'zh-TW' 
            ? '扭蛋後獲得的道具會出現在這裡' 
            : 'Items from gacha will appear here'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
