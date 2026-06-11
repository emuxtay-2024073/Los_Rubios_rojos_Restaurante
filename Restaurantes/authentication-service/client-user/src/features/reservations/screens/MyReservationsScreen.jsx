// client-user/src/features/reservations/screens/MyReservationsScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import reservationClient from '../../../api/reservationClient.js';
import { Card } from '../../../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    reservationClient.get('/')
      .then((response) => {
        if (mounted) {
          setReservations(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (mounted) setReservations([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.restaurant}>{item.restaurantName || item.restaurant?.name || 'Restaurante'}</Text>
      <Text style={styles.date}>{item.date} · {item.time}</Text>
      <Text style={styles.people}>Personas: {item.cantidadPersonas}</Text>
      <Text style={styles.status}>{item.status || 'Pendiente'}</Text>
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
      <Text style={styles.title}>Mis reservaciones</Text>
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay reservaciones registradas.</Text>}
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
  title: {
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
  restaurant: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  date: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs
  },
  people: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs
  },
  status: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: '700'
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
