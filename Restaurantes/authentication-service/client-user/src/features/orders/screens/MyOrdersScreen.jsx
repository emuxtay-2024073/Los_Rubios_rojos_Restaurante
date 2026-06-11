// client-user/src/features/orders/screens/MyOrdersScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import orderClient from '../../../api/orderClient.js';
import { Card } from '../../../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    orderClient.get('/')
      .then((response) => {
        if (mounted) {
          setOrders(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (mounted) setOrders([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>Pedido #{item.id || item._id}</Text>
      <Text style={styles.status}>{item.status || 'En proceso'}</Text>
      <Text style={styles.subtitle}>Subtotal: ${item.subtotal?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.subtitle}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.itemsTitle}>Productos:</Text>
      {Array.isArray(item.items) && item.items.map((product) => (
        <Text key={product.id || product._id} style={styles.itemText}>
          {product.name} x{product.quantity} · ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}
        </Text>
      ))}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Mis pedidos</Text>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes pedidos registrados.</Text>}
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
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs
  },
  status: {
    color: COLORS.primary,
    fontWeight: '700',
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
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});
