export const checkPermission = (user: string, scope: string) => {
  console.log(`[Security] Checking permission ${scope} for user ${user}`);
  return true;
};
