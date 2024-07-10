
import { createApp, eventHandler, isEvent, getValidatedQuery, useBase, createError, createRouter, readBody } from 'h3';
import type { EventHandlerResponse, H3Event, HTTPMethod as _HTTPMethod } from 'h3';
import type { Constructable } from "mixwith.ts";
import { mix } from "mixwith.ts";

interface Action {
  name: string;
  path: string;
  detail: boolean;
  method: string;
}

type HTTPMethod = Lowercase<_HTTPMethod>;

type ExcludedKeys = 'list' | 'create' | 'retrieve' | 'update' | 'amend' | 'destroy';

type DecoratorFn = (target: any, propertyKey: Exclude<string, ExcludedKeys>, descriptor: PropertyDescriptor) => void;

type MethodMap = {
  [key in HTTPMethod]?: string;
}

export class Controller {
  declare rendererClasses: any[];
  declare parserClasses: any[];
  declare authenticationClasses: any[];
  declare throttleClasses: any[];
  declare permissionClasses: any[];
  declare contentNegotiationClass: any;
  declare metadataClass: any;
  declare event: H3Event;
  declare response: EventHandlerResponse;
  declare allowedMethods: HTTPMethod[]

  readonly httpMethodNames = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  getAuthenticators(): any[] {
    return this.authenticationClasses || [];
  }


  getThrottles(): any[] {
    return this.throttleClasses || [];
  }

  getPermissions(): any[] {
    return this.permissionClasses || [];
  }

