import { createRouter } from 'h3';

export class Router {
  private readonly _h3Router = createRouter();
  readonly routes = [];

  register(path: string, controller: any) {
    console.log(`Registering path ${path}`);
  }

  get handler() {
    return this._h3Router.handler
  }
}
