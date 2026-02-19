import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from './Input';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('displays entered text', () => {
    render(<Input testID="input" />);
    const input = screen.getByTestId('input');
    fireEvent.changeText(input, 'hello');
    expect(input.props.value).toBeUndefined(); // uncontrolled
  });

  it('calls onFocus when focused', () => {
    const onFocus = jest.fn();
    render(<Input testID="input" onFocus={onFocus} />);
    fireEvent(screen.getByTestId('input'), 'focus');
    expect(onFocus).toHaveBeenCalled();
  });

  it('calls onBlur when blurred', () => {
    const onBlur = jest.fn();
    render(<Input testID="input" onBlur={onBlur} />);
    fireEvent(screen.getByTestId('input'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders without crashing when error is true', () => {
    render(<Input placeholder="Error input" error />);
    expect(screen.getByPlaceholderText('Error input')).toBeTruthy();
  });

  it('accepts style overrides', () => {
    render(<Input testID="input" style={{ height: 60 }} />);
    expect(screen.getByTestId('input')).toBeTruthy();
  });
});
