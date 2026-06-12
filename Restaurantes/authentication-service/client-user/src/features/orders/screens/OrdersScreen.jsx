// client-user/src/features/orders/screens/OrdersScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, EmptyState, LoadingSpinner } from '../../../components/common/Common.jsx';
import useOrders from '../hooks/useOrders.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function OrdersScreen({ route }) {
  const restaurantId = route?.params?.restaurantId;
  const { orders, loading, error, refresh } = useOrders(restaurantId);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>Pedido #{item.id}</Text>
      <Text style={styles.status}>{item.status || 'En proceso'}</Text>
      <Text style={styles.subtitle}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.subtitle}>Creado: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</Text>
      <Text style={styles.itemsTitle}>Productos:</Text>
      {Array.isArray(item.items) && item.items.map((product) => (
        <Text key={product.id || product._id} style={styles.itemText}>
          {product.name} x{product.quantity} · ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}
        </Text>
      ))}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState title="Error" description={error} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Mis pedidos</Text>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Sin pedidos" description="No tienes pedidos registrados." />}
        refreshing={loading}
        onRefresh={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  pageTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.md
  },
  list: {
    paddingBottom: SPACING.xl
  },
  card: {
    marginBottom: SPACING.md
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  status: {
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.xs
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs
  },
  itemsTitle: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  itemText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs
  }
});
