// client-user/src/features/orders/screens/CreateOrderScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import menuClient from '../../../api/menuClient.js';
import orderClient from '../../../api/orderClient.js';
import tableClient from '../../../api/tableClient.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { Card } from '../../../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function CreateOrderScreen({ route, navigation }) {
  const { restaurant, initialItem } = route.params || {};
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState([]);
  const { control, handleSubmit } = useForm({ defaultValues: { note: '' } });

  // Cargar menú del restaurante
  useEffect(() => {
    let mounted = true;
    menuClient.get('/')
      .then((response) => {
        if (!mounted) return;
        const raw = response.data;
        const all = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        const restaurantId = restaurant?.id || restaurant?._id;
        const filtered = restaurantId
          ? all.filter((i) => {
              const rid = i.restaurantId || i.restaurant?._id || i.restaurant;
              return String(rid) === String(restaurantId);
            })
          : all;
        setMenuItems(filtered);
      })
      .catch(() => { if (mounted) setMenuItems([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [restaurant]);

  // Si viene un initialItem desde MenuDetailScreen, agregarlo al carrito
  useEffect(() => {
    if (initialItem) {
      setCart([{
        id: initialItem.id || initialItem._id,
        name: initialItem.name,
        price: Number(initialItem.price),
        quantity: initialItem.quantity || 1
      }]);
    }
  }, []);

  const addToCart = (item) => {
    const itemId = item.id || item._id;
    setCart((current) => {
      const existing = current.find((e) => e.id === itemId);
      if (existing) {
        return current.map((e) =>
          e.id === itemId ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...current, {
        id: itemId,
        name: item.name,
        price: Number(item.price),
        quantity: 1
      }];
    });
  };

  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  const onSubmit = async (data) => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto para ordenar.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Buscar una mesa disponible del restaurante
      const tablesResponse = await tableClient.get('/');
      const allTables = Array.isArray(tablesResponse.data) ? tablesResponse.data : [];
      const restaurantId = restaurant?.id || restaurant?._id;

      const availableTable = allTables.find((t) => {
        const tableRestaurant = t.restaurant?._id || t.restaurant || t.restaurantId;
        const isFromRestaurant = restaurantId
          ? String(tableRestaurant) === String(restaurantId)
          : true;
        return isFromRestaurant && t.status === 'disponible';
      });

      if (!availableTable) {
        Alert.alert(
          'Sin mesas disponibles',
          'No hay mesas disponibles en este restaurante en este momento.'
        );
        return;
      }

      // 2. Crear la orden con la mesa encontrada
      await orderClient.post('/', {
        table: availableTable._id,
        items: cart.map((i) => ({ menuItem: i.id, quantity: i.quantity, price: i.price })),
        total: subtotal,
        note: data.note
      });

      Alert.alert('¡Pedido enviado!', 'Tu pedido ha sido enviado correctamente.', [
        { text: 'OK', onPress: () => navigation?.goBack?.() }
      ]);
      setCart([]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'No se pudo crear el pedido.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuevo pedido</Text>
      <Text style={styles.subtitle}>
        Selecciona los productos de {restaurant?.name || 'tu restaurante'}.
      </Text>

      {/* Lista de productos del menú */}
      {menuItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Productos</Text>
          {menuItems.map((item) => (
            <Card style={styles.productCard} key={item.id || item._id}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                  <Text style={styles.addBtnText}>+ Agregar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </>
      )}

      {/* Carrito */}
      <Text style={styles.sectionTitle}>Carrito</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Agrega productos para ver el resumen.</Text>
      ) : (
        cart.map((item) => (
          <Card key={item.id} style={styles.cartItem}>
            <View style={styles.cartHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cartQuantity}>Cantidad: {item.quantity}</Text>
            <Text style={styles.productPrice}>
              Subtotal: ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </Card>
        ))
      )}

      <Text style={styles.summary}>Total: ${subtotal.toFixed(2)}</Text>

      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Notas"
            placeholder="Instrucciones adicionales"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Button
        title={submitting ? 'Enviando...' : 'Enviar pedido'}
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: SPACING.lg, backgroundColor: COLORS.background },
  title: { color: COLORS.primary, fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.sm },
  subtitle: { color: COLORS.textLight, fontSize: FONT_SIZE.md, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.sm },
  productCard: { marginBottom: SPACING.md },
  productName: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700' },
  productDescription: { color: COLORS.textLight, fontSize: FONT_SIZE.sm, marginVertical: SPACING.xs },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '700' },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm },
  cartItem: { marginBottom: SPACING.md },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  removeText: { color: COLORS.error, fontWeight: '700' },
  cartQuantity: { color: COLORS.textLight, marginTop: SPACING.xs },
  summary: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.lg },
  emptyText: { color: COLORS.textLight, marginBottom: SPACING.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }
});
