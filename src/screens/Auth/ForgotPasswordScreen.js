import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPasswordScreen({ navigation, route }) {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const token = route.params?.token;

  const submit = async () => {
    if (!token && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Alert.alert("E-mail inválido", "Informe o e-mail da sua conta.");
    if (token && password.length < 6) return Alert.alert("Senha muito curta", "Use pelo menos 6 caracteres.");
    if (token && password !== confirm) return Alert.alert("Senhas diferentes", "Confira a confirmação da nova senha.");
    setLoading(true);
    const result = token
      ? await resetPassword(token, password)
      : await requestPasswordReset(email);
    setLoading(false);
    if (!result.success) return Alert.alert("Não foi possível redefinir a senha", result.error);
    if (!token) {
      setRequested(true);
      return;
    }
    Alert.alert("Senha atualizada", "Agora entre com a nova senha.", [{ text: "Entrar", onPress: () => navigation.navigate("Login") }]);
  };

  return <ClayScreen><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>RESERVA CHAT</Text><Text style={styles.title}>{token ? "Escolha uma nova senha" : "Redefina sua senha"}</Text><Text style={styles.subtitle}>{token ? "O link é válido por uma hora." : "Enviaremos um link seguro para o e-mail da sua conta."}</Text>
      <ClayCard>
        {token ? <>
          <ClayInput label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo de 6 caracteres" />
          <ClayInput label="Confirmar nova senha" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Digite novamente" />
          <ClayButton title="Salvar nova senha" onPress={submit} loading={loading} />
        </> : requested ? <>
          <Text style={styles.subtitle}>Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. Confira também sua caixa de spam.</Text>
          <ClayButton title="Enviar outro link" onPress={() => setRequested(false)} variant="secondary" />
        </> : <>
          <ClayInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="voce@email.com" />
          <ClayButton title="Enviar link de redefinição" onPress={submit} loading={loading} />
        </>}
      </ClayCard>
      <Text style={styles.back} onPress={() => navigation.navigate("Login")}>Voltar para entrar</Text>
    </ScrollView>
  </KeyboardAvoidingView></ClayScreen>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 40 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, letterSpacing: 1, fontWeight: "900" },
  title: { color: COLORS.textPrimary, fontSize: 29, fontWeight: "900", marginTop: 8 },
  subtitle: { color: COLORS.textSecondary, marginTop: 7, marginBottom: 20 },
  back: { color: COLORS.primaryDark, textAlign: "center", fontWeight: "800", padding: 18 },
});
