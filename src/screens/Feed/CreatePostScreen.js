import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function CreatePostScreen({ navigation }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert(
        "Não autenticado",
        "Você precisa estar logado para criar uma publicação",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setVideoUri(null); // Remove vídeo se selecionar imagem
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar seus vídeos",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setImageUri(null); // Remove imagem se selecionar vídeo
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar sua câmera",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setVideoUri(null);
    }
  };

  const removeMedia = () => {
    setImageUri(null);
    setVideoUri(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUri && !videoUri) {
      Alert.alert(
        "Atenção",
        "Adicione um texto, imagem ou vídeo para publicar",
      );
      return;
    }

    // Verificar se está autenticado
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para criar uma publicação"
      );
      navigation.navigate("Login");
      return;
    }

    setLoading(true);

    try {
      const postData = {
        content: content.trim() || null,
        imageUrl: imageUri || null,
        videoUrl: videoUri || null,
      };

      console.log("Enviando post:", postData);

      const response = await api.post("/posts", postData);

      if (response.data.success) {
        Alert.alert("Sucesso", "Publicação criada com sucesso!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Erro ao criar publicação";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header do autor */}
          <View style={styles.authorHeader}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              )}
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{user?.name || "Usuário"}</Text>
              <Text style={styles.authorHeadline}>
                {user?.headline || "Profissional"}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="No que voce esta pensando?"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {imageUri && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: imageUri }} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeMedia}
              >
                <Icon name="close-circle" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {videoUri && (
            <View style={styles.mediaContainer}>
              <View style={styles.videoPlaceholder}>
                <Icon name="video" size={64} color={COLORS.textSecondary} />
                <Text style={styles.videoText}>Vídeo selecionado</Text>
              </View>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeMedia}
              >
                <Icon name="close-circle" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Opções de mídia */}
          <View style={styles.mediaOptions}>
            <Text style={styles.mediaTitle}>Adicionar à publicação</Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Icon name="image" size={24} color={COLORS.primary} />
                <Text style={styles.mediaButtonText}>Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                <Icon name="video" size={24} color={COLORS.primary} />
                <Text style={styles.mediaButtonText}>Vídeo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Icon name="camera" size={24} color={COLORS.primary} />
                <Text style={styles.mediaButtonText}>Câmera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão de publicar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.publishButton,
            loading && styles.publishButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.publishButtonText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  authorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#FFF",
    fontSize: SIZES.h3,
    fontWeight: "bold",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: SIZES.body2,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  authorHeadline: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  textInput: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  mediaContainer: {
    position: "relative",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  mediaPreview: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.border,
  },
  videoPlaceholder: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.cardBackground || "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: {
    marginTop: 12,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  removeMediaButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
  },
  mediaOptions: {
    backgroundColor: COLORS.cardBackground || "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
  },
  mediaTitle: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mediaButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minWidth: 80,
  },
  mediaButtonText: {
    fontSize: SIZES.body4,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || "#E0E0E0",
    backgroundColor: COLORS.background,
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: "#FFF",
    fontSize: SIZES.body2,
    fontWeight: "bold",
  },
});
