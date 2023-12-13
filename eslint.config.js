import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

export default await antfu(
  {
    plugins: { tailwind },
    overrides: {
      vue: {
        'vue/no-multiple-template-root': 'off',
        'vue/component-options-name-casing': ['error', 'kebab-case'],
        'vue/html-self-closing': ['error', { html: { normal: 'never', void: 'always' } }],
      },
    },
  },
  {
    rules: {
      'antfu/if-newline': 'off',
      'antfu/top-level-function': 'off',
    },
  },
)
