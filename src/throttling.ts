import type { H3Event } from 'h3';

export class ThrottleClass {
  async allowRequest(event: H3Event): Promise<boolean> {
    throw new Error('allowRequest() must be implemented');
  }
}
