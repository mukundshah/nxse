export declare class SQL {
  private _value: string

  constructor(value: string)

  toString(): string
}

export type NamingStrategy = 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_CASE' | ((name: string) => string)
