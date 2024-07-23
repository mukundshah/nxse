import { createRouter, type EventHandlerResponse, type H3Event } from 'h3';
import type { MethodMap } from '../types';
import type { ModelController } from './model-controller';
import type { Controller } from './controller';
import { getActions } from './decorators';

interface Action {
  name: string;
  path: string;
  detail: boolean;
  method: string;
}

export interface RouteOptions {
  url: string;
  mappping?: MethodMap;
  detail: boolean;
}

export interface DynamicRouteOptions {
  url: string;
  detail: boolean;
}

export class Route {
  declare url: string;
  declare mappping: MethodMap;
  declare detail: boolean;

  constructor(public options: Partial<RouteOptions>) {
    Object.assign(this, options);
  }
}

export class DynamicRoute {
  declare url: string;
  declare detail: boolean;

  constructor(public options: Partial<DynamicRouteOptions>) {
    Object.assign(this, options);
  }
}

function strformat(str: string, params: Record<string, string>): string {
  return str.replace(/{([^{}]*)}/g, (match, key) => {
    return params[key] || match;
  });
}

function getAllPrototypeNamesSet(obj: object): Set<string> {
  const names = new Set<string>();
  let currentObj = obj;
  while (currentObj) {
    Object.getOwnPropertyNames(currentObj).forEach((name) => names.add(name));
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return names;
}

function getAllPrototypeNames(obj: object): string[] {
  return Array.from(getAllPrototypeNamesSet(obj));
}

export interface RouterOptions {
  trailingSlash?: boolean;
}

export class Router {
  private readonly _registered = new Set<string>();
  private readonly _router = createRouter();
  readonly trailsingSlash: string;

  readonly routes = [
    new Route({
      url: '{prefix}{trailingSlash}',
      detail: false,
      mappping: {
        'get': 'list',
        'post': 'create'
      },
    }),
    new DynamicRoute({
      url: '{prefix}/{path}{trailingSlash}',
      detail: false
    }),
    new Route({
      url: '{prefix}/{lookup}{trailingSlash}',
      detail: true,
      mappping: {
        'get': 'retrieve',
        'put': 'update',
        'patch': 'amend',
        'delete': 'destroy'
      },
    }),
    new DynamicRoute({
      url: '{prefix}/{lookup}/{path}{trailingSlash}',
      detail: true
    }),
  ] as (Route | DynamicRoute)[];

  constructor(options: Partial<RouterOptions> = {}) {
    this.trailsingSlash = options.trailingSlash ? '/' : '';
  }

  name?: string;

  private _getDynamicRoute(route: DynamicRoute, action: Action): Route {
    return new Route({
      url: strformat(route.url, {
        prefix: action.path.split('/')[0],
        path: action.path.split('/').slice(1).join('/'),
        trailingSlash: this.trailsingSlash,
      }),
      detail: route.detail,
      mappping: {
        [action.method.toLowerCase()]: action.name,
      },
    });
  }

  private _getRoutes(controller: typeof ModelController): Route[] {
    const routes: Route[] = [];

    // Get actions from decorators
    const actions = getActions(controller);
    for (const action of actions) {
      if (action.path) {
        routes.push(new Route({
          url: action.path,
          detail: action.detail,
          mappping: {
            [action.method]: action.name,
          },
        }));
      }
    }

    // Add default routes
    for (const route of this.routes) {
      if (route instanceof DynamicRoute) {
        for (const action of actions) {
          if (!action.path) {
            routes.push(this._getDynamicRoute(route, {
              name: action.name,
              path: action.name,
              detail: action.detail,
              method: action.method,
            }));
          }
        }
        continue;
      }

      routes.push(route);
    }

    return routes;
  }

  private _getMethodMap(controller: typeof Controller, methodMap: MethodMap): MethodMap {
    const result: MethodMap = {};

    const names = getAllPrototypeNames(controller.prototype);
    for (const [method, name] of Object.entries(methodMap)) {
      if (names.includes(name)) {
        result[method] = name;
      }
    }

    return result;
  }

  getDefaultBaseName(controller: object): string {
    return controller.constructor.name.toLowerCase().replace(/controller$/, '');
  }

  getLookupParam(controller: typeof ModelController): string {
    return 'lookup';
  }

  register(prefix: string, controllerClass: typeof ModelController, { name }: { name?: string } = {}) {
    if (this._registered.has(prefix)) {
      throw new Error(`URL prefix ${prefix} is already registered.`);
    }

    const lookupParam = this.getLookupParam(controllerClass);

    for (const route of this._getRoutes(controllerClass)) {
      const url = strformat(route.url, {
        prefix,
        lookup: `:${lookupParam}`,
        trailingSlash: this.trailsingSlash,
      });

      const methodMap = this._getMethodMap(controllerClass, route.mappping || {});

      for (const [method, handler] of Object.entries(methodMap)) {
        this._router.add(
          url,
          controllerClass.asHandler(route.detail, lookupParam),
          method.toUpperCase() as any,
        );
      }
    }

    this._registered.add(prefix);
  }

  app() {
    return this._router;
  }

  handler() {
    return this._router;
  }
}
