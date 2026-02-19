import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OptionSheet } from './OptionSheet';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const options = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'Arabic', value: 'ar' },
];

describe('OptionSheet', () => {
  it('renders title and options when visible', () => {
    render(
      <OptionSheet
        visible
        title="Select Language"
        options={options}
        selectedValue="en"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('Select Language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Spanish')).toBeTruthy();
    expect(screen.getByText('Arabic')).toBeTruthy();
  });

  it('calls onSelect and onClose when an option is pressed', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    render(
      <OptionSheet
        visible
        title="Language"
        options={options}
        selectedValue="en"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText('Spanish'));

    expect(onSelect).toHaveBeenCalledWith('es');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render content when not visible', () => {
    render(
      <OptionSheet
        visible={false}
        title="Language"
        options={options}
        selectedValue="en"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByText('Language')).toBeNull();
  });
});
