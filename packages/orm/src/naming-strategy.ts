/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { snakeCase } from 'scule'
import type { INamingStrategy, IModel } from '@/types'

/**
 * Camelcase naming strategy for the model to use camelcase keys
 * for the serialized output.
 */
export class CamelCaseNamingStrategy implements INamingStrategy {
  /**
   * The default table name for the given model
   */
  tableName(model: IModel): string {
    return `${snakeCase(model.name)}`
  }

  /**
   * The database column name for a given model attribute
   */
  columnName(_: IModel, attributeName: string): string {
    return snakeCase(attributeName)
  }
}
