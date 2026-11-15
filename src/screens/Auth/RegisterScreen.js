import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", type: "Profissional" });
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const submit = async () => {
    if (form.name.trim().length < 2) return Alert.alert("Nome obrigatório", "Informe seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return Alert.alert("E-mail inválido", "Informe um e-mail válido.");
    if (form.password.length < 6) return Alert.alert("Senha muito curta", "Use pelo menos 6 caracteres.");
    if (form.password !== form.confirm) return Alert.alert("Senhas diferentes", "Confira a confirmação da senha.");
    if (!accepted) return Alert.alert("Aceite necessário", "Aceite os termos para criar sua conta.");
    setLoading(true);
    const result = await register({ name: form.name, email: form.email, password: form.password, type: form.type });
    setLoading(false);
    if (!result.success) Alert.alert("Não foi possível criar a conta", result.error);
  };

  return <ClayScreen><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>RESERVA CHAT</Text><Text style={styles.title}>Crie sua conta</Text><Text style={styles.subtitle}>Comece a criar novas oportunidades hoje.</Text>
      <ClayCard>
        <ClayInput label="Nome completo" value={form.name} onChangeText={value => update("name", value)} autoComplete="name" placeholder="Como podemos te chamar?" />
        <ClayInput label="E-mail" value={form.email} onChangeText={value => update("email", value)} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="voce@email.com" />
        <View style={styles.passwordRow}><ClayInput label="Senha" value={form.password} onChangeText={value => update("password", value)} secureTextEntry={!showPassword} placeholder="Mínimo de 6 caracteres" style={{ flex: 1, marginBottom: 0 }} /><Text style={styles.show} onPress={() => setShowPassword(value => !value)}>{showPassword ? "Ocultar" : "Mostrar"}</Text></View>
        <ClayInput label="Confirmar senha" value={form.confirm} onChangeText={value => update("confirm", value)} secureTextEntry={!showPassword} placeholder="Digite novamente" />
        <Text style={styles.label}>Tipo de conta</Text>
        <View style={styles.types}>
          {["Profissional", "Empresa/vendedor"].map(type => <Text key={type} onPress={() => update("type", type)} style={[styles.type, form.type === type && styles.typeActive]}>{type}</Text>)}
        </View>
        <Text onPress={() => setAccepted(value => !value)} style={styles.terms}><Text style={styles.check}>{accepted ? "☑" : "□"}</Text> Li e aceito os termos de uso e a política de privacidade.</Text>
        <ClayButton title="Criar minha conta" onPress={submit} loading={loading} style={{ marginTop: 16 }} />
      </ClayCard>
      <Text style={styles.login} onPress={() => navigation.navigate("Login")}>Já tem uma conta? <Text style={{ color: COLORS.primaryDark, fontWeight: "800" }}>Entrar</Text></Text>
    </ScrollView>
  </KeyboardAvoidingView></ClayScreen>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 36, paddingBottom: 40 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, letterSpacing: 1, fontWeight: "900" },
  title: { color: COLORS.textPrimary, fontSize: 31, fontWeight: "900", marginTop: 8 },
  subtitle: { color: COLORS.textSecondary, marginTop: 7, marginBottom: 20, lineHeight: 21 },
  passwordRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  show: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "800", paddingBottom: 20 },
  label: { color: COLORS.textPrimary, fontWeight: "700", marginBottom: 8 },
  types: { flexDirection: "row", gap: 8 },
  type: { flex: 1, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 9, paddingVertical: 11, textAlign: "center", color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" },
  typeActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft, color: COLORS.primaryDark },
  terms: { color: COLORS.textSecondary, marginTop: 15, lineHeight: 20 },
  check: { color: COLORS.primary, fontSize: 17, fontWeight: "900" },
  login: { color: COLORS.textSecondary, textAlign: "center", marginTop: 18 },
});
