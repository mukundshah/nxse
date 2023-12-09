import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

export default await antfu(
  undefined,
  [
    {
      rules: {
        'antfu/if-newline': 'off',
        'antfu/top-level-function': 'off',
        'vue/no-multiple-template-root': 'off',
        'vue/component-options-name-casing': ['error', 'kebab-case'],
        'vue/html-self-closing': ['error', {
          html: { normal: 'never', void: 'always' },
        }],
      },
    },
    {
      plugins: {
        tailwind,
      },
    },
  ],
)
