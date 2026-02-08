# Memory: Components (元件庫)

> **TL;DR**
> - **主要功能**：共用 UI 元件、Mibu Brand 色彩/字體/間距規範
> - **關鍵檔案**：`src/modules/shared/components/ui/`、`src/modules/shared/components/`、`components/ui/`
> - **色彩系統**：`constants/Colors.ts`（MibuBrand、SemanticColors、RoleColors、UIColors）
> - **Design Token**：`src/theme/designTokens.ts`（Spacing、Radius、FontSize、Shadow）
> - **常見任務**：調整樣式、新增元件、統一設計語言

---

> **跨端對應**
> - 後端：（無直接對應，前端專屬）

> 最後更新: 2026-02-07

## 共用元件清單

### 模組共用 UI 元件 (src/modules/shared/components/ui/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `CoinReward` | `src/modules/shared/components/ui/CoinReward.tsx` | 金幣 icon + 數量顯示（sm/md/lg） |
| `EmptyState` | `src/modules/shared/components/ui/EmptyState.tsx` | 空資料統一提示（icon + 標題 + 描述 + 行動按鈕） |
| `ErrorState` | `src/modules/shared/components/ui/ErrorState.tsx` | API 錯誤統一顯示（icon + 訊息 + 重試按鈕） |
| `Select` | `src/modules/shared/components/ui/Select.tsx` | 下拉選單 |

### 全域 UI 元件 (components/ui/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `HapticTab` | `components/HapticTab.tsx` | Tab Bar 觸覺回饋按鈕 |
| `TabBarBackground` | `components/ui/TabBarBackground.tsx` | Tab Bar 背景（iOS 模糊效果） |

### 業務元件 (src/modules/shared/components/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `ModuleNav` | `src/modules/shared/components/ModuleNav.tsx` | 模組導航 |
| `RoleSwitcher` | `src/modules/shared/components/RoleSwitcher.tsx` | 角色切換器（SuperAdmin 用） |
| `TierBadge` | `src/modules/shared/components/TierBadge.tsx` | 稀有度等級徽章 |
| `TutorialOverlay` | `src/modules/shared/components/TutorialOverlay.tsx` | 新手教學覆蓋層 |
| `InfoToast` | `src/components/InfoToast.tsx` | 資訊提示 Toast |
| `LoadingAdScreen` | `src/components/LoadingAdScreen.tsx` | 載入畫面 |
| `TagInput` | `src/components/TagInput.tsx` | 標籤輸入 |

### 商家業務元件 (src/modules/merchant/components/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `MerchantRegistrationForm` | `src/modules/merchant/components/MerchantRegistrationForm.tsx` | 商家註冊表單 |

---

## 色彩系統（constants/Colors.ts）

### 色彩匯出結構
| 匯出 | 用途 | 範例 |
|------|------|------|
| `MibuBrand` | 品牌主色、背景色、狀態色、稀有度色 | `MibuBrand.brown`、`MibuBrand.error` |
| `SemanticColors` | 語意狀態色（成功/警告/錯誤/資訊）含 light/main/dark | `SemanticColors.successMain` |
| `RoleColors` | 角色色彩（商家/專員/管理員）含 main/light/dark | `RoleColors.merchant.main` |
| `UIColors` | 通用 UI Token（次要文字、遮罩、黑白） | `UIColors.textSecondary`、`UIColors.overlayMedium` |
| `CategoryTokens` | 景點分類色彩（美食/住宿/教育等） | `getCategoryToken('food')` |
| `Colors` | 主題色彩（light/dark 模式完整配置） | `Colors.light.primary` |

### 規則
- **禁止硬編碼色彩值**：一律使用上述 Token
- **角色色彩用 RoleColors**：不要在元件內寫 `#10b981`
- **次要文字用 UIColors.textSecondary**：不要寫 `#64748b`
- **遮罩用 UIColors.overlay***：不要寫 `rgba(0,0,0,0.5)`

---

## Design Token（src/theme/designTokens.ts）

### 間距
```typescript
Spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }
```

### 圓角
```typescript
Radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, full: 999 }
```

### 字體大小
```typescript
FontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22 }
```

### 規則
- **禁止硬編碼數值**：用 `Spacing.lg` 不要寫 `16`
- **匯入方式**：`import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';`

---

## 元件使用指南

### CoinReward
```tsx
import { CoinReward } from '@/src/modules/shared/components/ui/CoinReward';

<CoinReward amount={5} />              // 預設 md 尺寸
<CoinReward amount={100} size="lg" />  // 大尺寸（標題區域）
<CoinReward amount={30} showPlus />    // 顯示 + 號前綴
```

### EmptyState
```tsx
import { EmptyState } from '@/src/modules/shared/components/ui/EmptyState';

<EmptyState
  icon="cube-outline"
  title="還沒有資料"
  description="試試看新增一筆吧"
  actionLabel="新增"
  onAction={() => {}}
/>
```

### ErrorState
```tsx
import { ErrorState } from '@/src/modules/shared/components/ui/ErrorState';

<ErrorState
  message="載入失敗"
  detail="請檢查網路連線"
  onRetry={loadData}
/>
```

---

## 動畫效果

### 優先使用 timing（教訓 #003）
```typescript
// 推薦：timing 動畫
Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true });

// 避免：spring 動畫（除非確實需要彈性效果，可能導致 UI 卡住）
```

### 常用動畫
| 效果 | 時長 | 用途 |
|------|------|------|
| fadeIn | 300ms | 頁面載入 |
| slideUp | 250ms | Modal 顯示 |
| scale | 200ms | 按鈕點擊 |

---

---

## 頭像系統（2026-02-08）

### 頭像預設選項
- 8 隻貓咪系列插畫，定義在 `ProfileScreen.tsx` 的 `DEFAULT_AVATAR_PRESETS`
- 圖片位於 `assets/images/avatars/avatar-{id}.png`，256x256 圓形（已用 ImageMagick 去除自帶邊框）
- 背景色統一為 `#F5E6D3`

### 頭像框尺寸
| 位置 | 容器尺寸 | borderWidth | 內容區 |
|------|----------|-------------|--------|
| 主頭像（ProfileScreen） | 100×100 | 4px | 92×92 |
| 選項（Modal） | 64×64 (含 padding 3 + border 3) | 3px | ~52×52 |
| 首頁（HomeScreen） | 64×64 | 無 | 64×64 |

### 渲染方式
圖片已裁切為圓形，渲染只需：
```tsx
<View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden' }}>
  <Image source={preset.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
</View>
```

**待完成**：ProfileScreen / HomeScreen 尚需將絕對定位 hack 改回簡單渲染

---

## 待補充
- [ ] 完整元件 Props 文檔
- [ ] 無障礙 (A11y) 設定
