import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from './Badge';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Active" />);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('renders with default variant', () => {
    render(<Badge label="Default" />);
    expect(screen.getByText('Default')).toBeTruthy();
  });

  it('renders with destructive variant', () => {
    render(<Badge label="Error" variant="destructive" />);
    expect(screen.getByText('Error')).toBeTruthy();
  });
});
