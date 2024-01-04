import { upperFirst } from 'scule'
import { undent } from '../string'

export const buildNavigationTree = adminSchema => undent`export const navigationTree = [
  ${adminSchema.map(({ table }) => undent`{
    label: '${upperFirst(table)}',
    to: '/admin/${table}',
  }`)}
]`
