export class MagicLinkProvider {
  async sendLink(email: string) {
    console.log(`[MagicLink] Sending magic link to ${email}`);
    return { success: true };
  }
  
  async verifyToken(token: string) {
    console.log(`[MagicLink] Verifying token ${token}`);
    return { success: true, userId: '1' };
  }
}
