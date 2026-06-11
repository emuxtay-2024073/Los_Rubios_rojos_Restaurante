// client-user/src/components/common/Common.jsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../shared/constants/theme.js';

export function LoadingSpinner() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

export function EmptyState({ title = 'Sin resultados', description = 'No hay datos disponibles.' }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="hourglass-empty" size={48} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg
  },
  emptyTitle: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  emptyDescription: {
    marginTop: SPACING.xs,
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    textAlign: 'center'
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium
  }
});
