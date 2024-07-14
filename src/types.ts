import type { HTTPMethod as _HTTPMethod } from 'h3';

export type HTTPMethod = Lowercase<_HTTPMethod>;

export type ExcludedKeys = 'list' | 'create' | 'retrieve' | 'update' | 'amend' | 'destroy';

export type DecoratorFn = (target: any, propertyKey: Exclude<string, ExcludedKeys>, descriptor: PropertyDescriptor) => void;

export type MethodMap = {
  [key in HTTPMethod]?: string;
}
