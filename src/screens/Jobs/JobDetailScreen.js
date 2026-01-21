import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da vaga");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (job.externalApplicationUrl) {
      // Redirecionar para link externo
      Linking.openURL(job.externalApplicationUrl).catch(() => {
        Alert.alert("Erro", "Não foi possível abrir o link");
      });
    } else {
      // Navegar para tela de candidatura
      navigation.navigate("ApplyJob", { jobId: job.id });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Vaga não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>
              {job.company?.name || job.postedBy?.name}
            </Text>

            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.jobType}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{job.workplaceType}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>📍 {job.location}</Text>
              </View>
            </View>

            {job.salaryRange && (
              <Text style={styles.salary}>💰 {job.salaryRange}</Text>
            )}
          </View>

          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{job.applicantsCount}</Text>
              <Text style={styles.statLabel}>Candidatos</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{job.viewsCount}</Text>
              <Text style={styles.statLabel}>Visualizações</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{formatDate(job.createdAt)}</Text>
              <Text style={styles.statLabel}>Publicada em</Text>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre a vaga</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          {/* Requisitos */}
          {job.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requisitos</Text>
              <Text style={styles.description}>{job.requirements}</Text>
            </View>
          )}

          {/* Benefícios */}
          {job.benefits && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefícios</Text>
              <Text style={styles.description}>{job.benefits}</Text>
            </View>
          )}

          {/* Informações da Empresa */}
          {job.company && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre a Empresa</Text>
              <Text style={styles.companyInfo}>
                {job.company.description || job.company.name}
              </Text>
              {job.company.industry && (
                <Text style={styles.companyDetail}>
                  Setor: {job.company.industry}
                </Text>
              )}
              {job.company.size && (
                <Text style={styles.companyDetail}>
                  Tamanho: {job.company.size}
                </Text>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Botão de Candidatura Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            {job.externalApplicationUrl
              ? "Candidatar-se no Site"
              : "Candidatar-se à Vaga"}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  companyName: {
    fontSize: SIZES.h3,
    color: COLORS.primary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.cardBackground || "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
  },
  tagText: {
    fontSize: SIZES.body4,
    color: COLORS.textPrimary,
  },
  salary: {
    fontSize: SIZES.body2,
    fontWeight: "600",
    color: COLORS.success || "#4CAF50",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground || "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  companyInfo: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  companyDetail: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: SIZES.body2,
    fontWeight: "bold",
  },
});
