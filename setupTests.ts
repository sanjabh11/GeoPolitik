import '@testing-library/jest-dom';

// Mock ResizeObserver for D3/Recharts tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Suppress console warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
