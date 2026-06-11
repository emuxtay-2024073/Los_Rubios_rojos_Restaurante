// client-user/src/features/restaurants/screens/RestaurantDetailScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { Card, EmptyState } from '../../../components/common/Common.jsx';
import Button from '../../../components/common/Button.jsx';
import useMenu from '../../menu/hooks/useMenu.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { menuItems, loading } = useMenu();
  const restaurantMenu = menuItems.filter((item) => item.restaurantId === restaurant?.id || item.restaurantId === restaurant?._id);

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Restaurante no encontrado.</Text>
      </View>
    );
  }

  const renderMenuItem = ({ item }) => (
    <Card style={styles.menuCard}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.menuImage} /> : null}
      <Text style={styles.menuName}>{item.name}</Text>
      <Text style={styles.menuDescription}>{item.description}</Text>
      <Text style={styles.menuPrice}>${item.price?.toFixed(2)}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            {restaurant.image ? <Image source={{ uri: restaurant.image }} style={styles.cover} /> : null}
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.address}>{restaurant.address}</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
            <View style={styles.buttonsRow}>
              <Button
                title="Ver Menú"
                onPress={() => navigation.navigate('MenuTab')}
                style={styles.button}
              />
              <Button
                title="Reservar Mesa"
                variant="secondary"
                onPress={() => navigation.navigate('ReservationsTab', { screen: 'CreateReservation', params: { restaurant } })}
                style={styles.button}
              />
            </View>
            <Text style={styles.sectionTitle}>Menú asociado</Text>
          </View>
        }
        data={restaurantMenu}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : <EmptyState title="Sin menú" description="No hay platos disponibles para este restaurante." />}
      />
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
  }
});
