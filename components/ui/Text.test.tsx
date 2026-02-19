import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from './Text';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Text', () => {
  it('renders with default body variant', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with h1 variant', () => {
    render(<Text variant="h1">Title</Text>);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('renders with h2 variant', () => {
    render(<Text variant="h2">Subtitle</Text>);
    expect(screen.getByText('Subtitle')).toBeTruthy();
  });

  it('renders with h3 variant', () => {
    render(<Text variant="h3">Section</Text>);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('renders with bodySmall variant', () => {
    render(<Text variant="bodySmall">Small text</Text>);
    expect(screen.getByText('Small text')).toBeTruthy();
  });

  it('renders with caption variant', () => {
    render(<Text variant="caption">Caption</Text>);
    expect(screen.getByText('Caption')).toBeTruthy();
  });

  it('renders with label variant', () => {
    render(<Text variant="label">Label</Text>);
    expect(screen.getByText('Label')).toBeTruthy();
  });

  it('accepts custom color prop', () => {
    render(<Text color="#FF0000">Red</Text>);
    expect(screen.getByText('Red')).toBeTruthy();
  });

  it('accepts style overrides', () => {
    render(<Text style={{ marginTop: 10 }}>Styled</Text>);
    expect(screen.getByText('Styled')).toBeTruthy();
  });
});
