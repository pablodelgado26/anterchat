import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState("ana@reservachat.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Campos obrigatórios", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) Alert.alert("Não foi possível entrar", result.error);
    else if (result.warning) Alert.alert("Sessão iniciada", result.warning);
  };

  const guest = async () => {
    try { await continueAsGuest(); }
    catch (error) { Alert.alert("Não foi possível continuar", error.message); }
  };

  return (
    <ClayScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logo}><Text style={styles.logoText}>R</Text></View>
            <Text style={styles.brand}>Reserva Chat</Text>
            <Text style={styles.eyebrow}>TRABALHO · NEGÓCIOS · CONEXÕES</Text>
            <Text style={styles.title}>Seu próximo passo começa com uma conversa.</Text>
            <Text style={styles.subtitle}>Encontre oportunidades, divulgue o que você faz e construa relações profissionais de verdade.</Text>
            <View style={styles.points}>
              <Text style={styles.point}><Icon name="check-circle" size={18} color={COLORS.primary} /> Vagas e talentos em um só lugar</Text>
              <Text style={styles.point}><Icon name="check-circle" size={18} color={COLORS.primary} /> Uma vitrine para seus produtos</Text>
              <Text style={styles.point}><Icon name="check-circle" size={18} color={COLORS.primary} /> Conversas que aproximam pessoas</Text>
            </View>
          </View>
          <ClayCard style={styles.card}>
            <Text style={styles.formTitle}>Boas-vindas de volta</Text>
            <Text style={styles.formSubtitle}>Entre para continuar suas conexões.</Text>
            <ClayInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="voce@email.com" />
            <View style={styles.passwordRow}>
              <ClayInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="current-password" placeholder="Sua senha" style={{ flex: 1, marginBottom: 0 }} />
              <TouchableOpacity style={styles.showPassword} onPress={() => setShowPassword(value => !value)}><Text style={styles.link}>{showPassword ? "Ocultar" : "Mostrar"}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgot}><Text style={styles.link}>Esqueci minha senha</Text></TouchableOpacity>
            <ClayButton title="Entrar na Reserva Chat" onPress={handleLogin} loading={loading} />
            <ClayButton title="Criar conta" variant="secondary" onPress={() => navigation.navigate("Register")} style={{ marginTop: 10 }} />
            <View style={styles.divider}><View style={styles.rule} /><Text style={styles.or}>ou</Text><View style={styles.rule} /></View>
            <ClayButton title="Continuar como visitante" variant="secondary" icon="account-eye-outline" onPress={guest} />
            <Text style={styles.demo}>Demonstração: <Text style={{ fontWeight: "800" }}>ana@reservachat.com</Text> · senha <Text style={{ fontWeight: "800" }}>123456</Text></Text>
          </ClayCard>
          <Text style={styles.footer}>Uma comunidade para crescer junto.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 20, paddingTop: 32, paddingBottom: 40 },
  hero: { alignItems: "flex-start", marginBottom: 18, padding: 23, borderRadius: 28, backgroundColor: COLORS.primaryDeep, overflow: "hidden" },
  logo: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  logoText: { color: COLORS.textWhite, fontSize: 28, fontWeight: "900" },
  brand: { color: COLORS.textWhite, fontSize: 21, fontWeight: "900", marginTop: 14 },
  eyebrow: { color: COLORS.primaryGlow, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 18 },
  title: { color: COLORS.textWhite, fontSize: 30, lineHeight: 36, fontWeight: "900", textAlign: "left", marginTop: 10, letterSpacing: -0.6 },
  subtitle: { color: "rgba(255,255,255,0.78)", textAlign: "left", lineHeight: 22, marginTop: 9, maxWidth: 450 },
  points: { alignSelf: "stretch", gap: 8, marginTop: 17 },
  point: { color: "rgba(255,255,255,0.88)", fontWeight: "700" },
  card: { width: "100%", maxWidth: 520, alignSelf: "center", padding: 21, borderRadius: 24 },
  formTitle: { color: COLORS.textPrimary, fontSize: 23, fontWeight: "900" },
  formSubtitle: { color: COLORS.textSecondary, marginTop: 5, marginBottom: 15 },
  passwordRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  showPassword: { height: 54, justifyContent: "center", paddingHorizontal: 5 },
  link: { color: COLORS.primaryDark, fontWeight: "800", fontSize: 12 },
  forgot: { alignSelf: "flex-end", paddingVertical: 11 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 14 },
  rule: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { color: COLORS.textMuted, fontSize: 12 },
  demo: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 12 },
  footer: { color: COLORS.textMuted, fontSize: 12, textAlign: "center", marginTop: 16 },
});
