// Test just importing the app
import app from '../src';

describe('App import test', () => {
  it('should import app without hanging', () => {
    expect(app).toBeDefined();
  });
});
