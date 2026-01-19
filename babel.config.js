module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Note: @tamagui/babel-plugin removed due to Expo Go compatibility issues
    // Tamagui works without it in development mode (just slower)
    // Re-enable for production builds if needed
  };
};
