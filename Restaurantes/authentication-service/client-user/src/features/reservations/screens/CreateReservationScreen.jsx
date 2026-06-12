// client-user/src/features/reservations/screens/CreateReservationScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import useReservations from '../hooks/useReservations.js';
import { useAuthStore } from '../../../store/authStore.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function CreateReservationScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { user } = useAuthStore();
  const { createReservation, loading } = useReservations();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: '',
      time: '',
      numberOfGuests: ''
    }
  });

  const onSubmit = async (data) => {
    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      Alert.alert('Error', 'La fecha debe tener el formato YYYY-MM-DD (ej: 2026-07-08).');
      return;
    }

    // Validar formato de hora HH:MM
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(data.time)) {
      Alert.alert('Error', 'La hora debe tener el formato HH:MM (ej: 12:30).');
      return;
    }

    // Combinar fecha y hora en una fecha ISO
    const reservationDate = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(reservationDate.getTime())) {
      Alert.alert('Error', 'Fecha u hora inválida.');
      return;
    }

    const guests = Number(data.numberOfGuests);
    if (!guests || guests < 1) {
      Alert.alert('Error', 'La cantidad de personas debe ser al menos 1.');
      return;
    }

    try {
      await createReservation({
        restaurant: restaurant?._id || restaurant?.id,
        reservationDate: reservationDate.toISOString(),
        numberOfGuests: guests,
        customerName: user?.name || user?.username || user?.email || 'Cliente'
      });

      Alert.alert('Reservación creada', 'Tu reservación fue creada correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Reservations') }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo crear la reservación.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nueva reservación</Text>
      <Text style={styles.subtitle}>Reserva en {restaurant?.name || 'un restaurante'}.</Text>

      <Input label="Restaurante" value={restaurant?.name || ''} editable={false} />

      <Controller
        control={control}
        name="date"
        rules={{ required: 'Fecha es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Fecha"
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            error={error?.message}
            keyboardType="numeric"
          />
        )}
      />

      <Controller
        control={control}
        name="time"
        rules={{ required: 'Hora es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Hora"
            placeholder="HH:MM"
            value={value}
            onChangeText={onChange}
            error={error?.message}
            keyboardType="numeric"
          />
        )}
      />

      <Controller
        control={control}
        name="numberOfGuests"
        rules={{ required: 'Cantidad de personas es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Cantidad de personas"
            placeholder="Ej: 2"
            value={value}
            onChangeText={onChange}
            error={error?.message}
            keyboardType="numeric"
          />
        )}
      />

      <Button title="Crear reservación" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background
  },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg
  }
});
