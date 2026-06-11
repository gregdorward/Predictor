const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  style: {
    postcss: {
      plugins: [
        purgecss({
          content: [
            "./src/**/*.{js,jsx,ts,tsx}",
            "./public/index.html",
          ],
          defaultExtractor: (content) =>
            content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: {
            standard: [/^dark-mode/, /^app-splash/, /^sr-only/, /^swiper/],
            deep: [/^MuiDataGrid/, /^MuiTable/, /^MuiButton/, /^css-/],
          },
        }),
      ],
    },
  },
};
