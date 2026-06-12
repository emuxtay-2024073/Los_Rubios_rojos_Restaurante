// client-user/src/features/restaurants/screens/RestaurantsScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LoadingSpinner, EmptyState } from '../../../components/common/Common.jsx';
import Button from '../../../components/common/Button.jsx';
import useRestaurants from '../hooks/useRestaurants.js';
import useRestaurantAdmin from '../hooks/useRestaurantAdmin.js';
import { useAuthStore } from '../../../store/authStore.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

const ADMIN_ROLES = ['admin', 'superadmin', 'adminrestaurante'];

function normalizeRole(role = '') {
  return role.toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isAdmin(user) {
  if (!user) return false;
  const role = normalizeRole(user.role || user.roles?.[0] || '');
  return ADMIN_ROLES.includes(role);
}

const EMPTY_FORM = {
  name: '',
  address: '',
  description: '',
  phone: '',
  email: '',
  city: '',
  manager: '',
  capacity: '',
  openingHours: ''
};

export default function RestaurantsScreen({ navigation }) {
  const { restaurants, loading, error, refresh } = useRestaurants();
  const { createRestaurant, loading: saving } = useRestaurantAdmin();
  const user = useAuthStore((s) => s.user);
  const admin = isAdmin(user);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      Alert.alert('Campos requeridos', 'El nombre y la dirección son obligatorios.');
      return;
    }

    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : undefined
    };

    const result = await createRestaurant(payload);
    if (result.success) {
      Alert.alert('Éxito', 'Restaurante creado correctamente.');
      setShowModal(false);
      setForm(EMPTY_FORM);
      refresh();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {admin && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editCardBtn}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
          >
            <Text style={styles.editCardBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState title="Error" description={error} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurantes</Text>

      <FlatList
        data={restaurants}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.id?.toString() || Math.random().toString()
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
          />
        }
      />

      {admin && (
        <TouchableOpacity
          style={styles.floatingAddBtn}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.floatingAddBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      )}

      {/* Modal — Crear restaurante */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo restaurante</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'name', label: 'Nombre *', placeholder: 'Ej. Los Rubios' },
                { key: 'address', label: 'Dirección *', placeholder: 'Ej. 4a Calle 10-25 Z.10' },
                { key: 'description', label: 'Descripción', placeholder: 'Descripción breve' },
                { key: 'phone', label: 'Teléfono', placeholder: '+502 2345-6789' },
                { key: 'email', label: 'Email', placeholder: 'restaurante@correo.com' },
                { key: 'city', label: 'Ciudad', placeholder: 'Guatemala' },
                { key: 'manager', label: 'Encargado', placeholder: 'Nombre del encargado' },
                { key: 'capacity', label: 'Capacidad', placeholder: '50', keyboardType: 'numeric' },
                { key: 'openingHours', label: 'Horario', placeholder: '10:00 - 22:00' }
              ].map(({ key, label, placeholder, keyboardType }) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    keyboardType={keyboardType || 'default'}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
                }}
                style={styles.modalBtn}
              />
              <Button
                title="Crear"
                onPress={handleCreate}
                loading={saving}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700'
  },
  floatingAddBtn: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg + 10,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6
  },
  floatingAddBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZE.sm
  },
  list: {
    paddingBottom: SPACING.xl + 90
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover'
  },
  meta: {
    padding: SPACING.md
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs
  },
  address: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm
  },
  description: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: FONT_SIZE.lg
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm
  },
  editCardBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10
  },
  editCardBtnText: {
    color: '#fff',
    fontWeight: '700'
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: COLORS.surface || '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '90%'
  },
  modalTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center'
  },
  field: {
    marginBottom: SPACING.sm
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    backgroundColor: COLORS.background || '#f9f9f9'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm
  },
  modalBtn: {
    flex: 1
  }
});
