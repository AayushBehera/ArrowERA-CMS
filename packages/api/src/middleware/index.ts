export const apiMiddleware = (req: any, res: any, next: any) => {
  console.log('[API] Middleware intercepting request');
  next();
};
