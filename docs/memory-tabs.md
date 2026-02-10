# 三大導航功能地圖

> 當問題發生時，快速定位該查找的位置

---

## 🏠 首頁 (HomeScreen)

**路徑**: `src/modules/shared/screens/HomeScreen.tsx`

### 功能區塊
| 區塊 | 功能 |
|------|------|
| 問候區 | 顯示「嗨，旅行者！」 |
| 等級卡片 | Lv、稱號、階段、連續登入、XP 進度條 |
| 每日任務卡 | 完成數/總數、已獲得 XP（點擊 → `/economy`） |
| 活動 Tab | 公告 / 在地活動 / 限時活動（切換顯示） |

### 使用的元件
無獨立抽離元件，全部內建在 HomeScreen

### 串接的 API
| API | 檔案 | 用途 |
|-----|------|------|
| `eventApi.getHomeEvents()` | `services/api.ts` | 取得公告、節日、限時活動 |
| `economyApi.getLevelInfo()` | `services/economyApi.ts` | 取得用戶等級資料 |
| `economyApi.getDailyTasks()` | `services/economyApi.ts` | 取得每日任務進度 |

### 跳轉頁面
| 觸發 | 目標 |
|------|------|
| 點每日任務卡 | `/economy` |
| 點活動卡片 | `/event/:id` |

---

## 🎰 扭蛋 (GachaScreen)

**路徑**: `src/modules/traveler/screens/GachaScreen.tsx`

### 功能區塊
| 區塊 | 功能 |
|------|------|
| Logo 區 | MIBU 標題 + Slogan |
| 選擇區域卡 | 國家下拉 → 城市下拉 |
| 抽取張數卡 | Slider 調整 5~12 張 |
| 道具箱警告 | 滿了不能抽 / 快滿了提醒 |
| 開始扭蛋按鈕 | 主要 CTA |
| 獎池預覽 Modal | SP/SSR 優惠券列表 |
| 載入畫面 | LoadingAdScreen（等待 AI 生成） |
| 新手教學 | TutorialOverlay |

### 使用的元件
| 元件 | 路徑 | 用途 |
|------|------|------|
| `Button` | `modules/shared/components/ui/Button.tsx` | 按鈕 |
| `Select` | `modules/shared/components/ui/Select.tsx` | 國家/城市下拉選單 |
| `LoadingAdScreen` | `modules/shared/components/LoadingAdScreen.tsx` | 扭蛋等待畫面 |
| `TutorialOverlay` | `modules/shared/components/TutorialOverlay.tsx` | 新手引導 |
| `Slider` | `@react-native-community/slider` | 張數滑桿 |

### 串接的 API
| API | 檔案 | 用途 |
|-----|------|------|
| `apiService.getCountries()` | `services/api.ts` | 國家列表 |
| `apiService.getRegions(countryId)` | `services/api.ts` | 城市列表 |
| `apiService.getInventoryCapacity()` | `services/api.ts` | 道具箱容量 |
| `apiService.getInventory()` | `services/api.ts` | 道具箱內容（fallback） |
| `apiService.generateItinerary()` | `services/api.ts` | **核心：扭蛋抽卡** |
| `apiService.getGachaPool()` | `services/api.ts` | 獎池預覽 |
| `apiService.getRegionCouponPool()` | `services/api.ts` | 區域優惠券池 |
| `apiService.getPrizePool()` | `services/api.ts` | 獎品池 |
| `apiService.getRarityConfig()` | `services/api.ts` | 稀有度機率 |
| `getDeviceId()` | `services/gachaApi.ts` | 裝置識別碼（防刷） |

### 跳轉頁面
| 觸發 | 目標 |
|------|------|
| 扭蛋成功 | `/(tabs)/gacha/items` |
| 未登入點扭蛋 | `/login` |
| 點「解鎖全球地圖」 | `/crowdfunding` |
| 道具箱滿點「前往」 | `/(tabs)/collection/itembox` |

