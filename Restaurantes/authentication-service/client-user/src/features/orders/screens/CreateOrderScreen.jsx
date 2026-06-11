// client-user/src/features/orders/screens/CreateOrderScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import menuClient from '../../../api/menuClient.js';
import orderClient from '../../../api/orderClient.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { Card } from '../../../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function CreateOrderScreen({ route }) {
  const { restaurant } = route.params || {};
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      note: ''
    }
  });

  useEffect(() => {
    let mounted = true;
    menuClient.get('/')
      .then((response) => {
        if (mounted) {
          const data = Array.isArray(response.data) ? response.data : [];
          setMenuItems(data.filter((item) => item.restaurantId === restaurant?.id || item.restaurantId === restaurant?._id));
        }
      })
      .catch(() => {
        if (mounted) setMenuItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [restaurant]);

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id || entry.id === item._id);
      if (existing) {
        return current.map((entry) =>
          entry.id === existing.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { id: item.id || item._id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = useMemo(() => subtotal, [subtotal]);

  const onSubmit = async (data) => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto para ordenar.');
      return;
    }

    try {
      await orderClient.post('/', {
        restaurantId: restaurant?.id || restaurant?._id,
        items: cart,
        subtotal,
        total,
        note: data.note
      });
      Alert.alert('Pedido creado', 'Tu pedido ha sido enviado correctamente.');
      setCart([]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'No se pudo crear el pedido.');
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
      <Text style={styles.subtitle}>Selecciona los productos de {restaurant?.name || 'tu restaurante'}.</Text>

      <Text style={styles.sectionTitle}>Productos</Text>
      {menuItems.map((item) => (
        <Card style={styles.productCard} key={item.id || item._id}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
            <Button title="Agregar" onPress={() => addToCart(item)} style={styles.smallButton} />
          </View>
        </Card>
      ))}

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
            <Text style={styles.productPrice}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</Text>
          </Card>
        ))
      )}

      <Text style={styles.summary}>Total: ${total.toFixed(2)}</Text>

      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <Input label="Notas" placeholder="Instrucciones adicionales" value={value} onChangeText={onChange} />
        )}
      />

      <Button title="Enviar pedido" onPress={handleSubmit(onSubmit)} />
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
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm
  },
  productCard: {
    marginBottom: SPACING.md
  },
  productName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  productDescription: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginVertical: SPACING.xs
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productPrice: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  smallButton: {
    width: 100
  },
  cartItem: {
    marginBottom: SPACING.md
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  removeText: {
    color: COLORS.error,
    fontWeight: '700'
  },
  cartQuantity: {
    color: COLORS.textLight,
    marginTop: SPACING.xs
  },
  summary: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg
  },
  emptyText: {
    color: COLORS.textLight,
    marginBottom: SPACING.lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});
