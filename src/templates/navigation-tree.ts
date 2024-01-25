import { upperFirst } from 'scule'
import { joinURL } from 'ufo'

import { undent } from '../string'

export const buildNavigationTree = (route, adminSchema) => undent`export const navigationTree = [
  ${adminSchema.map(({ table }) => undent`{
    label: '${upperFirst(table)}',
    to: '${joinURL('/', route, table)}',
  }`)}
]`
