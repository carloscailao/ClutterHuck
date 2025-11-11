import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const TestComponent = ({ title }: { title: string }) => (
  <View>
    <Text testID="title">{title}</Text>
  </View>
);

describe('TestComponent', () => {
  test('renders title correctly', () => {
    render(<TestComponent title="Hello Jest" />);
    
    // Use React Native Testing Library methods
    const titleElement = screen.getByTestId('title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.props.children).toBe('Hello Jest');
  });

  test('renders with different title', () => {
    render(<TestComponent title="Different Title" />);
    
    const titleElement = screen.getByTestId('title');
    expect(titleElement.props.children).toBe('Different Title');
  });
});