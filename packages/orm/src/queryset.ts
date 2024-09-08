import type { IModel, IQueryset, IRow } from "./types";

export class Queryset implements IQueryset<IModel, IRow> {
  query: any;

  constructor(private model: IModel) { }

  toSQL(): string {
    return '';
  }

  create(values: any): any {
    return null;
  }

  update(values: any): any {
    return null;
  }

  delete(): any {
    return null;
  }

  bulkCreate(values: any): any {
    return null;
  }

  bulkUpdate(values: any): any {
    return null;
  }

  bulkDelete(): any {
    return null;
  }

  earliest(): any {
    return null;
  }

  latest(): any {
    return null;
  }

  first(): any {
    return null;
  }

  last(): any {
    return null;
  }

  get(opts: any): any {
    return null;
  }

  aggregate(): Record<string, any> {
    return {};
  }

  annotate(): this {
    return this;
  }

  all(): this {
    return this;
  }

  none(): this {
    return this;
  }

  filter(opts: any): this {
    return this;
  }


  exclude(opts: any): this {
    return this;
  }

  count(): number {
    return 0;
  }

  exists(): boolean {
    return false;
  }

  union(): this {
    return this;
  }

  intersection(): this {
    return this;
  }

  difference(): this {
    return this;
  }

  sort(...fields: any): this {
    return this;
  }

  distinct(): this {
    return this;
  }

  reverse(): this {
    return this;
  }

  defer(): this {
    return this;
  }

  only(): this {
    return this;
  }

  selectRelated(): this {
    return this;
  }

  prefetchRelated(): this {
    return this;
  }

  values(...fields: any): this {
    return this;
  }

  valuesList(field: any, opts: any): any[] {
    return [];
  }

  groupBy(): this {
    return this;
  }

  having(): this {
    return this;
  }

}
