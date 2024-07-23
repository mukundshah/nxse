import type { H3Event } from 'h3';

export class AuthenticationClass {
  async authenticate(event: H3Event): Promise<boolean> {
    throw new Error('authenticate() must be implemented');
  }
}
