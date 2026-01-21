import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function CreateJobScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    workplaceType: "On-site",
    salaryRange: "",
    requirements: "",
    benefits: "",
    externalApplicationUrl: "",
  });

  const jobTypes = ["Período integral", "Meio período", "Contrato", "Estágio"];
  const workplaceTypes = ["Remoto", "Híbrido", "Presencial"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.title.trim()) {
      Alert.alert("Erro", "Por favor, insira o título da vaga");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Erro", "Por favor, insira a descrição da vaga");
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert("Erro", "Por favor, insira a localização");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/jobs", formData);

      if (response.data.success) {
        Alert.alert("Sucesso", "Vaga publicada com sucesso!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Erro ao publicar vaga",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Publicar Nova Vaga</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Título da Vaga *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange("title", value)}
            placeholder="Ex: Desenvolvedor Full Stack"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            placeholder="Descreva as responsabilidades e detalhes da vaga..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Localização *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(value) => handleInputChange("location", value)}
            placeholder="Ex: São Paulo, SP"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Emprego *</Text>
          <View style={styles.buttonGroup}>
            {jobTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formData.jobType === type && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange("jobType", type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.jobType === type && styles.optionTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Modalidade de Trabalho *</Text>
          <View style={styles.buttonGroup}>
            {workplaceTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formData.workplaceType === type && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange("workplaceType", type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.workplaceType === type && styles.optionTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Faixa Salarial</Text>
          <TextInput
            style={styles.input}
            value={formData.salaryRange}
            onChangeText={(value) => handleInputChange("salaryRange", value)}
            placeholder="Ex: R$ 5.000 - R$ 8.000"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Requisitos</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.requirements}
            onChangeText={(value) => handleInputChange("requirements", value)}
            placeholder="Liste os requisitos separados por vírgula ou quebra de linha"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Benefícios</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.benefits}
            onChangeText={(value) => handleInputChange("benefits", value)}
            placeholder="Liste os benefícios separados por vírgula ou quebra de linha"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Link Externo para Candidatura</Text>
          <Text style={styles.helpText}>
            (Opcional) Se preenchido, os candidatos serão redirecionados para
            este link
          </Text>
          <TextInput
            style={styles.input}
            value={formData.externalApplicationUrl}
            onChangeText={(value) =>
              handleInputChange("externalApplicationUrl", value)
            }
            placeholder="https://exemplo.com/candidatura"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Publicar Vaga</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground || "#FFF",
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
    backgroundColor: COLORS.cardBackground || "#FFF",
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
  },
  optionTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: SIZES.body2,
    fontWeight: "bold",
  },
});
