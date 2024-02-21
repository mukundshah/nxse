import type { InputHTMLAttributes } from 'vue'
import { defineComponent, h } from '#imports'
import { FormLabel } from '~/src/runtime/components/ui/form'
import { cn } from '~/src/utils'

interface AutoFormLabelProps {
  label: string
  required?: InputHTMLAttributes['required']
  class?: InputHTMLAttributes['class']
}

export const AutoFormTooltip = defineComponent<AutoFormLabelProps>((props) => {
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


function AutoFormTooltip({ fieldConfigItem }: { fieldConfigItem: any }) {
  return (
    <>
      {fieldConfigItem?.description && (
        <p className="text-sm text-gray-500 dark:text-white">
          {fieldConfigItem.description}
        </p>
      )}
    </>
  );
}

export default AutoFormTooltip;
