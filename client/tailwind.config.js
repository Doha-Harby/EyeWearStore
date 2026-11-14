/** Brand tokens live here so every component uses the same palette and type scale. */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F6F1',
        charcoal: '#242424',
        // Champagne Gold #C6A76B is too light for small text on white (contrast ~2.3:1),
        // so `gold-deep` is the text-safe shade; DEFAULT is for fills, borders and accents.
        gold: { DEFAULT: '#C6A76B', deep: '#8A6D33' },
        // Same idea: Stone Gray #8D8A84 for decoration, `stone-deep` for readable muted text (AA).
        stone: { DEFAULT: '#8D8A84', deep: '#66635E' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { brand: '0.32em' },
    },
  },
  plugins: [],
};
