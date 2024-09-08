import type { StatusCode } from "h3";
import type {  Constructable } from "mixwith.ts";

import { ModelAPIControllerBase } from "./controllers";
import type { Serializer } from "./serializers";

export const CreateModelMixin = <T extends Constructable<ModelAPIControllerBase>>(superclass: T) =>
  class CreateModelMixin extends superclass {
    create(request: Request, ...args: any[]): Response {
      const serializer = this.get_serializer(request.body);
      if (serializer.is_valid(true)) {
        this.perform_create(serializer);
        const headers = this.get_success_headers(serializer.data);
        return new Response(serializer.data, {
          status: 201 as StatusCode,
          headers: headers
        });
      }
      return new Response(null, { status: 400 as StatusCode });
    }

    perform_create(serializer: Serializer): void {
      serializer.save();
    }

    get_success_headers(data: any): Record<string, string> {
      try {
        return { 'Location': data.url };
      } catch (error) {
        return {};
      }
    }
  };

export const ListModelMixin = <T extends Constructable<ModelAPIControllerBase>>(superclass: T) =>
  class ListModelMixin extends superclass {
    list(request: Request, ...args: any[]): Response {
      const queryset = this.filter_queryset(this.get_queryset());
      const page = this.paginate_queryset(queryset);
      if (page !== null) {
        const serializer = this.get_serializer(page, true);
        return this.get_paginated_response(serializer.data);
      }
      const serializer = this.get_serializer(queryset, true);
      return new Response(serializer.data);
    }
  };

export const RetrieveModelMixin = <T extends Constructable<ModelAPIControllerBase>>(superclass: T) =>
  class RetrieveModelMixin extends superclass {
    retrieve(request: Request, ...args: any[]): Response {
      const instance = this.get_object();
      const serializer = this.get_serializer(instance);
      return new Response(serializer.data);
    }
  };

export const UpdateModelMixin = <T extends Constructable<ModelAPIControllerBase>>(superclass: T) =>
  class UpdateModelMixin extends superclass {
    update(request: Request, ...args: any[]): Response {
      const partial = args.includes('partial');
      const instance = this.get_object();
      const serializer = this.get_serializer(instance, false, partial);
      if (serializer.is_valid(true)) {
        this.perform_update(serializer);
        return new Response(serializer.data);
      }
      return new Response(null, { status: 400 as StatusCode });
    }

    perform_update(serializer: Serializer): void {
      serializer.save();
    }

    partial_update(request: Request, ...args: any[]): Response {
      return this.update(request, ...args, 'partial');
    }
  };

export const DestroyModelMixin = <T extends Constructable<ModelAPIControllerBase>>(superclass: T) =>
  class DestroyModelMixin extends superclass {
    destroy(request: Request, ...args: any[]): Response {
      const instance = this.get_object();
      this.perform_destroy(instance);
      return new Response(null, { status: 204 as StatusCode });
    }

    perform_destroy(instance: any): void {
      instance.delete();
    }
  };
