# Memory: Feature - Merchant (商家功能)

## 模組概述
商家功能模組讓 B 端商家管理優惠券、查看數據分析、核銷優惠券。

---

## 角色權限

| 功能 | user | merchant | specialist | admin |
|------|------|----------|------------|-------|
| 查看商家儀表板 | ❌ | ✅ | ❌ | ✅ |
| 管理優惠券 | ❌ | ✅ | ❌ | ✅ |
| QR Code 核銷 | ❌ | ✅ | ❌ | ✅ |
| 數據分析 | ❌ | ✅ | ❌ | ✅ |

---

## 功能頁面

### 商家儀表板 (MerchantDashboard)
- 今日核銷數量
- 優惠券使用統計
- 快捷操作按鈕

### 優惠券管理 (CouponManagement)
- 優惠券列表
- 新增/編輯優惠券
- 啟用/停用優惠券

### 數據分析 (MerchantAnalytics)
- 曝光次數統計
- 核銷轉換率
- 時間趨勢圖表

---

## QR Code 核銷流程

```
商家打開核銷頁面
    ↓
啟動相機掃描器
    ↓
掃描用戶的優惠券 QR Code
    ↓
解析 QR Code 內容
├── couponId
├── userId
└── verificationCode
    ↓
POST /api/merchant/redeem
    ↓
顯示核銷結果
├── 成功 → 顯示優惠內容 + 確認動畫
└── 失敗 → 顯示錯誤原因
```

---

## QR Code 掃描器

### 使用套件
```typescript
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
```

### 實作要點
```typescript
const handleBarCodeScanned = ({ type, data }) => {
  try {
    const couponData = JSON.parse(data);
    // 呼叫核銷 API
    redeemCoupon(couponData);
  } catch (e) {
    Alert.alert('無效的 QR Code');
  }
};
```

---

## 核銷介面 (RedemptionScreen)

### 核銷前
- 相機預覽
- 掃描框 UI
- 手電筒開關 (夜間使用)

### 核銷成功
- 綠色確認動畫
- 顯示優惠券資訊
  - 優惠標題
  - 折扣內容
  - 用戶資訊
- 「完成」按鈕

### 核銷失敗
- 紅色錯誤提示
- 錯誤原因說明
  - 優惠券已使用
  - 優惠券已過期
  - 無效的驗證碼
- 「重新掃描」按鈕

---

## API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/merchant/dashboard` | 儀表板數據 |
| GET | `/api/merchant/coupons` | 優惠券列表 |
| POST | `/api/merchant/coupons` | 新增優惠券 |
| PUT | `/api/merchant/coupons/:id` | 編輯優惠券 |
| POST | `/api/merchant/redeem` | 核銷優惠券 |
| GET | `/api/merchant/analytics` | 數據分析 |

---

## 待實作
- [ ] QR Code 掃描器 UI
- [ ] 核銷動畫效果
- [ ] 離線核銷支援
- [ ] 批量核銷功能
