// client-user/src/features/auth/screens/ForgotPasswordScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import useAuth from '../hooks/useAuth.js';

export default function ForgotPasswordScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: ''
    }
  });
  const { handleForgotPassword, loading, error } = useAuth();

  const onSubmit = async (data) => {
    try {
      await handleForgotPassword(data);
      Alert.alert('Enviado', 'Te enviamos un correo con instrucciones para recuperar tu contraseña.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.message || error || 'No se pudo enviar el correo.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu email para recibir instrucciones.</Text>

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

          <Button title="Enviar solicitud" onPress={handleSubmit(onSubmit)} loading={loading} />
          <Text style={styles.backText} onPress={() => navigation.navigate('Login')}>
            Volver al inicio de sesión
          </Text>
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
  backText: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '700'
  }
});
