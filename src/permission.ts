import type { H3Event } from 'h3';

export class PermissionClass {
  async hasPermission(event: H3Event): Promise<boolean> {
    throw new Error('hasPermission() must be implemented');
  }

  async hasObjectPermission(event: H3Event, obj: any): Promise<boolean> {
    throw new Error('hasObjectPermission() must be implemented');
  }
}
