import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import {
  ClayButton,
  ClayCard,
  ClayInput,
  ClayScreen,
  SegmentedTabs,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { jobsAPI } from "../../services/api";
import { parseListInput } from "../../utils/formatters";

const applicationTabs = [
  { label: "Interna", value: "internal" },
  { label: "Externa", value: "external" },
];

export default function CreateJobScreen({ navigation }) {
  const [applicationType, setApplicationType] = useState("internal");
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    jobType: "CLT",
    workplaceType: "Remoto",
    salaryRange: "",
    externalApplicationUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!form.title || !form.companyName || !form.description) {
      Alert.alert("Campos obrigatorios", "Titulo, empresa e descricao sao obrigatorios.");
      return;
    }

    if (applicationType === "external" && !form.externalApplicationUrl) {
      Alert.alert("Link obrigatorio", "Informe o link da candidatura externa.");
      return;
    }

    setLoading(true);
    try {
      await jobsAPI.create({
        ...form,
        applicationType,
        requirements: parseListInput(form.requirements),
        benefits: parseListInput(form.benefits),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Nao foi possivel publicar", error.response?.data?.error || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Publique uma vaga com fluxo de candidatura claro</Text>
        <Text style={styles.subtitle}>
          Use candidatura interna para receber curriculos no app ou externa para direcionar ao site da empresa.
        </Text>

        <SegmentedTabs options={applicationTabs} value={applicationType} onChange={setApplicationType} />

        <ClayCard style={{ marginTop: 18 }}>
          <ClayInput label="Titulo da vaga" value={form.title} onChangeText={(value) => updateField("title", value)} />
          <ClayInput label="Empresa" value={form.companyName} onChangeText={(value) => updateField("companyName", value)} />
          <ClayInput label="Descricao completa" multiline value={form.description} onChangeText={(value) => updateField("description", value)} />
          <ClayInput
            label="Requisitos"
            multiline
            value={form.requirements}
            onChangeText={(value) => updateField("requirements", value)}
            hint="Um requisito por linha."
          />
          <ClayInput
            label="Beneficios"
            multiline
            value={form.benefits}
            onChangeText={(value) => updateField("benefits", value)}
            hint="Um beneficio por linha."
          />
          <ClayInput label="Localizacao" value={form.location} onChangeText={(value) => updateField("location", value)} />
          <ClayInput label="Tipo de contrato" value={form.jobType} onChangeText={(value) => updateField("jobType", value)} />
          <ClayInput label="Modelo de trabalho" value={form.workplaceType} onChangeText={(value) => updateField("workplaceType", value)} />
          <ClayInput label="Faixa salarial" value={form.salaryRange} onChangeText={(value) => updateField("salaryRange", value)} />

          {applicationType === "external" ? (
            <ClayInput
              label="Link da candidatura"
              value={form.externalApplicationUrl}
              onChangeText={(value) => updateField("externalApplicationUrl", value)}
            />
          ) : null}
        </ClayCard>

        <ClayButton title="Publicar vaga" icon="rocket-launch-outline" onPress={submit} loading={loading} style={{ marginTop: 18, marginBottom: 30 }} />
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
    lineHeight: 22,
    marginTop: 10,
  },
});
