// Mock for firebase-admin/app module

export const initializeApp = (config) => {
  return {
    name: '[DEFAULT]',
    options: config || {}
  };
};

export const cert = (serviceAccount) => {
  return {
    projectId: 'test-project',
    clientEmail: 'test@test.iam.gserviceaccount.com',
    privateKey: 'test-private-key'
  };
};

export const getApp = () => {
  return {
    name: '[DEFAULT]',
    options: {}
  };
};

export const getApps = () => {
  return [];
};
