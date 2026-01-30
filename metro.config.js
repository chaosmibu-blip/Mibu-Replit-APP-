/**
 * Metro Bundler 設定檔
 *
 * Metro 是 React Native 的 JavaScript 打包工具
 * 此設定整合 NativeWind，讓 Tailwind CSS 能在 RN 中運作
 *
 * @see https://docs.expo.dev/guides/customizing-metro/
 */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// 取得 Expo 預設 Metro 設定
const config = getDefaultConfig(__dirname);

// 整合 NativeWind，指定全域 CSS 入口點
module.exports = withNativeWind(config, { input: "./global.css" });