### 子頁面
| 頁面 | 路徑 | 用途 |
|------|------|------|
| ItemsScreen | `src/modules/traveler/screens/ItemsScreen.tsx` | 扭蛋結果展示 |

---

## ⚙️ 設定 (SettingsScreen)

**路徑**: `src/modules/shared/screens/SettingsScreen.tsx`

### 功能分組
| 分組 | 項目 |
|------|------|
| **帳號** | 個人資料、推薦領好禮、語言設定 |
| **探索** | 解鎖全球地圖、等級與成就 |
| **偏好設定** | 我的最愛/黑名單、推播通知 |
| **更多功能** | 社群貢獻 |
| **關於** | 隱私政策、服務條款、幫助中心 |
| **帳號管理** | 合併帳號、登出、刪除帳號 |

### 使用的元件
| 元件 | 路徑 | 用途 |
|------|------|------|
| `app/login.tsx` | `app/login.tsx` | 登入頁（OAuth，#044 移除密碼認證） |
| `Switch` | React Native 內建 | 推播通知開關 |
| `Modal` | React Native 內建 | 語言選擇、帳號合併流程 |

### 串接的 API
| API | 檔案 | 用途 |
|-----|------|------|
| `apiService.logout()` | `services/api.ts` | 登出 |
| `apiService.deleteAccount()` | `services/api.ts` | 刪除帳號 |
| `authApi.mergeAccount()` | `services/authApi.ts` | 合併帳號 (#036) |

### 跳轉頁面
| 項目 | 目標 |
|------|------|
| 個人資料 | `/profile` |
| 推薦領好禮 | `/referral` |
| 解鎖全球地圖 | `/map` |
| 等級與成就 | `/economy` |
| 我的最愛/黑名單 | `/favorites-management` |
| 社群貢獻 | `/contribution` |
| 全域排除管理（Admin） | `/admin-exclusions` |
| 登出後 | `/login` |

---

## 問題定位速查表

| 問題現象 | 先查哪裡 | 檔案 |
|----------|----------|------|
| 首頁等級不對 | `economyApi.getLevelInfo()` | `services/economyApi.ts` |
| 首頁活動沒顯示 | `eventApi.getHomeEvents()` | `services/api.ts` |
| 扭蛋選國家失敗 | `apiService.getCountries()` | `services/api.ts` |
| 扭蛋選城市失敗 | `apiService.getRegions()` | `services/api.ts` |
| 扭蛋抽不了 | `apiService.generateItinerary()` | `services/api.ts` |
| 扭蛋結果沒顯示 | `ItemsScreen` | `modules/traveler/screens/ItemsScreen.tsx` |
| 道具箱容量錯誤 | `apiService.getInventoryCapacity()` | `services/api.ts` |
| 設定頁跳轉壞了 | `router.push()` 路徑 | `SettingsScreen.tsx` |
| 登出沒清乾淨 | `setUser(null)` | `SettingsScreen.tsx` |
| 合併帳號失敗 | `authApi.mergeAccount()` | `services/authApi.ts` |
| 語言切換沒反應 | `setLanguage()` | `context/AppContext.tsx` |

---

## 依賴關係圖

```
首頁 (HomeScreen)
├── API: eventApi, economyApi
├── Context: AppContext (state, getToken)
└── 跳轉: /economy, /event/:id

扭蛋 (GachaScreen)
├── API: apiService (多個), gachaApi
├── Context: AppContext (state, t, addToCollection, setResult, getToken, setUser)
├── 元件: Button, Select, LoadingAdScreen, TutorialOverlay
├── 子頁面: ItemsScreen
└── 跳轉: /login, /crowdfunding, /collection/itembox

設定 (SettingsScreen)
├── API: apiService, authApi
├── Context: AppContext (state, t, setLanguage, setUser, getToken)
├── 元件: app/login.tsx（OAuth 登入）
└── 跳轉: /profile, /referral, /map, /economy, /favorites-management,
          /account, /contribution, /admin-exclusions, /login
```

---

*最後更新：2026-01-30*
