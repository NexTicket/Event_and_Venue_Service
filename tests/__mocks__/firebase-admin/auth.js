export const auth = jest.fn().mockReturnValue({
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
  }),
  getUser: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
    customClaims: { role: 'admin' },
  }),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
});

export const initializeApp = jest.fn();
export const credential = {
  cert: jest.fn(),
};

export default {
  auth,
  initializeApp,
  credential,
};
