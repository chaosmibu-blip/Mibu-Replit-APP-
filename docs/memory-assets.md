# Memory: Assets (資源管理)

> **TL;DR**
> - **主要功能**：圖片、字體、多語系、圖示資源管理
> - **關鍵檔案**：`assets/images/`、`src/constants/translations.ts`
> - **多語系**：zh-TW、en、ja、ko（用 `t.xxx` 取用）
> - **圖示套件**：`@expo/vector-icons`（Ionicons 為主）

---

> **跨端對應**
> - 後端：（無直接對應，前端專屬）

> 最後更新: 2026-02-08

## 圖片資源

### 目錄結構
```
assets/
├── images/
│   ├── icon.png           # App 圖示
│   ├── adaptive-icon.png  # Android 自適應圖示
│   ├── splash.png         # 啟動畫面
│   ├── splash-icon.png    # 啟動圖示
│   ├── favicon.png        # Web Favicon
│   ├── avatars/           # 頭像插畫（圓形裁切版）
│   │   ├── avatar-chef.png
│   │   ├── avatar-artist.png
│   │   ├── avatar-musician.png
│   │   ├── avatar-gardener.png
│   │   ├── avatar-explorer.png
│   │   ├── avatar-astronaut.png
│   │   ├── avatar-diver.png
│   │   ├── avatar-camper.png
│   │   └── originals/     # 原始圖片備份（含自帶邊框）
│   ├── partial-react-logo.png   # Expo 預設圖片 (可刪除)
│   ├── react-logo.png           # Expo 預設圖片 (可刪除)
│   ├── react-logo@2x.png        # Expo 預設圖片 (可刪除)
│   └── react-logo@3x.png        # Expo 預設圖片 (可刪除)
├── fonts/                  # 自定義字體
└── animations/             # Lottie 動畫
```

### 頭像圖片處理（2026-02-08）

**問題**：原始頭像圖片 256x256 內含一圈手繪邊框，與 CSS borderRadius + borderWidth 的頭像框對不齊。
三次 CSS 方案（transform scale、絕對定位）都失敗。

**解法**：用 ImageMagick 裁切圖片，去掉自帶邊框：
```bash
magick original.png -alpha on \
  \( -size 256x256 xc:none -fill white -draw "circle 130,150 130,52" \) \
  -compose DstIn -composite \
  -trim +repage \
  -resize 256x256! \
  \( -size 256x256 xc:none -fill white -draw "circle 128,128 128,0" \) \
  -compose DstIn -composite \
  output.png
```
- 原始圖片圓心偏移約 (130, 150)，邊框半徑約 103-112px
- 步驟：提取內容圓 → trim → resize 填滿 256x256 → 置中圓形 mask
- 處理後圖片為純圓形 + 透明角落，RN 端只需 `width: '100%', height: '100%'` + `borderRadius`

**未完成**：ProfileScreen / HomeScreen 的 avatar 渲染程式碼需簡化（移除絕對定位 hack）

### Splash Screen 設定
- **圖片**: `./assets/images/splash.png`
- **模式**: `cover` (填滿整個螢幕)
- **背景色**: `#F5E6D3` (米色)
- **設定位置**: `app.json` → `plugins` → `expo-splash-screen`

### 使用方式
```typescript
import { Image } from 'react-native';

// 本地圖片
<Image source={require('@/assets/images/logo.png')} />

// 網路圖片
<Image source={{ uri: 'https://example.com/image.jpg' }} />
```

---

## 字體設定

### 系統字體 (預設)
- iOS: San Francisco
- Android: Roboto

### 自定義字體 (若有)
```typescript
// app.json 或 app.config.js
{
  "expo": {
    "fonts": [
      "./assets/fonts/CustomFont-Regular.ttf",
      "./assets/fonts/CustomFont-Bold.ttf"
    ]
  }
}
```

### 使用 expo-font
```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
  'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
});
```

---

## 多語系檔案

### 檔案位置
```
src/constants/translations.ts
```

### 支援語言
| 代碼 | 語言 |
|------|------|
| `zh-TW` | 繁體中文 |
| `en` | English |
| `ja` | 日本語 |
| `ko` | 한국어 |

### 翻譯結構
```typescript
const translations = {
  'zh-TW': {
    welcome: '歡迎來到 Mibu',
    gacha: '扭蛋',
    collection: '收藏',
    settings: '設定',
    // ...
  },
  'en': {
    welcome: 'Welcome to Mibu',
    gacha: 'Gacha',
    collection: 'Collection',
    settings: 'Settings',
    // ...
  },
  // ja, ko...
};
```

### 使用方式
```typescript
import { useApp } from '@/src/context/AppContext';

function MyComponent() {
  const { t } = useApp();
  
  return <Text>{t.welcome}</Text>;
}
```

---

## 圖示資源

### 使用 @expo/vector-icons
```typescript
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

// Ionicons (推薦)
<Ionicons name="home" size={24} color="#7A5230" />

// MaterialIcons
<MaterialIcons name="settings" size={24} color="#7A5230" />
```

### 常用圖示
| 用途 | 圖示名稱 | 套件 |
|------|----------|------|
| 首頁 | `home` | Ionicons |
| 扭蛋 | `dice` | Ionicons |
| 收藏 | `heart` | Ionicons |
| 設定 | `settings` | Ionicons |
| 返回 | `arrow-back` | Ionicons |
| 地圖 | `map` | Ionicons |
| 優惠券 | `pricetag` | Ionicons |

---

## 動畫資源

### Lottie 動畫 (若有)
```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('@/assets/animations/loading.json')}
  autoPlay
  loop
/>
```

---

## 待補充
- [ ] 圖片壓縮策略
- [ ] 圖片 CDN 設定
- [ ] 新增自定義字體
- [ ] 完整翻譯鍵值對照
