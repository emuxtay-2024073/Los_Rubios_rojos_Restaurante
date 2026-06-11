// client-user/src/features/profile/screens/ProfileScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore.js';
import useProfile from '../hooks/useProfile.js';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export default function ProfileScreen() {
  const { profile, loading, error, updateProfile } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      displayName: profile?.displayName || profile?.name || '',
      phone: profile?.phone || ''
    }
  });

  const handleSave = async (values) => {
    try {
      await updateProfile(values);
      Alert.alert('Perfil actualizado', 'Tus datos se han guardado correctamente.');
      setEditMode(false);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar el perfil.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() }
    ]);
  };

  const avatarUrl = profile?.avatarUrl;
  const hasRemoteAvatar = avatarUrl && avatarUrl.startsWith('http');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {hasRemoteAvatar ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>{(profile?.displayName || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile?.displayName || profile?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <Controller
          control={control}
          name="displayName"
          rules={{ required: 'Nombre es obligatorio' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input label="Nombre" value={value} onChangeText={onChange} error={error?.message} editable={editMode} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ required: 'Teléfono es obligatorio' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input label="Teléfono" value={value} onChangeText={onChange} error={error?.message} editable={editMode} keyboardType="phone-pad" />
          )}
        />
      </View>

      <View style={styles.actions}>
        {editMode ? (
          <Button title="Guardar cambios" onPress={handleSubmit(handleSave)} loading={loading} />
        ) : (
          <Button title="Editar perfil" onPress={() => setEditMode(true)} />
        )}
        <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} style={styles.logoutButton} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md
  },
  avatarLetter: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700'
  },
  name: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700'
  },
  email: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md
  },
  section: {
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md
  },
  actions: {
    gap: SPACING.sm
  },
  logoutButton: {
    marginTop: SPACING.md
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center'
  }
});
