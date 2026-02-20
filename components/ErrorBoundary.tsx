import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18next from 'i18next';

import { Text, Button } from '@/components/ui';
import { lightColors } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * React class component error boundary with retry UI.
 * Catches JavaScript errors in child component tree and displays a fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const t = i18next.t.bind(i18next);

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="warning-outline"
              size={32}
              color={lightColors.destructive}
            />
          </View>
          <Text variant="h3" style={styles.title}>
            {t('errorBoundary.title')}
          </Text>
          <Text
            variant="bodySmall"
            color={lightColors.mutedForeground}
            style={styles.description}
          >
            {t('errorBoundary.description')}
          </Text>
          <Button
            variant="outline"
            size="lg"
            onPress={this.handleRetry}
            style={styles.button}
          >
            {t('errorBoundary.retry')}
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: lightColors.destructive + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});
