// client-user/src/components/common/BackButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../shared/constants/theme.js';

export default function BackButton({ onPress, label = 'Atrás' }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>←</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    gap: SPACING.xs
  },
  icon: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  label: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: '600'
  }
});
