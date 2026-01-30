/**
 * ESLint 程式碼檢查設定檔
 *
 * 使用 Expo 官方提供的 ESLint 設定
 * 執行 `npm run lint` 檢查程式碼風格
 *
 * @see https://docs.expo.dev/guides/using-eslint/
 */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,  // 繼承 Expo 預設規則
  {
    // 忽略不檢查的目錄
    ignores: ['dist/*'],  // 編譯輸出目錄
  },
]);
