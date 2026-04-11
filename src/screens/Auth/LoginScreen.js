import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("ana@antera.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos obrigatorios", "Preencha email e senha.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Nao foi possivel entrar", result.error);
    }
  };

  return (
    <ClayScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.badge}>Antera Chat</Text>
            <Text style={styles.title}>Networking profissional com cara de produto moderno.</Text>
            <Text style={styles.subtitle}>
              Compartilhe marketing pessoal, venda produtos, encontre vagas e converse em tempo real.
            </Text>
          </View>

          <ClayCard style={styles.card}>
            <ClayInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <ClayInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <ClayButton title="Entrar" onPress={handleLogin} loading={loading} />
            <ClayButton
              title="Criar conta"
              variant="secondary"
              style={{ marginTop: 12 }}
              onPress={() => navigation.navigate("Register")}
            />
            <Text style={styles.helper}>Login demo: `ana@antera.com` / `123456`</Text>
          </ClayCard>

          <View style={styles.footerPoints}>
            {[
              "Feed para marketing pessoal e vendas",
              "Area separada para vagas e candidaturas",
              "Perfil estilo creator com foco em networking",
            ].map((item) => (
              <View key={item} style={styles.point}>
                <View style={styles.dot} />
                <Text style={styles.pointText}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Ainda nao tem conta? Criar agora</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    color: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    fontWeight: "800",
    marginBottom: 18,
  },
  title: {
    fontSize: SIZES.h1,
    color: COLORS.textPrimary,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    lineHeight: 24,
  },
  card: {
    marginBottom: 18,
  },
  helper: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 14,
  },
  footerPoints: {
    gap: 10,
    marginBottom: 20,
  },
  point: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  pointText: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  link: {
    textAlign: "center",
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
});
