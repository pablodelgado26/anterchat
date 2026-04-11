import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ClayButton, ClayCard, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { jobsAPI } from "../../services/api";
import { formatFileLabel } from "../../utils/formatters";

export default function ApplyJobScreen({ navigation, route }) {
  const { jobId, jobTitle } = route.params;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    coverLetter: "",
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      setResume(result.assets[0]);
    }
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !resume) {
      Alert.alert("Formulario incompleto", "Preencha os campos e anexe seu curriculo.");
      return;
    }

    setLoading(true);
    try {
      await jobsAPI.apply(jobId, {
        ...form,
        resumeUrl: resume.uri,
        resumeFileName: formatFileLabel(resume),
        resumeMimeType: resume.mimeType,
      });
      Alert.alert("Candidatura enviada", "Seu perfil foi enviado para a vaga.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Nao foi possivel candidatar", error.response?.data?.error || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Candidatura interna</Text>
        <Text style={styles.subtitle}>Vaga: {jobTitle}</Text>

        <ClayCard>
          <ClayInput label="Nome completo" value={form.name} onChangeText={(value) => updateField("name", value)} />
          <ClayInput label="Email" value={form.email} onChangeText={(value) => updateField("email", value)} autoCapitalize="none" />
          <ClayInput label="Telefone" value={form.phone} onChangeText={(value) => updateField("phone", value)} />
          <ClayInput
            label="Formacao"
            value={form.education}
            onChangeText={(value) => updateField("education", value)}
            hint="Curso, certificacao ou ultimo nivel academico."
          />
          <ClayInput
            label="Carta de apresentacao"
            multiline
            value={form.coverLetter}
            onChangeText={(value) => updateField("coverLetter", value)}
          />
          <ClayButton
            title={resume ? `Curriculo: ${formatFileLabel(resume)}` : "Selecionar curriculo PDF ou DOC"}
            variant="secondary"
            icon="paperclip"
            onPress={pickResume}
          />
        </ClayCard>

        <ClayButton title="Enviar candidatura" icon="send-outline" onPress={submit} loading={loading} style={{ marginTop: 18, marginBottom: 30 }} />
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
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 18,
  },
});
