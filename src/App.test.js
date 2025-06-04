import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock modules that use ESM syntax so Jest can run in CommonJS environment
jest.mock('rehype-prism-plus', () => ({}));
jest.mock('@uiw/react-md-editor', () => {
  const React = require('react');
  const Markdown = ({ source }) => <div>{source}</div>;
  const MDEditor = props => <textarea {...props} />;
  MDEditor.Markdown = Markdown;
  return MDEditor;
});
jest.mock('@vercel/analytics/react', () => ({ Analytics: () => null }), { virtual: true });

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { pathname: '/app', href: '' },
  });
});

import App from './App';

test('renders export button', () => {
  render(<App />);
  const btn = screen.getByText(/Export Image/i);
  expect(btn).toBeInTheDocument();
});