  getErrorHandler(): (error: Error) => EventHandlerResponse {
    return (error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  async performAuthentication(event: H3Event): Promise<void> {
    for (const AuthClass of this.getAuthenticators()) {
      const auth = new AuthClass();
      await auth.authenticate(event);
    }
  }

  async checkPermissions(event: H3Event): Promise<boolean> {
    for (const PermissionClass of this.getPermissions()) {
      const permission = new PermissionClass();
      if (!(await permission.hasPermission(event))) {
        return false;
      }
    }
    return true;
  }

  async checkObjectPermissions(event: H3Event, obj: any): Promise<boolean> {
    for (const PermissionClass of this.getPermissions()) {
      const permission = new PermissionClass();
      if (!(await permission.hasObjectPermission(event, obj))) {
        return false;
      }
    }
    return true;
  }

  async checkThrottles(event: H3Event): Promise<boolean> {
    for (const ThrottleClass of this.getThrottles()) {
      const throttle = new ThrottleClass();
      if (!(await throttle.allowRequest(event))) {
        return false;
      }
    }
    return true;
  }

  determineVersion(event: H3Event): string {
    // Implement version determination logic here
    return '1.0';
  }

  initializeRequest(event: H3Event): H3Event {
    return event
  }

  async afterRequest(event: H3Event): Promise<void> {
    const version = this.determineVersion(event);

    //     # Determine the API version, if versioning is in use.
    //     version, scheme = self.determine_version(request, *args, **kwargs)
    //     request.version, request.versioning_scheme = version, scheme

    await this.performAuthentication(event);
    await this.checkPermissions(event);
    await this.checkThrottles(event);
  }

  beforeResponse({ event, response }: { event: H3Event, response: EventHandlerResponse }): EventHandlerResponse {
    // Implement response finalization logic here
    return response;
  }

  handleError(error: Error): EventHandlerResponse {
    return this.getErrorHandler()(error);
  }

  async dispatch(event: H3Event, opts: Record<string, any> = {}): Promise<EventHandlerResponse> {
    const { detail, lookupParam } = opts;
    this.event = this.initializeRequest(event);

    let response: EventHandlerResponse;
    try {
      await this.afterRequest(event);

      const handler = this.allowedMethods!.includes(event.method.toLowerCase() as HTTPMethod)
        ? this[event.method.toLowerCase()] || this.httpMethodNotAllowed
        : this.httpMethodNotAllowed;

      response = await handler(event);
    } catch (error) {
      response = this.handleError(error as Error);
    }

    this.response = this.beforeResponse({ event, response });
    return this.response;
  }

  async httpMethodNotAllowed(event: H3Event): Promise<EventHandlerResponse> {
    event.respondWith(new Response(null, { status: 405 }));
    return null;
  }

  static asHandler(...args: any[]) {
    return eventHandler((event: H3Event) => {
      const controller = new this();
      controller.event = event;
      return controller.dispatch(event);
    });
  }

  async options(event: H3Event): Promise<EventHandlerResponse> {
    if (!this.metadataClass) {
      return this.httpMethodNotAllowed(event);
    }
    const data = new this.metadataClass().getMetadata(event, this);

    return data;
  }
}


const ActionMixin = <T extends Constructable<Controller>>(superclass: T) =>
  class ActionMixin extends superclass {
    private static actions: Action[] = [];
    declare action: string;
    declare actionMap: Record<string, string>;

    static addExtraAction(action: Action) {
      this.actions.push(action);
    }

    static getExtraActions(): Action[] {
      return this.actions;
    }

    // static getExtraActionsUrls(): string[] {
    //   return this.actions.map((action) => action.path);
    // }

    override initializeRequest(event: H3Event): H3Event {
      event = super.initializeRequest(event);
      const method = event.method.toLowerCase() as HTTPMethod;
      this.action = method === 'options' ? 'metadata' : this.actionMap[method];

      return event;
    }

    static asHandler(...args: any[]) {
      const [actions, { detail, lookupParam }] = args;

      if (!actions || Object.keys(actions).length === 0) {
        throw new Error('No actions provided');
      }

      return eventHandler((event: H3Event) => {
        const controller = new this();
        controller.event = event;

        if (actions['get'] && !actions['head']) {
          actions['head'] = actions['get'];
        }

        controller.actionMap = actions
        controller.allowedMethods = Object.keys(actions).map((method) => method.toLowerCase() as HTTPMethod);

        for (const [method, action] of Object.entries(actions)) {
          const handler = controller[action as keyof typeof controller];
          if (handler) {
            Object.defineProperty(controller, method, {
              value: handler,
              writable: false,
              configurable: true,
              enumerable: true
            });
          }
        }

        return controller.dispatch(event, { detail, lookupParam });
      })
    }
  };


export class ModelControllerBase extends Controller {
  declare model: any;
  declare queryset: any[];
  declare serializerClass: any;
  declare lookupField: string;
  declare lookupParam: string;
  declare filterBackends: any[];
  declare paginationClass: any;
  private _paginator: any;

  getSerializerClass(): any {
    return this.serializerClass;
  }

  getSerializerContext(): Record<string, any> {
    return {};
  }

  getSerializer(instance?: any, many = false, partial = false): Serializer {
    const SerializerClass = this.getSerializerClass();
    return new SerializerClass(instance, { many, partial });
  }

  getQueryset(): any[] {
    return this.queryset;
  }

  getObject(): any {
    const queryset = this.filterQueryset(this.getQueryset());
    // Implement logic to get the object based on the lookup field
    return queryset[0]; // Placeholder implementation
  }

  filterQueryset(queryset: any[]): any[] {
    for (const BackendClass of this.filterBackends || []) {
      const backend = new BackendClass();
      queryset = backend.filterQueryset(this.event, queryset, this);
    }
    return queryset;
  }

  get paginator(): any {
    this._paginator = this._paginator || new this.paginationClass();
    return this._paginator;
  }

  paginateQueryset(queryset: any[]): any[] | null {
    if (this.paginator) {

      return this.paginator.paginateQueryset(queryset, this.event, this);
    }
    return null;
  }

  getPaginatedResponse(data: any): EventHandlerResponse {
    if (!this.paginator) {
      throw new Error('Cannot use `getPaginatedResponse` without a paginator');
    }
    return this.paginator.getPaginatedResponse(data);
  }
}

export class ModelController extends mix(ModelControllerBase).with(ActionMixin) { }


export const CreateModelMixin = <T extends Constructable<ModelController>>(superclass: T) =>
  class CreateModelMixin extends superclass {
    async create(event: H3Event): Promise<EventHandlerResponse> {
      const body = await readBody(event);
      const serializer = this.getSerializer(body);
      if (await serializer.isValid()) {
        this.performCreate(serializer);
        const headers = this.getSuccessHeaders(serializer.data);
        return serializer.data;
      }

      throw createError({
        status: 400,
        data: serializer.errors
      })
    }

    performCreate(serializer: Serializer): void {
      serializer.save();
    }

    getSuccessHeaders(data: any): Record<string, string> {
      try {
        return { 'Location': data.url };
      } catch (error) {
        return {};
      }
    }
  };

export const ListModelMixin = <T extends Constructable<ModelController>>(superclass: T) =>
  class ListModelMixin extends superclass {
    async list(event: H3Event): Promise<EventHandlerResponse> {
      const queryset = this.filterQueryset(this.getQueryset());
      const page = this.paginateQueryset(queryset);
      if (page !== null) {
        const serializer = this.getSerializer(page, true);
        return this.getPaginatedResponse(serializer.data);
      }
      const serializer = this.getSerializer(queryset, true);
      return serializer.data;
    }
  };

export const RetrieveModelMixin = <T extends Constructable<ModelController>>(superclass: T) =>
  class RetrieveModelMixin extends superclass {
    async retrieve(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      const serializer = this.getSerializer(instance);
      return serializer.data;
    }
  };

export const UpdateModelMixin = <T extends Constructable<ModelController>>(superclass: T) =>
  class UpdateModelMixin extends superclass {
    async update(event: H3Event): Promise<EventHandlerResponse> {
      const partial = event.context.partial === true;
      const instance = this.getObject();
      const body = await readBody(event);
      const serializer = this.getSerializer(instance, false, partial);

      Object.assign(serializer.instance, body);

      if (serializer.isValid(true)) {
        this.performUpdate(serializer);
        return serializer.data
      }

      throw createError({
        status: 400,
        data: serializer.errors
      })
    }

    performUpdate(serializer: Serializer): void {
      serializer.save();
    }

    async amend(event: H3Event): Promise<EventHandlerResponse> {
      event.context.partial = true;
      return this.update(event);
    }
  };

export const DestroyModelMixin = <T extends Constructable<ModelController>>(superclass: T) =>
  class DestroyModelMixin extends superclass {
    async destroy(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      this.perform_destroy(instance);

      event.respondWith(new Response(null, { status: 204 }));
      return null
    }

    perform_destroy(instance: any): void {
      instance.delete();
    }
  };

export class ModelAPIController extends mix(ModelController).with(
  CreateModelMixin,
  ListModelMixin,
  RetrieveModelMixin,
  UpdateModelMixin,
  DestroyModelMixin
) { }

export class ReadonlyModelAPIController extends mix(ModelController).with(
  ListModelMixin,
  RetrieveModelMixin
) { }


export const action = (options: Partial<Action> = {}): DecoratorFn => {
  return function decorateAsAction(target: any, propertyKey: Exclude<string, ExcludedKeys>, descriptor: PropertyDescriptor) {
    const disallowedKeys: ExcludedKeys[] = ['list', 'create', 'retrieve', 'update', 'amend', 'destroy'];

    if (disallowedKeys.includes(propertyKey as ExcludedKeys)) {
      throw new Error(`Cannot use the @action decorator on the ${propertyKey} method, as it is an existing route.`);
    }

    const ModelControllerClass = target.constructor as typeof ModelController;
    ModelControllerClass.addExtraAction({
      name: options.name ?? propertyKey,
      path: options.path ?? propertyKey,
      detail: options.detail ?? false,
      method: options.method ?? 'get',
    });
  };
}

interface RouteOptions {
  url: string;
  mappping: MethodMap;
  detail: boolean;
}

interface DynamicRouteOptions {
  url: string;
  detail: boolean;
}

class Route {
  declare url: string;
  declare mappping: MethodMap;
  declare detail: boolean;

  constructor(public options: Partial<RouteOptions>) {
    Object.assign(this, options);
  }
}

class DynamicRoute {
  declare url: string;
  declare detail: boolean;

  constructor(public options: Partial<DynamicRouteOptions>) {
    Object.assign(this, options);
  }
}

const strformat = (str: string, params: Record<string, string>) => {
  return str.replace(/\{([^}]+)\}/g, (_, key) => {
    return params[key] || '';
  });
}

const getAllPrototypeNamesSet = (obj: object): Set<string> => {
  const props = new Set<string>();
  while (obj !== null) {
    Object.getOwnPropertyNames(obj).forEach(name => props.add(name));
    obj = Object.getPrototypeOf(obj);
  }

  return props;
}

const getAllPrototypeNames = (obj: object): string[] => {
  return Array.from(getAllPrototypeNamesSet(obj));
}

interface RouterOptions {
  trailingSlash: boolean;
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

