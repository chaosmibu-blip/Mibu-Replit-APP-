# Memory: Components (元件庫)

> 最後更新: 2026-01-11

## 共用元件清單

### UI 基礎元件 (src/components/ui/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `Button` | `src/components/ui/Button.tsx` | 通用按鈕 |
| `Select` | `src/components/ui/Select.tsx` | 下拉選單 |
| `Card` | `src/components/ui/Card.tsx` | 卡片容器 |
| `SegmentedControl` | `src/components/ui/SegmentedControl.tsx` | 分段控制器 |

### 業務元件 (src/components/)
| 元件 | 檔案路徑 | 用途 |
|------|----------|------|
| `InfoToast` | `src/components/InfoToast.tsx` | 資訊提示 Toast |
| `LoadingAdScreen` | `src/components/LoadingAdScreen.tsx` | 載入畫面 (無 header，無廣告區塊) |
| `MerchantRegistrationForm` | `src/components/MerchantRegistrationForm.tsx` | 商家註冊表單 |
| `ModuleNav` | `src/components/ModuleNav.tsx` | 模組導航 |
| `RoleSwitcher` | `src/components/RoleSwitcher.tsx` | 角色切換器 |
| `TagInput` | `src/components/TagInput.tsx` | 標籤輸入 |
| `TierBadge` | `src/components/TierBadge.tsx` | 等級徽章 |

---

## 樣式規範 (Mibu Brand)

### 顏色系統
```typescript
const MibuBrand = {
  // 主色
  primary: '#7A5230',      // 棕色
  secondary: '#B08860',    // 銅色
  
  // 背景色
  background: '#F5E6D3',   // 奶油色
  surface: '#FFFFFF',      // 白色
  
  // 強調色
  accent: '#C9A87C',       // 淺棕色
  
  // 文字色
  text: '#1a1a1a',         // 深色文字
  textSecondary: '#64748b', // 次要文字
  
  // 稀有度顏色
  rarity: {
    SP: '#FFD700',   // 金色
    SSR: '#9400D3',  // 紫色
    SR: '#FF6347',   // 紅色
    S: '#4169E1',    // 藍色
    R: '#32CD32',    // 綠色
    N: '#808080',    // 灰色
  }
};
```

### 字體設定
```typescript
const Typography = {
  heading1: { fontSize: 28, fontWeight: '700' },
  heading2: { fontSize: 24, fontWeight: '600' },
  heading3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};
```

### 間距系統
```typescript
const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### 圓角設定
```typescript
const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

---

## 動畫效果

### 使用 react-native-reanimated
```typescript
// 淡入效果
const fadeIn = useSharedValue(0);
withTiming(fadeIn.value = 1, { duration: 300 });

// 彈跳效果
withSpring(scale.value = 1, { damping: 10 });
```

### 常用動畫
| 效果 | 時長 | 用途 |
|------|------|------|
| fadeIn | 300ms | 頁面載入 |
| slideUp | 250ms | Modal 顯示 |
| scale | 200ms | 按鈕點擊 |
| shake | 500ms | 錯誤提示 |

---

## 待補充
- [ ] 完整元件 Props 文檔
- [ ] 無障礙 (A11y) 設定
