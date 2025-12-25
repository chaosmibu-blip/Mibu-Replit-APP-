# Memory: Feature - Gacha (扭蛋功能)

## 模組概述
扭蛋機是 Mibu App 的核心功能，讓使用者透過隨機抽取的方式獲得旅遊景點推薦。

---

## 功能流程

### 扭蛋抽取流程
```
選擇國家 → 選擇城市/地區 → 設定抽取數量
    ↓
點擊「開始扭蛋」按鈕
    ↓
檢查每日額度 (本地 + API)
    ↓
顯示 Loading 廣告畫面
    ↓
POST /api/gacha/itinerary/v3
    ↓
處理回應
├── 成功 → 顯示結果卡片 → 加入收藏
└── 失敗 → 顯示錯誤訊息
```

---

## UI 元件

### GachaScreen 主畫面
- 國家選擇器 (Select)
- 城市選擇器 (Select)
- 數量滑桿 (Slider: 1-15)
- 扭蛋按鈕 (TouchableOpacity)
- 每日額度顯示

### 結果卡片 (GachaCard)
```typescript
interface GachaCardProps {
  place: Place;
  rarity?: 'R' | 'S' | 'SR' | 'SSR' | 'SP';
  coupon?: Coupon;
  onPress?: () => void;
}
```

### 卡片顯示資訊
- 地點名稱 (placeName)
- 分類圖示 (食/遊/購/宿/行)
- 地區標籤 (city + district)
- 稀有度邊框顏色
- 優惠券徽章 (若有)

---

## 動畫效果

### 載入廣告畫面 (LoadingAdScreen)
- 全螢幕覆蓋
- 載入動畫 (ActivityIndicator 或 Lottie)
- 廣告區域預留

### 卡片揭曉動畫
- 翻牌效果 (react-native-reanimated)
- 稀有度光暈效果
- 連續揭曉間隔 (300ms)

---

## 收藏互動邏輯

### 自動加入收藏
抽取成功後，所有景點自動加入本地收藏 (AsyncStorage)

### 收藏資料結構
```typescript
interface GachaItem {
  id: string;
  placeName: string;
  description?: string;
  category: string;
  city: string;
  cityDisplay: string;
  district?: string;
  districtDisplay?: string;
  locationLat?: number;
  locationLng?: number;
  isCoupon: boolean;
  couponData?: Coupon;
  merchant?: Merchant;
  rarity?: string;
  addedAt: string;
}
```

### 收藏上限
- 本地收藏無上限 (前端)
- 背包同步上限 30 格 (後端 /api/inventory)

---

## 每日額度管理

### 本地追蹤
```typescript
const DAILY_LIMIT_KEY = '@mibu_daily_gacha';

interface DailyLimit {
  date: string;      // YYYY-MM-DD
  count: number;     // 今日已抽次數
}
```

### API 同步
```typescript
GET /api/gacha/quota
{
  dailyLimit: 36,
  currentCount: 12,
  remainingQuota: 24
}
```

---

## 錯誤處理

| 情境 | 處理方式 |
|------|----------|
| 未選擇地區 | 提示選擇城市 |
| 額度用完 | 顯示「明天再來」|
| 無景點 | 顯示 meta.message |
| 網路錯誤 | 顯示重試按鈕 |

---

## 待實作
- [ ] 扭蛋機動畫優化
- [ ] 稀有度特效
- [ ] 分享卡片功能
