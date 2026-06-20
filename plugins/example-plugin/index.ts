export const setup = (context: any) => {
  console.log('Example plugin initialized!');
  if (context.readContent) {
    context.readContent();
  }
};

export const hooks = {
  'content:afterSave': (payload: any) => {
    console.log('Plugin intercepted content save:', payload);
  }
};
