// client-user/src/features/auth/screens/RegisterScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import useAuth from '../hooks/useAuth.js';

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      password: '',
      phone: ''
    }
  });
  const { handleRegister, loading, error } = useAuth();

  const onSubmit = async (data) => {
    try {
      await handleRegister(data);
      Alert.alert('Registro exitoso', 'Cuenta creada correctamente. Inicia sesión.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.message || error || 'No se pudo registrar.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para reservar y ordenar tus platos favoritos.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Nombre es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Nombre" placeholder="Ingresa tu nombre" value={value} onChangeText={onChange} error={error?.message} />
            )}
          />

          <Controller
            control={control}
            name="surname"
            rules={{ required: 'Apellido es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Apellido" placeholder="Ingresa tu apellido" value={value} onChangeText={onChange} error={error?.message} />
            )}
          />

          <Controller
            control={control}
            name="username"
            rules={{ required: 'Usuario es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Usuario" placeholder="Ingresa tu usuario" value={value} onChangeText={onChange} error={error?.message} autoCapitalize="none" />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Email" placeholder="Ingresa tu email" value={value} onChangeText={onChange} error={error?.message} keyboardType="email-address" autoCapitalize="none" />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Contraseña es obligatoria' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Contraseña" placeholder="Ingresa tu contraseña" value={value} onChangeText={onChange} error={error?.message} secureTextEntry />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{ required: 'Teléfono es obligatorio' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input label="Teléfono" placeholder="Ingresa tu teléfono" value={value} onChangeText={onChange} error={error?.message} keyboardType="phone-pad" />
            )}
          />

          <Button title="Registrar" onPress={handleSubmit(onSubmit)} loading={loading} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
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
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xl,
    textAlign: 'center'
  },
  form: {
    width: '100%'
  },
  loginLink: {
    marginTop: SPACING.md,
    alignItems: 'center'
  },
  loginLinkText: {
    color: COLORS.primary,
    fontWeight: '700'
  }
});
