// client-user/src/features/restaurants/screens/RestaurantsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { LoadingSpinner, EmptyState } from '../../../components/common/Common.jsx';
import useRestaurants from '../hooks/useRestaurants.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function RestaurantsScreen({ navigation }) {
  const { restaurants, loading, error, refresh } = useRestaurants();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
      <View style={styles.meta}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
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
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[COLORS.primary]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.md
  },
  list: {
    paddingBottom: SPACING.xl
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
  }
});
