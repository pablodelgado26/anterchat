import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { profileAPI } from "../../services/api";

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    avatar: "",
    coverImage: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await profileAPI.getProfile(user.id);
      const data = response.data.data;
      setForm({
        name: data.name || "",
        headline: data.headline || "",
        bio: data.bio || "",
        location: data.location || "",
        website: data.website || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
        coverImage: data.coverImage || "",
      });
    };
    load();
  }, [user.id]);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.updateProfile(form);
      await updateUser({ ...user, ...response.data.data });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Nao foi possivel salvar", error.response?.data?.error || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ajuste sua vitrine profissional</Text>
        <Text style={styles.subtitle}>
          Seu perfil deve explicar rapido quem voce ajuda, como trabalha e o que oferece.
        </Text>
        <ClayCard>
          <ClayInput label="Nome" value={form.name} onChangeText={(value) => updateField("name", value)} />
          <ClayInput label="Headline" value={form.headline} onChangeText={(value) => updateField("headline", value)} />
          <ClayInput label="Bio" multiline value={form.bio} onChangeText={(value) => updateField("bio", value)} />
          <ClayInput label="Localizacao" value={form.location} onChangeText={(value) => updateField("location", value)} />
          <ClayInput label="Website" value={form.website} onChangeText={(value) => updateField("website", value)} />
          <ClayInput label="Telefone" value={form.phone} onChangeText={(value) => updateField("phone", value)} />
          <ClayInput label="URL do avatar" value={form.avatar} onChangeText={(value) => updateField("avatar", value)} />
          <ClayInput label="URL da capa" value={form.coverImage} onChangeText={(value) => updateField("coverImage", value)} />
        </ClayCard>
        <ClayButton title="Salvar perfil" icon="content-save-outline" onPress={save} loading={loading} style={{ marginTop: 18, marginBottom: 30 }} />
      </ScrollView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 80,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 22,
    marginBottom: 18,
  },
});
