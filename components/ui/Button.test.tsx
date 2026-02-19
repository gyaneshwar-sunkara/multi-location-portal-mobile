import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Press</Button>);
    fireEvent.press(screen.getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>,
    );
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading', () => {
    render(<Button loading>Loading</Button>);
    // Loading replaces text with ActivityIndicator
    expect(screen.queryByText('Loading')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} loading>
        Load
      </Button>,
    );
    // The pressable is disabled when loading, so fireEvent.press on the container
    const pressable = screen.root;
    fireEvent.press(pressable);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with variant "destructive" without crashing', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('renders with variant "outline" without crashing', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renders with variant "ghost" without crashing', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toBeTruthy();
  });

  it('renders with size "sm" without crashing', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeTruthy();
  });

  it('renders with size "lg" without crashing', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toBeTruthy();
  });
});