  private _getDynamicRoute(route: DynamicRoute, action: Action) {
    const detail = route.detail;
    const url = strformat(route.url, {
      prefix: '{prefix}',
      path: action.path,
      trailingSlash: this.trailsingSlash,
      lookup: '{lookup}',
    });

    return new Route({
      url,
      detail,
      mappping: {
        [action.method]: action.name
      }
    });
  }

  private _getRoutes(controller: typeof ModelController): Route[] {
    const knownActions = ['list', 'create', 'retrieve', 'update', 'amend', 'destroy'];
    const unknownActions = controller.getExtraActions();

    const notAllowed = unknownActions.filter((action) => knownActions.includes(action.name)).map((action) => action.name);
    if (notAllowed.length) {
      throw new Error(`Cannot use the @action decorator on the following methods, as they are existing routes: ${notAllowed.join(', ')}`);
    }

    const detailActions = unknownActions.filter((action) => action.detail);
    const listActions = unknownActions.filter((action) => !action.detail);

    const _routes = [] as Route[];

    for (const route of this.routes) {
      if (route instanceof DynamicRoute && route.detail) {
        _routes.push(...detailActions.map((action) => this._getDynamicRoute(route, action)));
      } else if (route instanceof DynamicRoute && !route.detail) {
        _routes.push(...listActions.map((action) => this._getDynamicRoute(route, action)));
      } else {
        _routes.push(route as Route);
      }
    }

    return _routes;
  }

