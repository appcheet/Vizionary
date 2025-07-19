import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007bff',
  background: '#f5f5f5',
  card: '#fff',
  text: '#222',
  muted: '#666',
  border: '#e0e0e0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSizes = {
  small: 14,
  medium: 16,
  large: 20,
  xlarge: 28,
};

export const commonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    margin: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.muted,
  },
}); 