import { type H3Event, type EventHandlerResponse, readBody, createError } from 'h3';
import { Controller } from './controller';
import type { Constructable } from "mixwith.ts";
import { mix } from "mixwith.ts";
import { Serializer } from '../serializers/base';
import { NamingStrategy } from './naming';
import { Paginator } from './pagination';

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
    return {
      request: this.event,
    };
  }

  getSerializer(instance?: any, many = false, partial = false): any {
    const serializerClass = this.getSerializerClass();
    const context = this.getSerializerContext();

    if (instance !== undefined) {
      return new serializerClass(instance, { context, many, partial });
    }
    return serializerClass;
  }

  getQueryset(): any[] {
    return this.queryset;
  }

  getObject(): any {
    const queryset = this.getQueryset();
    const lookupUrl = this.event.context.params[this.lookupParam];

    const obj = queryset.find((item) => item[this.lookupField] === lookupUrl);
    if (!obj) {
      throw createError({ statusCode: 404 });
    }

    return obj;
  }

  filterQueryset(queryset: any[]): any[] {
    for (const backend of this.filterBackends || []) {
      queryset = new backend().filter(this.event, queryset, this);
    }
    return queryset;
  }

  paginator(): any {
    if (!this._paginator && this.paginationClass) {
      this._paginator = new this.paginationClass();
    }
    return this._paginator;
  }

  paginateQueryset(queryset: any[]): any[] | null {
    const paginator = this.paginator();
    if (!paginator) return null;

    return paginator.paginate(queryset, this.event);
  }

  getPaginatedResponse(data: any): EventHandlerResponse {
    const paginator = this.paginator();
    if (!paginator) return data;

    return paginator.getResponse(data);
  }
}

export class ModelController extends Controller {
  protected model: any;
  protected serializer: typeof Serializer;
  protected namingStrategy: NamingStrategy;
  protected paginator: Paginator | null = null;

  constructor() {
    super();
    this.namingStrategy = new NamingStrategy();
  }

  protected getSerializerClass(): typeof Serializer {
    if (!this.serializer) {
      throw new Error('Serializer not specified');
    }
    return this.serializer;
  }

  protected getDataKey(many: boolean = false): string {
    const modelName = this.model.name;
    return many 
      ? this.namingStrategy.serializerCollectionKey(modelName)
      : this.namingStrategy.serializerDataKey(modelName);
  }

  protected async serializeResponse(data: any, many: boolean = false): Promise<any> {
    const SerializerClass = this.getSerializerClass();
    const serializer = new SerializerClass(data, { many });
    const serialized = await serializer.serialize();

    const response: any = {
      [this.getDataKey(many)]: serialized
    };

    // Add pagination metadata if available
    if (many && this.paginator) {
      const totalItems = await this.getTotalItems();
      response[this.namingStrategy.paginationKey()] = this.paginator.getMeta(totalItems);
    }

    return response;
  }

  protected async getTotalItems(): Promise<number> {
    // This should be implemented by the specific model controller
    // to return the total count of items for pagination
    throw new Error('getTotalItems() must be implemented');
  }

  async list(event: H3Event): Promise<EventHandlerResponse> {
    // Initialize paginator from request
    this.paginator = Paginator.fromRequest(event);
    
    // Get paginated data (to be implemented by specific controller)
    const items = await this.getItems(this.paginator);
    
    return this.serializeResponse(items, true);
  }

  protected async getItems(paginator: Paginator): Promise<any[]> {
    // This should be implemented by the specific model controller
    // to return paginated items
    throw new Error('getItems() must be implemented');
  }

  async create(event: H3Event): Promise<EventHandlerResponse> {
    const data = await readBody(event);
    const instance = await this.createInstance(data);
    return this.serializeResponse(instance);
  }

  async retrieve(event: H3Event): Promise<EventHandlerResponse> {
    const instance = await this.getInstance(event);
    return this.serializeResponse(instance);
  }

  async update(event: H3Event): Promise<EventHandlerResponse> {
    const data = await readBody(event);
    const instance = await this.updateInstance(event, data);
    return this.serializeResponse(instance);
  }

  async amend(event: H3Event): Promise<EventHandlerResponse> {
    const data = await readBody(event);
    const instance = await this.amendInstance(event, data);
    return this.serializeResponse(instance);
  }

  async destroy(event: H3Event): Promise<EventHandlerResponse> {
    await this.deleteInstance(event);
    return { success: true };
  }

  protected async createInstance(data: any): Promise<any> {
    throw new Error('createInstance() must be implemented');
  }

  protected async getInstance(event: H3Event): Promise<any> {
    throw new Error('getInstance() must be implemented');
  }

  protected async updateInstance(event: H3Event, data: any): Promise<any> {
    throw new Error('updateInstance() must be implemented');
  }

  protected async amendInstance(event: H3Event, data: any): Promise<any> {
    throw new Error('amendInstance() must be implemented');
  }

  protected async deleteInstance(event: H3Event): Promise<void> {
    throw new Error('deleteInstance() must be implemented');
  }
}

export const CreateModelMixin = <T extends Constructable<ModelControllerBase>>(superclass: T) =>
  class CreateModelMixin extends superclass {
    async create(event: H3Event): Promise<EventHandlerResponse> {
      const data = await readBody(event);
      const serializer = this.getSerializer(data);
      const validated = await serializer.validate(data);
      const instance = await serializer.create(validated);
      return instance;
    }
  };

export const ListModelMixin = <T extends Constructable<ModelControllerBase>>(superclass: T) =>
  class ListModelMixin extends superclass {
    async list(event: H3Event): Promise<EventHandlerResponse> {
      const queryset = this.filterQueryset(this.getQueryset());
      const page = this.paginateQueryset(queryset);
      const serializer = this.getSerializer(page || queryset, true);
      return this.getPaginatedResponse(serializer.data);
    }
  };

export const RetrieveModelMixin = <T extends Constructable<ModelControllerBase>>(superclass: T) =>
  class RetrieveModelMixin extends superclass {
    async retrieve(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      const serializer = this.getSerializer(instance);
      return serializer.data;
    }
  };

export const UpdateModelMixin = <T extends Constructable<ModelControllerBase>>(superclass: T) =>
  class UpdateModelMixin extends superclass {
    async update(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      const data = await readBody(event);
      const serializer = this.getSerializer(instance);
      const validated = await serializer.validate(data);
      const updated = await serializer.update(instance, validated);
      return updated;
    }

    async amend(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      const data = await readBody(event);
      const serializer = this.getSerializer(instance, false, true);
      const validated = await serializer.validate(data, true);
      const updated = await serializer.update(instance, validated);
      return updated;
    }
  };

export const DestroyModelMixin = <T extends Constructable<ModelControllerBase>>(superclass: T) =>
  class DestroyModelMixin extends superclass {
    async destroy(event: H3Event): Promise<EventHandlerResponse> {
      const instance = this.getObject();
      await this.performDestroy(instance);
      return null;
    }

    async performDestroy(instance: any): Promise<void> {
      // Implement destroy logic
    }
  };

export class ReadonlyModelController extends mix(ModelControllerBase).with(
  ListModelMixin,
  RetrieveModelMixin
) {}
