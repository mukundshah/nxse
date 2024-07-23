import type { HTTPMethod } from './types';
import type { H3Event } from 'h3';
import 'reflect-metadata';
import { type AuthenticationClass } from './authentication';
import { type PermissionClass } from './permission';
import { type ThrottleClass } from './throttling';

const ACTION_METADATA = Symbol('action');
const AUTH_METADATA = Symbol('auth');
const PERMISSION_METADATA = Symbol('permission');
const THROTTLE_METADATA = Symbol('throttle');

export interface Action {
  name?: string;
  path?: string;
  method?: HTTPMethod;
  detail?: boolean;
  authenticators?: (typeof AuthenticationClass)[];
  permissions?: (typeof PermissionClass)[];
  throttles?: (typeof ThrottleClass)[];
}

export interface ActionMetadata {
  name: string;
  path: string;
  method: HTTPMethod;
  detail: boolean;
  authenticators?: (typeof AuthenticationClass)[];
  permissions?: (typeof PermissionClass)[];
  throttles?: (typeof ThrottleClass)[];
}

type ExcludedKeys = 'list' | 'create' | 'retrieve' | 'update' | 'amend' | 'destroy';
type DecoratorFn = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

export const action = (options: Partial<Action> = {}): DecoratorFn => {
  return function decorateAsAction(target: any, propertyKey: Exclude<string, ExcludedKeys>, descriptor: PropertyDescriptor) {
    const disallowedKeys: ExcludedKeys[] = ['list', 'create', 'retrieve', 'update', 'amend', 'destroy'];

    if (disallowedKeys.includes(propertyKey as ExcludedKeys)) {
      throw new Error(`Cannot use the @action decorator on the ${propertyKey} method, as it is an existing route.`);
    }

    const originalMethod = descriptor.value;
    descriptor.value = async function(event: H3Event, ...args: any[]) {
      // Handle authentication
      if (options.authenticators) {
        for (const AuthClass of options.authenticators) {
          const auth = new AuthClass();
          if (!(await auth.authenticate(event))) {
            throw new Error(`Authentication failed for ${AuthClass.name}`);
          }
        }
      }

      // Handle permission
      if (options.permissions) {
        for (const PermClass of options.permissions) {
          const permission = new PermClass();
          if (!(await permission.hasPermission(event))) {
            throw new Error(`Permission denied for ${PermClass.name}`);
          }
        }
      }

      // Handle throttling
      if (options.throttles) {
        for (const ThrottleClass of options.throttles) {
          const throttle = new ThrottleClass();
          if (!(await throttle.allowRequest(event))) {
            throw new Error(`Request throttled by ${ThrottleClass.name}`);
          }
        }
      }

      return originalMethod.apply(this, [event, ...args]);
    };

    const actions: ActionMetadata[] = Reflect.getMetadata(ACTION_METADATA, target.constructor) || [];
    actions.push({
      name: options.name ?? propertyKey,
      path: options.path ?? propertyKey,
      method: options.method ?? 'get',
      detail: options.detail ?? false,
      authenticators: options.authenticators,
      permissions: options.permissions,
      throttles: options.throttles,
    });

    Reflect.defineMetadata(ACTION_METADATA, actions, target.constructor);
    return descriptor;
  };
};

export function getActions(target: any): ActionMetadata[] {
  return Reflect.getMetadata(ACTION_METADATA, target) || [];
}

function getOrCreateMetadata<T>(key: symbol, target: any, propertyKey: string | symbol): T[] {
  const metadata = Reflect.getMetadata(key, target, propertyKey) || [];
  if (!Array.isArray(metadata)) {
    return [];
  }
  return metadata;
}

export function permission(...permissionClasses: (typeof PermissionClass)[]): MethodDecorator {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const existingPermissions = getOrCreateMetadata<typeof PermissionClass>(PERMISSION_METADATA, target, propertyKey);

    Reflect.defineMetadata(PERMISSION_METADATA, [...existingPermissions, ...permissionClasses], target, propertyKey);

    descriptor.value = async function(event: H3Event, ...args: any[]) {
      const permissions = Reflect.getMetadata(PERMISSION_METADATA, target, propertyKey) || [];

      for (const PermClass of permissions) {
        const permission = new PermClass();
        if (!(await permission.hasPermission(event))) {
          throw new Error(`Permission denied for ${PermClass.name}`);
        }
      }

      return originalMethod.apply(this, [event, ...args]);
    };

    return descriptor;
  };
}

export function throttle(...throttleClasses: (typeof ThrottleClass)[]): MethodDecorator {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const existingThrottles = getOrCreateMetadata<typeof ThrottleClass>(THROTTLE_METADATA, target, propertyKey);

    Reflect.defineMetadata(THROTTLE_METADATA, [...existingThrottles, ...throttleClasses], target, propertyKey);

    descriptor.value = async function(event: H3Event, ...args: any[]) {
      const throttles = Reflect.getMetadata(THROTTLE_METADATA, target, propertyKey) || [];

      for (const ThrottleClass of throttles) {
        const throttle = new ThrottleClass();
        if (!(await throttle.allowRequest(event))) {
          throw new Error(`Request throttled by ${ThrottleClass.name}`);
        }
      }

      return originalMethod.apply(this, [event, ...args]);
    };

    return descriptor;
  };
}

export function authentication(...authClasses: (typeof AuthenticationClass)[]): MethodDecorator {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const existingAuth = getOrCreateMetadata<typeof AuthenticationClass>(AUTH_METADATA, target, propertyKey);

    Reflect.defineMetadata(AUTH_METADATA, [...existingAuth, ...authClasses], target, propertyKey);

    descriptor.value = async function(event: H3Event, ...args: any[]) {
      const auths = Reflect.getMetadata(AUTH_METADATA, target, propertyKey) || [];

      for (const AuthClass of auths) {
        const auth = new AuthClass();
        if (!(await auth.authenticate(event))) {
          throw new Error(`Authentication failed for ${AuthClass.name}`);
        }
      }

      return originalMethod.apply(this, [event, ...args]);
    };

    return descriptor;
  };
}
