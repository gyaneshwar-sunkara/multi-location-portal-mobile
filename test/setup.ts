// Extend Jest matchers with @testing-library/react-native built-in matchers
import '@testing-library/react-native/build/matchers/extend-expect';

// Silence noisy React Native warnings in test output
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Animated:') ||
      message.includes('NativeModule') ||
      message.includes('Require cycle')
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('An update to') ||
      message.includes('act()')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
