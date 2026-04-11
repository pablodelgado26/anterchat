import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Campos obrigatorios", "Preencha nome, email e senha.");
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Nao foi possivel criar a conta", result.error);
    }
  };

  return (
    <ClayScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Monte seu perfil profissional no Antera Chat</Text>
          <Text style={styles.subtitle}>
            Em poucos passos voce ja consegue publicar, vender, buscar vagas e criar conexoes.
          </Text>

          <ClayCard>
            <ClayInput label="Nome completo" value={form.name} onChangeText={(value) => onChange("name", value)} />
            <ClayInput
              label="Email"
              value={form.email}
              autoCapitalize="none"
              onChangeText={(value) => onChange("email", value)}
            />
            <ClayInput
              label="Senha"
              value={form.password}
              secureTextEntry
              onChangeText={(value) => onChange("password", value)}
              hint="Sua conta ja sera criada com estrutura pronta para networking e vendas."
            />
            <ClayButton title="Criar minha conta" onPress={handleSubmit} loading={loading} />
          </ClayCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 22,
  },
});