  private _getMethodMap(controller: typeof Controller, methodMap: MethodMap): MethodMap {
    const properties = getAllPrototypeNamesSet(controller.prototype);

    const boundMethods = Object.keys(methodMap).reduce((methods, method) => {

      // if (!this.httpMethodNames.includes(method)) {
      //   return methods;
      // }

      const action = methodMap[method as keyof MethodMap];

      if (action === 'constructor') {
        throw new Error('Cannot bind the constructor method to a route');
      }

      if (action && properties.has(action)) {
        methods[method as keyof MethodMap] = action;
      }

      return methods;
    }, {} as MethodMap);

    console.log('[_getMethodMap]', boundMethods);

    return boundMethods;
  }

  getDefaultBaseName(controller: object) {
    return controller.constructor.name;
  }

  getLookupParam(controller: typeof ModelController) {
    return controller.prototype.lookupParam || controller.prototype.lookupField || 'pk';
  }

  // add options like namespace for namespace versioning

  register(prefix: string, controllerClass: typeof ModelController, { name }: { name?: string } = {}) {

    const controllerInstance = new controllerClass();
    const routes = this._getRoutes(controllerClass);
    const lookupParam = this.getLookupParam(controllerClass);

    const baseName = name || this.getDefaultBaseName(controllerClass);
    if (this._registered.has(baseName)) {
      throw new Error(`The base name ${baseName} has already been registered`);
    }
    this._registered.add(baseName);

    for (const route of routes) {
      const mapping = route.mappping;
      const detail = route.detail;
      const url = strformat(route.url, {
        prefix,
        trailingSlash: this.trailsingSlash,
        lookup: detail ? `:${lookupParam}` : ''
      });

      const methodMap = this._getMethodMap(controllerClass, mapping);

      if (Object.keys(methodMap).length === 0) {
        continue;
      }

      this._router.add(url, controllerClass.asHandler(methodMap, { detail, lookupParam }));
      // this._router.on("", url, controllerClass.asHandler(methodMap));
    }
  }

  get app() {
    return this._router;
  }

  get handler() {
    return this._router.handler
  }
}

// Example usage
const router = new Router()

class DemoController extends ModelAPIController {
  override queryset = [];
  override serializerClass = {};
  // static override getExtraActions(): Action[] {
  //   return [
  //     { name: 'custom', path: 'custom', detail: false, method: 'get' }
  //   ];
  // }

  // override async list(event: H3Event) {
  //   return {
  //     message: 'list'
  //   }
  //   // return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  // }

  // override async create(event: H3Event) {
  //   return {
  //     message: 'create'
  //   }
  //   // return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });
  // }



  @action({ detail: true })
  async custom(event: H3Event) {
    return 'custom';
  }
}

router.register('/demo', DemoController);

const app = createApp();
app.use(router.handler);

export { app };
