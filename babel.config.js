/**
 * Babel 轉譯設定檔
 *
 * Babel 負責將現代 JavaScript/TypeScript 轉譯為可執行的程式碼
 * 此設定整合 Expo 和 NativeWind
 *
 * @see https://docs.expo.dev/guides/customizing-babel/
 */
module.exports = function (api) {
  api.cache(true);  // 啟用快取，加速編譯

  return {
    presets: [
      // Expo 預設 preset，設定 JSX 使用 NativeWind
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // NativeWind Babel preset（處理 className 轉換）
      "nativewind/babel",
    ],
    // 注意：@tamagui/babel-plugin 因 Expo Go 相容性問題已移除
    // Tamagui 在開發模式下仍可運作（只是較慢）
    // 正式 build 時可考慮重新啟用以提升效能
  };
};
