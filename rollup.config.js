const { lezer } = require('@lezer/generator/rollup');

module.exports = {
  input: './grammar/my.grammar',
  output: [
    {
      format: 'es',
      file: './src/grammar/index.js',
    },
  ],
  watch: {
    include: 'grammar/**',
  },
  external: ['@lezer/lr', '@lezer/highlight'],
  plugins: [lezer()],
};
