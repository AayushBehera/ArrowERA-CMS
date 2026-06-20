export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'contributor';
}

export class AuthManager {
  async authenticateWithPasskey(credential: any): Promise<User> {
    console.log('Authenticating with passkey...');
    return { id: '1', email: 'admin@arrorera.com', role: 'admin' };
  }

  async authenticateWithOAuth(provider: 'google' | 'github', token: string): Promise<User> {
    console.log(`Authenticating with ${provider} OAuth...`);
    return { id: '1', email: 'admin@arrorera.com', role: 'admin' };
  }

  async sendMagicLink(email: string): Promise<void> {
    console.log(`Sending magic link to ${email}...`);
  }
}
