import { eventHandler, type EventHandlerResponse, type H3Event, type HTTPMethod as _HTTPMethod } from 'h3';
import type { Constructable } from "mixwith.ts";

type HTTPMethod = Lowercase<_HTTPMethod>;

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
    return '1.0';
  }

  initializeRequest(event: H3Event): H3Event {
    return event
  }

  async afterRequest(event: H3Event): Promise<void> {
    const version = this.determineVersion(event);
    await this.performAuthentication(event);
    await this.checkPermissions(event);
    await this.checkThrottles(event);
  }

  beforeResponse({ event, response }: { event: H3Event, response: EventHandlerResponse }): EventHandlerResponse {
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
