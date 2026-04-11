import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  ClayButton,
  ClayCard,
  ClayScreen,
  EmptyState,
  SectionTitle,
  SegmentedTabs,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { jobsAPI } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";

const jobTabs = [
  { label: "Todas", value: "all" },
  { label: "Interna", value: "internal" },
  { label: "Externa", value: "external" },
];

export default function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async (selectedTab = tab) => {
    const response = await jobsAPI.getAll(
      selectedTab === "all" ? {} : { applicationType: selectedTab },
    );
    setJobs(response.data.data || []);
    setRefreshing(false);
  }, [tab]);

  useEffect(() => {
    loadJobs(tab);
  }, [tab, loadJobs]);

  useFocusEffect(
    useCallback(() => {
      loadJobs(tab);
    }, [loadJobs, tab]),
  );

  const renderJob = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}>
      <ClayCard style={{ marginTop: 14 }}>
        <View style={styles.jobTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.company}>{item.companyName || item.postedBy?.name}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.applicationType === "internal" ? "App" : "Link"}
            </Text>
          </View>
        </View>

        <Text style={styles.jobDescription}>{item.description}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{item.jobType}</Text>
          <Text style={styles.infoText}>{item.workplaceType}</Text>
          <Text style={styles.infoText}>{item.location || "Local flexivel"}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.salary}>{item.salaryRange || "Faixa a combinar"}</Text>
          <Text style={styles.time}>{formatRelativeDate(item.createdAt)}</Text>
        </View>
      </ClayCard>
    </TouchableOpacity>
  );

  return (
    <ClayScreen>
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJob}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadJobs(tab);
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ClayCard style={styles.heroCard}>
              <Text style={styles.heroTitle}>Oportunidades em um fluxo separado e objetivo.</Text>
              <Text style={styles.heroSubtitle}>
                Publique vagas, receba candidaturas internas e direcione para processos externos quando fizer sentido.
              </Text>
              <ClayButton title="Publicar vaga" icon="briefcase-plus-outline" onPress={() => navigation.navigate("CreateJob")} style={{ marginTop: 16 }} />
            </ClayCard>
            <SectionTitle
              title="Vagas em destaque"
              subtitle="Processos internos e externos em uma experiencia simples."
            />
            <SegmentedTabs options={jobTabs} value={tab} onChange={setTab} />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-search-outline"
            title="Nenhuma vaga nesta categoria"
            subtitle="Ajuste o filtro ou publique a primeira oportunidade da rede."
          />
        }
      />
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 110,
  },
  heroCard: {
    marginTop: 10,
    marginBottom: 18,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 10,
  },
  jobTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  jobTitle: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 20,
  },
  company: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    marginTop: 6,
  },
  badge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  jobDescription: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 14,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  infoText: {
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  salary: {
    color: COLORS.textPrimary,
    fontWeight: "900",
  },
  time: {
    color: COLORS.textMuted,
  },
});
