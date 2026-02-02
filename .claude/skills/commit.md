# /commit - Git Commit 技能

當用戶說「commit」或「/commit」時執行此流程。

## 執行步驟

1. **檢查狀態**
   ```bash
   git status
   ```

2. **如果有修改，執行 commit**
   ```bash
   git add <相關檔案>  # 不要用 git add -A，避免加入敏感檔案
   git commit -m "<commit message>"
   ```

3. **輸出 commit 摘要表格**
   ```
   | # | Commit | 說明 | 檔案數 | 行數變化 |
   |---|--------|------|--------|----------|
   | 1 | abc1234 | 簡短說明 | 5 | +100/-50 |
   ```

## Commit Message 格式

```
<type>(<scope>): <簡短說明>

<詳細說明（可選）>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Type 類型
- `feat`: 新功能
- `fix`: Bug 修復
- `refactor`: 重構（不影響功能）
- `docs`: 文件更新
- `style`: 格式調整（不影響程式邏輯）
- `perf`: 效能優化
- `test`: 測試相關
- `chore`: 雜項（建置、工具等）

### Scope 範圍
- `itinerary`: 行程相關
- `gacha`: 扭蛋相關
- `auth`: 認證相關
- `profile`: 個人資料
- `ai-chat`: AI 對話
- `collection`: 圖鑑相關

### 範例
```
feat(profile): #038 實作頭像上傳功能
fix(itinerary): 修復建立行程後抽屜無法關閉的問題
docs(claude): 補充 Git commit 格式規範
```

## 注意事項

- 全程使用**繁體中文**
- 不要 commit 敏感檔案（.env、credentials 等）
- 不要 commit 截圖檔案（除非用戶明確要求）
- Commit 後一定要輸出摘要表格
