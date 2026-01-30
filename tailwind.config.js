/**
 * Tailwind CSS + NativeWind 設定檔
 *
 * NativeWind 讓我們在 React Native 中使用 Tailwind CSS 語法
 * 此設定定義 Mibu 品牌色彩，可用 className="bg-mibu-cream" 方式使用
 *
 * @see https://www.nativewind.dev/
 * @see constants/Colors.ts - 完整品牌色彩定義
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // 掃描這些檔案中的 className
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  // 使用 NativeWind preset（讓 Tailwind 支援 React Native）
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      // ============ Mibu 品牌色彩 ============
      // 用法：className="bg-mibu-cream text-mibu-brown"
      colors: {
        mibu: {
          // 背景色系（大地色調）
          cream: '#F5E6D3',              // 主要背景色（奶油色）
          'cream-light': '#FDF8F3',      // 更淺的背景
          'cream-dark': '#E8D5C0',       // 較深的背景/邊框

          // 主色（棕色系）
          brown: '#7A5230',              // 主要按鈕、強調文字
          'brown-light': '#9A7250',      // 次要文字
          'brown-dark': '#5A3820',       // 深色標題

          // 輔色（銅色系）
          copper: '#B08860',             // icon、裝飾元素
          'copper-light': '#C9A580',     // 淺銅色

          // 中性色
          tan: '#D4B896',                // 米黃色
          'tan-light': '#E5D4BC',        // 淺米黃
          dark: '#3D2415',               // 深咖啡（文字）
          'dark-bg': '#2A1A0F',          // 最深色（深色模式背景）

          // 特殊色
          'warm-white': '#FFFAF5',       // 暖白色（卡片背景）
          highlight: '#FFEFD8',          // 高亮背景
        },
      },
    },
  },

  plugins: [],
};
