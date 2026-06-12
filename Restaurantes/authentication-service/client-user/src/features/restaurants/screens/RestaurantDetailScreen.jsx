// client-user/src/features/restaurants/screens/RestaurantDetailScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Card, EmptyState } from '../../../components/common/Common.jsx';
import Button from '../../../components/common/Button.jsx';
import useMenu from '../../menu/hooks/useMenu.js';
import useRestaurantAdmin from '../hooks/useRestaurantAdmin.js';
import restaurantClient from '../../../api/restaurantClient.js';
import menuClient from '../../../api/menuClient.js';
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

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant: initialRestaurant } = route.params || {};
  const [restaurant, setRestaurant] = useState(initialRestaurant);

  const { menuItems, loading: menuLoading, refresh: refreshMenu } = useMenu();
  const { updateRestaurant, disableRestaurant, loading: saving } = useRestaurantAdmin();
  const user = useAuthStore((s) => s.user);
  const admin = isAdmin(user);
  const restaurantId = restaurant?.id || restaurant?._id;

  const restaurantMenu = menuItems.filter(
    (item) =>
      item.restaurantId === restaurantId
  );

  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [addingMenu, setAddingMenu] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  useEffect(() => {
    const loadReviews = async () => {
      if (!restaurantId || !admin) return;
      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const response = await restaurantClient.get(`/${restaurantId}/reviews`);
        const payload = Array.isArray(response.data) ? response.data : [];
        setReviews(
          payload.map((item) => ({
            id: item.id || item._id,
            rating: item.rating,
            comment: item.comment,
            customerName: item.customerName || item.customerEmail || 'Cliente',
            createdAt: item.createdAt
          }))
        );
      } catch (error) {
        setReviewsError(error.response?.data?.message || 'No se pudieron cargar las reseñas');
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [restaurantId, admin]);

  // Estado del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: restaurant?.name || '',
    address: restaurant?.address || '',
    description: restaurant?.description || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || '',
    manager: restaurant?.manager || '',
    capacity: restaurant?.capacity?.toString() || '',
    openingHours: restaurant?.openingHours || ''
  });

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Restaurante no encontrado.</Text>
      </View>
    );
  }

  /* ── Handlers ────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      Alert.alert('Campos requeridos', 'El nombre y la dirección son obligatorios.');
      return;
    }

    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : undefined
    };

    const result = await updateRestaurant(restaurant.id || restaurant._id, payload);
    if (result.success) {
      setRestaurant((prev) => ({ ...prev, ...payload }));
      setShowEditModal(false);
      Alert.alert('Éxito', 'Restaurante actualizado correctamente.');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDisable = () => {
    Alert.alert(
      'Deshabilitar restaurante',
      `¿Seguro que deseas deshabilitar "${restaurant.name}"? Esta acción puede ser irreversible.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deshabilitar',
          style: 'destructive',
          onPress: async () => {
            const result = await disableRestaurant(restaurant.id || restaurant._id);
            if (result.success) {
              Alert.alert('Listo', 'Restaurante deshabilitado.');
              navigation.goBack();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleAddMenuItem = async () => {
    if (!newMenu.name.trim() || !newMenu.price.trim()) {
      Alert.alert('Campos requeridos', 'El nombre y el precio son obligatorios.');
      return;
    }

    const payload = {
      name: newMenu.name.trim(),
      description: newMenu.description.trim(),
      category: newMenu.category.trim(),
      price: Number(newMenu.price),
      restaurant: restaurantId
    };

    setAddingMenu(true);

    try {
      await menuClient.post('/', payload);
      await refreshMenu();
      setShowAddMenuModal(false);
      setNewMenu({ name: '', description: '', price: '', category: '' });
      Alert.alert('Menú agregado', 'El platillo se agregó correctamente.');
    } catch (error) {
      Alert.alert(
        'Error al agregar menú',
        error.response?.data?.message || 'No se pudo agregar el menú.'
      );
    } finally {
      setAddingMenu(false);
    }
  };

  /* ── Render helpers ─────────────────────────────────────── */

  const renderMenuItem = ({ item }) => (
    <Card style={styles.menuCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.menuImage} />
      ) : null}
      <Text style={styles.menuName}>{item.name}</Text>
      <Text style={styles.menuDescription}>{item.description}</Text>
      <Text style={styles.menuPrice}>${item.price?.toFixed(2)}</Text>
    </Card>
  );

  const renderReviewItem = ({ item }) => (
    <Card style={styles.menuCard}>
      <Text style={styles.menuName}>{item.customerName}</Text>
      <Text style={styles.menuDescription}>{item.comment || 'Sin comentario'}</Text>
      <Text style={styles.menuPrice}>{item.rating ? `Calificación: ${item.rating}/5` : 'Sin calificación'}</Text>
    </Card>
  );

  const Header = () => (
    <View style={styles.header}>
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.cover} />
      ) : null}

      <Text style={styles.name}>{restaurant.name}</Text>
      <Text style={styles.address}>{restaurant.address}</Text>
      <Text style={styles.description}>{restaurant.description}</Text>

      <View style={styles.buttonsRow}>
        <Button
          title={admin ? 'Agregar menú' : 'Ver Menú'}
          onPress={() => {
            if (admin) {
              setShowAddMenuModal(true);
            } else {
              navigation.navigate('MenuTab', {
                screen: 'Menu',
                params: { restaurantId }
              });
            }
          }}
          style={styles.button}
        />
        <Button
          title={admin ? 'Crear mesa' : 'Reservar Mesa'}
          variant="secondary"
          onPress={() =>
            admin
              ? navigation.navigate('Tables', { restaurantId })
              : navigation.navigate('ReservationsTab', {
                  screen: 'CreateReservation',
                  params: { restaurant }
                })
          }
          style={styles.button}
        />
      </View>

      {admin && (
        <View style={styles.adminActions}>
          <Text style={styles.adminBadge}>Gestión del restaurante</Text>
          <View style={styles.adminActionRow}>
            <Button
              title="Ver menús"
              onPress={() =>
                navigation.navigate('MenuTab', {
                  screen: 'Menu',
                  params: { restaurantId }
                })
              }
              style={[styles.button, styles.actionBtn]}
            />
            <Button
              title="Ver reservaciones"
              variant="secondary"
              onPress={() =>
                navigation.navigate('ReservationsTab', {
                  screen: 'Reservations',
                  params: { restaurantId }
                })
              }
              style={[styles.button, styles.actionBtn]}
            />
          </View>
          <View style={styles.adminActionRow}>
            <Button
              title="Ver órdenes"
              onPress={() =>
                navigation.navigate('OrdersTab', {
                  screen: 'Orders',
                  params: { restaurantId }
                })
              }
              style={[styles.button, styles.actionBtn]}
            />
            <Button
              title="Ver mesas"
              variant="secondary"
              onPress={() => navigation.navigate('Tables', { restaurantId })}
              style={[styles.button, styles.actionBtn]}
            />
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>{admin ? 'Reseñas' : 'Menú asociado'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={<Header />}
        data={admin ? reviews : restaurantMenu}
        renderItem={admin ? renderReviewItem : renderMenuItem}
        keyExtractor={(item) =>
          item.id?.toString() || Math.random().toString()
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          admin ? (
            reviewsLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <EmptyState
                title="Sin reseñas"
                description={reviewsError || 'No hay reseñas registradas para este restaurante.'}
              />
            )
          ) : menuLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <EmptyState
              title="Sin menú"
              description="No hay platos disponibles para este restaurante."
            />
          )
        }
      />

      {/* Modal de edición */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar restaurante</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'name', label: 'Nombre *', placeholder: 'Nombre del restaurante' },
                { key: 'address', label: 'Dirección *', placeholder: 'Dirección' },
                { key: 'description', label: 'Descripción', placeholder: 'Descripción breve' },
                { key: 'phone', label: 'Teléfono', placeholder: '+502 2345-6789' },
                { key: 'email', label: 'Email', placeholder: 'correo@restaurante.com' },
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
                onPress={() => setShowEditModal(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Guardar"
                onPress={handleSave}
                loading={saving}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de agregar menú */}
      <Modal
        visible={showAddMenuModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMenuModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Agregar platillo</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'name', label: 'Nombre *', placeholder: 'Nombre del platillo' },
                { key: 'description', label: 'Descripción', placeholder: 'Descripción breve' },
                { key: 'category', label: 'Categoría', placeholder: 'Ej. Entrada' },
                { key: 'price', label: 'Precio *', placeholder: '0.00', keyboardType: 'numeric' }
              ].map(({ key, label, placeholder, keyboardType }) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={newMenu[key]}
                    onChangeText={(v) => setNewMenu((prev) => ({ ...prev, [key]: v }))}
                    keyboardType={keyboardType || 'default'}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowAddMenuModal(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Agregar"
                onPress={handleAddMenuItem}
                loading={addingMenu}
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
    backgroundColor: COLORS.background
  },
  header: {
    padding: SPACING.lg
  },
  cover: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: SPACING.md
  },
  name: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
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
    lineHeight: FONT_SIZE.lg,
    marginBottom: SPACING.lg
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg
  },
  button: {
    flex: 1,
    marginHorizontal: SPACING.xs
  },
  adminActions: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  adminActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: SPACING.xs
  },
  // Admin section
  adminRow: {
    marginBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md
  },
  adminBadge: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  adminButtons: {
    flexDirection: 'row'
  },
  editBtn: {
    marginRight: SPACING.xs
  },
  disableBtn: {
    marginLeft: SPACING.xs
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl
  },
  menuCard: {
    marginBottom: SPACING.md
  },
  menuImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: SPACING.sm
  },
  menuName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  menuDescription: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginVertical: SPACING.xs
  },
  menuPrice: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
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
