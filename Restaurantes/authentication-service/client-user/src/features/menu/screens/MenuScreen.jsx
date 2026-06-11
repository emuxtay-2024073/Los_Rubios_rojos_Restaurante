// client-user/src/features/menu/screens/MenuScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Card, LoadingSpinner, EmptyState } from '../../../components/common/Common.jsx';
import useMenu from '../hooks/useMenu.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function MenuScreen({ navigation }) {
  const { menuItems, loading, error, refresh } = useMenu();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MenuDetail', { item })}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
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
      <Text style={styles.title}>Menú</Text>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refresh}
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
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: SPACING.sm
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
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
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZE.lg
  },
  price: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  }
});
