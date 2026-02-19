import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

jest.mock('@/providers/theme-provider', () =>
  require('@/test/mocks/theme-provider'),
);

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card testID="card">
        <CardContent>
          <View testID="child" />
        </CardContent>
      </Card>,
    );
    expect(screen.getByTestId('card')).toBeTruthy();
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>,
    );
    expect(screen.getByText('Title')).toBeTruthy();
  });
});

describe('CardTitle', () => {
  it('renders text children as Text component', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeTruthy();
  });

  it('renders non-text children as View', () => {
    render(
      <CardTitle>
        <View testID="custom-title" />
      </CardTitle>,
    );
    expect(screen.getByTestId('custom-title')).toBeTruthy();
  });
});

describe('CardDescription', () => {
  it('renders text children as Text', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeTruthy();
  });

  it('renders non-text children as View', () => {
    render(
      <CardDescription>
        <View testID="custom-desc" />
      </CardDescription>,
    );
    expect(screen.getByTestId('custom-desc')).toBeTruthy();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(
      <CardContent>
        <View testID="content" />
      </CardContent>,
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(
      <CardFooter>
        <View testID="footer" />
      </CardFooter>,
    );
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});
