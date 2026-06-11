// client-user/src/features/auth/screens/LoginScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import useAuth from '../hooks/useAuth.js';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { handleLogin, loading, error } = useAuth();

  const onSubmit = async (data) => {
    try {
      await handleLogin(data);
    } catch (err) {
      Alert.alert('Error', err.message || error || 'Credenciales inválidas');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <MaterialIcons name="restaurant-menu" size={64} color={COLORS.primary} />
          <Text style={styles.logoTitle}>Los Rubios Rojos</Text>
          <Text style={styles.logoSubtitle}>Inicia sesión para reservar y ordenar</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Email"
                placeholder="Ingresa tu email"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Contraseña es obligatoria' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                secureTextEntry
              />
            )}
          />

          <Button title="Iniciar sesión" onPress={handleSubmit(onSubmit)} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkButton}>
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  logoTitle: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700'
  },
  logoSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
    textAlign: 'center'
  },
  form: {
    width: '100%'
  },
  linkButton: {
    marginTop: SPACING.sm,
    alignItems: 'center'
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm
  },
  footer: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  footerText: {
    color: COLORS.textLight,
    marginRight: SPACING.xs
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '700'
  }
});
