import {
  AvatarFallback as RadixAvatarFallback,
  AvatarImage as RadixAvatarImage,
  AvatarRoot as RadixAvatarRoot,
} from 'radix-vue'

import type { AvatarFallbackProps, AvatarImageProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'

import { defineComponent, h } from '#imports'

export const Avatar = defineComponent((props) => {
  return () => h(RadixAvatarRoot, props)
})

export const AvatarFallback = defineComponent((props: AvatarFallbackProps) => {
  return () => h(RadixAvatarFallback, props)
})

export const AvatarImage = defineComponent((props: AvatarImageProps) => {
  return () => h(RadixAvatarImage, props)
})
