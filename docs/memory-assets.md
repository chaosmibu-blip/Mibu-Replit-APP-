# Memory: Assets (資源管理)

## 圖片資源

### 目錄結構
```
assets/
├── images/
│   ├── logo.png           # App Logo
│   ├── splash.png         # 啟動畫面 (Mibu logo + 貓咪，2025-01-02 更新)
│   ├── splash-icon.png    # 舊版啟動圖示 (已停用)
│   ├── icon.png           # App 圖示
│   ├── adaptive-icon.png  # Android 自適應圖示
│   └── favicon.png        # Web Favicon
├── fonts/                  # 自定義字體
└── animations/             # Lottie 動畫
```

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
