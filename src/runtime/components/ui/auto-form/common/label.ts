import type { InputHTMLAttributes } from 'vue'
import { defineComponent, h } from '#imports'
import { FormLabel } from '~/src/runtime/components/ui/form'
import { cn } from '~/src/utils'

interface AutoFormLabelProps {
  label: string
  required?: InputHTMLAttributes['required']
  class?: InputHTMLAttributes['class']
}

export const AutoFormLabel = defineComponent<AutoFormLabelProps>((props) => {
  return () => h(
    FormLabel,
    props,
    [
      props.label,
      props.required && h('span', { class: 'text-destructive' }, ' *'),
    ],
  )
}, {
  props: ['label', 'required', 'class'],
})
