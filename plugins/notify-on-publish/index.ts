export const setup = (context: any) => {
  console.log('Notify plugin initialized!');
};

export const hooks = {
  'content:afterSave': (payload: any) => {
    console.log('Notify plugin: Content saved, sending notification!', payload);
  }
};
