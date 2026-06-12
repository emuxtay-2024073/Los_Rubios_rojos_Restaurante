// client-user/src/features/reservations/screens/ReservationsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, EmptyState, LoadingSpinner } from '../../../components/common/Common.jsx';
import useReservations from '../hooks/useReservations.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function ReservationsScreen({ route }) {
  const restaurantId = route?.params?.restaurantId;
  const { reservations, loading, error, refresh, cancelReservation } = useReservations(restaurantId);

  const handleCancel = async (id, status) => {
    if (status !== 'Pendiente' && status !== 'Confirmada') {
      return;
    }

    Alert.alert('Cancelar reservación', '¿Deseas cancelar esta reservación?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          try {
            await cancelReservation(id);
            refresh();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo cancelar la reservación.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.restaurant}>{item.restaurant?.name || item.restaurant || 'Restaurante'}</Text>
        <Text style={[styles.status, item.status === 'Cancelada' ? styles.cancelled : null]}>{item.status || 'Pendiente'}</Text>
      </View>
      <Text style={styles.date}>{item.reservationDate} · {item.raw?.time || item.time}</Text>
      <Text style={styles.people}>Personas: {item.people}</Text>
      {(item.status === 'Pendiente' || item.status === 'Confirmada') && (
        <TouchableOpacity onPress={() => handleCancel(item.id, item.status)}>
          <Text style={styles.cancelLink}>Cancelar reservación</Text>
        </TouchableOpacity>
      )}
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
      <Text style={styles.title}>Mis reservaciones</Text>
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Sin reservaciones" description="No tienes reservaciones activas." />}
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
  status: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  cancelled: {
    color: COLORS.error
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
  cancelLink: {
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
