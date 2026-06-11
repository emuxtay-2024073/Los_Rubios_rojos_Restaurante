// client-user/src/components/common/Button.jsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../shared/constants/theme.js';

const variantStyles = {
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary
  }
};

export default function Button({ title, variant = 'primary', onPress, loading = false, disabled = false, style }) {
  const buttonStyle = [styles.button, variantStyles[variant], style, disabled && styles.disabled];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={loading || disabled}>
      {loading ? (
        <ActivityIndicator color={COLORS.surface} />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...SHADOWS.light
  },
  label: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.6
  }
});
