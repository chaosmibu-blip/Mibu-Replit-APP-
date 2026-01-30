/**
 * 商家模組 Stack 導航佈局
 *
 * 導航結構：
 * - analytics: 數據分析
 * - coupons: 優惠券管理
 * - places: 店舖/景點管理
 * - products: 商品管理
 * - profile: 商家資料
 * - transactions: 交易紀錄
 * - verify: 核銷功能
 * - place/[id]: 店舖編輯（動態路由）
 */
import { Stack } from 'expo-router';

export default function MerchantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
