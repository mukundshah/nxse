import type { StatusCode } from "h3";
import { CreateModelMixin, DestroyModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin } from "./mixins";
import { mix } from "mixwith.ts";

export class APIControllerBase {
  declare authenitcation_classes: any[];
  declare permission_classes: any[];
  declare throttle_classes: any[];
  declare parser_classes: any[];

  get_authenticators(): any[] {
    return [];
  }

  get_permisssions(): any[] {
    return [];
  }

  get_throttles(): any[] {
    return [];
  }

  get_parsers(): any[] {
    return [];
  }

  get_error_handler(): (error: Error) => Response {
    return (error: Error) => new Response(null, { status: 500 as StatusCode });
  }

  perform_authentication(request: Request, ...args: any[]): void {
    // Implementation
  }

  check_permissions(request: Request, ...args: any[]): boolean {
    return true;
  }

  check_object_permissions(request: Request, ...args: any[]): boolean {
    return true;
  }

  check_throttles(request: Request, ...args: any[]): boolean {
    return true;
  }

  // initialize
  // initial
  // finalize_response

  handle_error(error: Error): Response {
    return new Response(null, { status: 500 as StatusCode });
  }

  throw_uncatched_error(error: Error): void {
    throw error;
  }

  // dispatch

  options(request: Request, ...args: any[]): Response {
    return new Response(null, { status: 405 as StatusCode });
  }
}

export class ModelAPIControllerBase extends APIControllerBase {
  declare queryset: any[];
  declare serializer_class: any;

  declare lookup_field: string;
  declare lookup_url_kwarg: string;
  declare lookup_value_regex: string;

  declare filter_backends: any[];
  declare pagination_class: any;

  get_serializer_class(): any {
    return this.serializer_class;
  }

  get_serializer(data?: any, many?: boolean, partial?: boolean): any {
    let Serializer = this.get_serializer_class();
    return new Serializer(data, { many, partial });
  }

  get_queryset(): any[] {
    return this.queryset;
  }

  get_object(): any {
  }

  filter_queryset(queryset: any[]): any[] {
    return this.queryset;
  }

  get paginator(): any {
    return this.pagination_class;
  }

  paginate_queryset(queryset: any[]): any[] | null {
    return this.queryset;
  }

  get_paginated_response(data: any): Response {
    return new Response(data);
  }
}

export class ModelAPIController extends mix(ModelAPIControllerBase).with(
  CreateModelMixin,
  ListModelMixin,
  RetrieveModelMixin,
  UpdateModelMixin,
  DestroyModelMixin
) { }

export class ReadonlyModelAPIController extends mix(ModelAPIControllerBase).with(
  ListModelMixin,
  RetrieveModelMixin
) { }
