// client-user/src/features/menu/screens/MenuDetailScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function MenuDetailScreen({ route, navigation }) {
  const item = route.params?.item;

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Item no encontrado</Text>
      </View>
    );
  }

  const handleAddToOrder = () => {
    navigation.navigate('CreateOrder', { initialItem: item });
    Alert.alert('Agregado', 'Producto agregado al pedido.');
  };

  return (
    <View style={styles.container}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});
