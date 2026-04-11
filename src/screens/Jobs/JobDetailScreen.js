import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { ClayButton, ClayCard, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { jobsAPI } from "../../services/api";

export default function JobDetailScreen({ navigation, route }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await jobsAPI.getById(jobId);
        setJob(response.data.data);
      } catch (error) {
        Alert.alert("Erro", "Nao foi possivel carregar a vaga.");
      }
    };
    load();
  }, [jobId]);

  if (!job) {
    return <ClayScreen />;
  }

  const handleApply = () => {
    if (job.applicationType === "external") {
      Linking.openURL(job.externalApplicationUrl);
      return;
    }
    navigation.navigate("ApplyJob", { jobId: job.id, jobTitle: job.title });
  };

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ClayCard>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.companyName || job.postedBy?.name}</Text>
          <Text style={styles.description}>{job.description}</Text>

          <View style={styles.stack}>
            <Text style={styles.item}>Contrato: {job.jobType}</Text>
            <Text style={styles.item}>Formato: {job.workplaceType}</Text>
            <Text style={styles.item}>Localizacao: {job.location || "Flexivel"}</Text>
            <Text style={styles.item}>Faixa: {job.salaryRange || "A combinar"}</Text>
          </View>
        </ClayCard>

        <ClayCard style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Requisitos</Text>
          {(job.requirementsList || []).map((item) => (
            <Text key={item} style={styles.listItem}>• {item}</Text>
          ))}
          {!job.requirementsList?.length ? <Text style={styles.listItem}>Sem requisitos informados.</Text> : null}
        </ClayCard>

        <ClayCard style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Beneficios</Text>
          {(job.benefitsList || []).map((item) => (
            <Text key={item} style={styles.listItem}>• {item}</Text>
          ))}
          {!job.benefitsList?.length ? <Text style={styles.listItem}>Sem beneficios cadastrados.</Text> : null}
        </ClayCard>

        <ClayButton
          title={job.applicationType === "external" ? "Ir para candidatura externa" : "Candidatar-se agora"}
          icon={job.applicationType === "external" ? "open-in-new" : "send-outline"}
          onPress={handleApply}
          style={{ marginTop: 18, marginBottom: 30 }}
        />
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
    lineHeight: 34,
  },
  company: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    marginTop: 10,
  },
  description: {
    color: COLORS.textSecondary,
    marginTop: 16,
    lineHeight: 24,
  },
  stack: {
    marginTop: 18,
    gap: 8,
  },
  item: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  listItem: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
});
