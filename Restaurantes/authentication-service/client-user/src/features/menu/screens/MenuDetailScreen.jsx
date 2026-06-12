// client-user/src/features/menu/screens/MenuDetailScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function MenuDetailScreen({ route, navigation }) {
  const item = route.params?.item;
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Item no encontrado</Text>
      </View>
    );
  }

  const handleAddToOrder = () => {
    // Navegar a CreateOrder pasando el item con la cantidad seleccionada
    navigation.navigate('CreateOrder', {
      restaurant: item.restaurant || { _id: item.restaurantId },
      initialItem: { ...item, quantity }
    });
  };

  return (
    <View style={styles.container}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : null}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.price}>${item.price?.toFixed(2)}</Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity((q) => q + 1)}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Button title="Agregar al pedido" onPress={handleAddToOrder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: SPACING.md
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs
  },
  category: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm
  },
  description: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.lg
  },
  price: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    lineHeight: FONT_SIZE.lg + 4
  },
  qtyValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});
