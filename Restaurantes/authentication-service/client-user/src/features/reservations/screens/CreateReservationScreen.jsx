// client-user/src/features/reservations/screens/CreateReservationScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import useReservations from '../hooks/useReservations.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function CreateReservationScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { createReservation, loading, error } = useReservations();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      restaurantId: restaurant?.id || restaurant?._id || '',
      date: '',
      time: '',
      cantidadPersonas: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await createReservation({
        restaurantId: data.restaurantId,
        date: data.date,
        time: data.time,
        cantidadPersonas: Number(data.cantidadPersonas)
      });
      Alert.alert('Reservación creada', 'Tu reservación fue creada correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Reservations') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || error || 'No se pudo crear la reservación.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nueva reservación</Text>
      <Text style={styles.subtitle}>Reserva en {restaurant?.name || 'un restaurante'}.</Text>

      <Controller
        control={control}
        name="restaurantId"
        render={({ field: { value } }) => (
          <Input label="Restaurante" value={restaurant?.name || ''} editable={false} />
        )}
      />

      <Controller
        control={control}
        name="date"
        rules={{ required: 'Fecha es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input label="Fecha" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} error={error?.message} />
        )}
      />

      <Controller
        control={control}
        name="time"
        rules={{ required: 'Hora es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input label="Hora" placeholder="HH:MM" value={value} onChangeText={onChange} error={error?.message} />
        )}
      />

      <Controller
        control={control}
        name="cantidadPersonas"
        rules={{ required: 'Cantidad de personas es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input label="Cantidad de personas" placeholder="Ingresa la cantidad" value={value} onChangeText={onChange} error={error?.message} keyboardType="numeric" />
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
