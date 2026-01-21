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
import api from "../../services/api";

export default function ApplyJobScreen({ route, navigation }) {
  const { jobId } = route.params;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    education: [
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
      },
    ],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData((prev) => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, education: newEducation }));
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, insira seu nome");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu email");
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert("Erro", "Por favor, insira um email válido");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Erro", "Por favor, insira seu telefone");
      return;
    }

    // Validar pelo menos uma formação
    const hasValidEducation = formData.education.some(
      (edu) => edu.institution.trim() && edu.degree.trim(),
    );

    if (!hasValidEducation) {
      Alert.alert(
        "Erro",
        "Por favor, preencha pelo menos uma formação acadêmica",
      );
      return;
    }

    setLoading(true);

    try {
      // Filtrar formações válidas
      const validEducation = formData.education.filter(
        (edu) => edu.institution.trim() && edu.degree.trim(),
      );

      const response = await api.post(`/jobs/${jobId}/apply`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl || null,
        education: validEducation,
      });

      if (response.data.success) {
        Alert.alert("Sucesso", "Candidatura enviada com sucesso! Boa sorte!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao enviar candidatura";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Candidatar-se à Vaga</Text>
        <Text style={styles.subtitle}>
          Preencha os dados abaixo para enviar sua candidatura
        </Text>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Seu nome completo"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="(00) 00000-0000"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Link do Currículo</Text>
            <Text style={styles.helpText}>
              (Opcional) Link para Google Drive, Dropbox, LinkedIn, etc.
            </Text>
            <TextInput
              style={styles.input}
              value={formData.resumeUrl}
              onChangeText={(value) => handleInputChange("resumeUrl", value)}
              placeholder="https://exemplo.com/meu-curriculo"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Formação Acadêmica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formação Acadêmica</Text>
            <TouchableOpacity style={styles.addButton} onPress={addEducation}>
              <Text style={styles.addButtonText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>

          {formData.education.map((edu, index) => (
            <View key={index} style={styles.educationCard}>
              <View style={styles.educationHeader}>
                <Text style={styles.educationNumber}>Formação {index + 1}</Text>
                {formData.education.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEducation(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Instituição *</Text>
                <TextInput
                  style={styles.input}
                  value={edu.institution}
                  onChangeText={(value) =>
                    handleEducationChange(index, "institution", value)
                  }
                  placeholder="Nome da instituição"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Grau *</Text>
                <TextInput
                  style={styles.input}
                  value={edu.degree}
                  onChangeText={(value) =>
                    handleEducationChange(index, "degree", value)
                  }
                  placeholder="Ex: Bacharelado, Mestrado, Técnico"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Área de Estudo</Text>
                <TextInput
                  style={styles.input}
                  value={edu.fieldOfStudy}
                  onChangeText={(value) =>
                    handleEducationChange(index, "fieldOfStudy", value)
                  }
                  placeholder="Ex: Ciência da Computação"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Ano Início</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.startYear}
                    onChangeText={(value) =>
                      handleEducationChange(index, "startYear", value)
                    }
                    placeholder="2020"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Ano Fim</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.endYear}
                    onChangeText={(value) =>
                      handleEducationChange(index, "endYear", value)
                    }
                    placeholder="2024"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Candidatura</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  formGroup: {
    marginBottom: 16,
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
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: SIZES.body3,
    fontWeight: "600",
  },
  educationCard: {
    backgroundColor: COLORS.cardBackground || "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  educationNumber: {
    fontSize: SIZES.body2,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  removeButton: {
    backgroundColor: COLORS.error || "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: SIZES.body4,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
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
