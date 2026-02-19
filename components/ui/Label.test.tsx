import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Label } from './Label';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Label', () => {
  it('renders label text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('renders when disabled', () => {
    render(<Label disabled>Disabled Label</Label>);
    expect(screen.getByText('Disabled Label')).toBeTruthy();
  });

  it('renders with custom style', () => {
    render(<Label style={{ marginBottom: 4 }}>Styled</Label>);
    expect(screen.getByText('Styled')).toBeTruthy();
  });
});
