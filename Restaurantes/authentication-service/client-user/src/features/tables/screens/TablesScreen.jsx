import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useTables from '../hooks/useTables.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { Card, EmptyState, LoadingSpinner } from '../../../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function TablesScreen() {
  const route = useRoute();
  const restaurantId = route?.params?.restaurantId;
  const { tables, loading, error, refresh, createTable } = useTables(restaurantId);
  const [form, setForm] = useState({ number: '', capacity: '' });

  const handleCreateTable = async () => {
    if (!form.number.trim() || !form.capacity.trim()) {
      Alert.alert('Campos requeridos', 'Número y capacidad son obligatorios.');
      return;
    }

    try {
      await createTable({
        number: Number(form.number),
        capacity: Number(form.capacity),
        status: 'disponible',
        restaurant: restaurantId
      });
      setForm({ number: '', capacity: '' });
      Alert.alert('Listo', 'Mesa creada correctamente.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear la mesa.');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>Mesa {item.number}</Text>
      <Text style={styles.subtitle}>Capacidad: {item.capacity}</Text>
      <Text style={styles.subtitle}>Estado: {item.status || 'desconocido'}</Text>
    </Card>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Mesas</Text>
      <Text style={styles.subtitle}>
        {restaurantId ? 'Gestiona las mesas de este restaurante.' : 'Selecciona un restaurante para ver sus mesas.'}
      </Text>

      <View style={styles.form}>
        <Input
          label="Número"
          placeholder="Ej. 5"
          value={form.number}
          onChangeText={(value) => setForm((prev) => ({ ...prev, number: value }))}
          keyboardType="numeric"
        />
        <Input
          label="Capacidad"
          placeholder="Ej. 4"
          value={form.capacity}
          onChangeText={(value) => setForm((prev) => ({ ...prev, capacity: value }))}
          keyboardType="numeric"
        />
        <Button title="Crear mesa" onPress={handleCreateTable} loading={loading} />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState title="Error" description={error} />
      ) : tables.length === 0 ? (
        <EmptyState title="Sin mesas" description="No hay mesas registradas para este restaurante." />
      ) : (
        <FlatList
          data={tables}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background
  },
  pageTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg
  },
  form: {
    marginBottom: SPACING.lg
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
  }
});
