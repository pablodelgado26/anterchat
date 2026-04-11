import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  ClayButton,
  ClayCard,
  ClayInput,
  ClayScreen,
  SegmentedTabs,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { postsAPI } from "../../services/api";

const postTabs = [
  { label: "Marketing", value: "marketing" },
  { label: "Venda", value: "sale" },
];

export default function CreatePostScreen({ navigation }) {
  const [type, setType] = useState("marketing");
  const [form, setForm] = useState({
    title: "",
    content: "",
    productName: "",
    productPrice: "",
    externalLink: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Precisamos acessar suas imagens.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });

    if (!result.canceled) {
      updateField("imageUrl", result.assets[0].uri);
      updateField("videoUrl", "");
    }
  };

  const submit = async () => {
    if (!form.title || !form.content) {
      Alert.alert("Campos obrigatorios", "Preencha titulo e descricao.");
      return;
    }

    if (type === "sale" && (!form.externalLink || (!form.imageUrl && !form.videoUrl))) {
      Alert.alert(
        "Post de venda incompleto",
        "Posts de venda precisam de link externo e imagem ou video.",
      );
      return;
    }

    setLoading(true);
    try {
      await postsAPI.create({
        ...form,
        type,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Nao foi possivel publicar",
        error.response?.data?.error || "Tente novamente em instantes.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Escolha o tipo de publicacao</Text>
        <Text style={styles.subtitle}>
          Marketing para autoridade. Venda para produtos, servicos e ofertas externas.
        </Text>

        <SegmentedTabs options={postTabs} value={type} onChange={setType} />

        <ClayCard style={{ marginTop: 18 }}>
          <ClayInput
            label={type === "sale" ? "Nome da oferta" : "Titulo do conteudo"}
            value={form.title}
            onChangeText={(value) => updateField("title", value)}
          />
          <ClayInput
            label="Descricao"
            multiline
            value={form.content}
            onChangeText={(value) => updateField("content", value)}
          />

          {type === "sale" ? (
            <>
              <ClayInput
                label="Nome do produto ou servico"
                value={form.productName}
                onChangeText={(value) => updateField("productName", value)}
              />
              <ClayInput
                label="Preco ou faixa"
                value={form.productPrice}
                onChangeText={(value) => updateField("productPrice", value)}
              />
              <ClayInput
                label="Link externo"
                value={form.externalLink}
                onChangeText={(value) => updateField("externalLink", value)}
                hint="Pode ser WhatsApp, site ou loja."
              />
            </>
          ) : null}

          <ClayInput
            label="URL de video (opcional)"
            value={form.videoUrl}
            onChangeText={(value) => updateField("videoUrl", value)}
          />

          <View style={styles.mediaActions}>
            <ClayButton title="Escolher imagem" variant="secondary" icon="image-outline" onPress={pickImage} style={{ flex: 1 }} />
            {form.imageUrl ? (
              <ClayButton
                title="Remover"
                variant="secondary"
                icon="close"
                onPress={() => updateField("imageUrl", "")}
                style={{ flex: 1 }}
              />
            ) : null}
          </View>

          {form.imageUrl ? (
            <TouchableOpacity activeOpacity={0.9}>
              <Image source={{ uri: form.imageUrl }} style={styles.preview} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder}>
              <Icon name="image-plus-outline" size={28} color={COLORS.primary} />
              <Text style={styles.placeholderText}>
                {type === "sale"
                  ? "Para venda, inclua uma imagem ou informe um video."
                  : "Voce pode enriquecer o post com imagem ou video."}
              </Text>
            </View>
          )}
        </ClayCard>

        <ClayButton title="Publicar no feed" icon="rocket-launch-outline" onPress={submit} loading={loading} style={{ marginTop: 18, marginBottom: 30 }} />
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
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  mediaActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  preview: {
    width: "100%",
    height: 240,
    borderRadius: 22,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    minHeight: 180,
    padding: 20,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
});
