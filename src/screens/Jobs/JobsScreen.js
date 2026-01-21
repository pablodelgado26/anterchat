import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";

export default function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await api.get(`/jobs?page=${pageNum}&limit=10`);

      if (response.data.success) {
        const newJobs = response.data.data;

        if (isRefresh || pageNum === 1) {
          setJobs(newJobs);
        } else {
          setJobs([...jobs, ...newJobs]);
        }

        setHasMore(
          response.data.pagination.page < response.data.pagination.totalPages,
        );
        setPage(pageNum);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as vagas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchJobs(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(page + 1);
    }
  };

  const handleJobPress = (jobId) => {
    navigation.navigate("JobDetail", { jobId });
  };

  const handleCreateJob = () => {
    navigation.navigate("CreateJob");
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleJobPress(item.id)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobHeaderLeft}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.companyName}>
            {item.company?.name || item.postedBy?.name}
          </Text>
        </View>
        <View style={styles.companyLogo}>
          <Icon name="domain" size={32} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Icon
            name="briefcase-outline"
            size={14}
            color={COLORS.textSecondary}
          />
          <Text style={styles.tagText}>{item.jobType}</Text>
        </View>
        <View style={styles.tag}>
          <Icon name="map-marker" size={14} color={COLORS.textSecondary} />
          <Text style={styles.tagText}>{item.location}</Text>
        </View>
        <View style={styles.tag}>
          <Icon name="laptop" size={14} color={COLORS.textSecondary} />
          <Text style={styles.tagText}>{item.workplaceType}</Text>
        </View>
      </View>

      {item.salaryRange && (
        <View style={styles.salaryContainer}>
          <Icon name="cash" size={16} color={COLORS.success || "#4CAF50"} />
          <Text style={styles.salaryText}>{item.salaryRange}</Text>
        </View>
      )}

      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.jobFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon
              name="account-multiple"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.statText}>
              {item.applicantsCount} candidatos
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="eye" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.viewsCount} visualizações</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleJobPress(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.applyButtonText}>Candidatar-se</Text>
        <Icon name="arrow-right" size={18} color="#FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="briefcase-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>Nenhuma vaga disponível</Text>
      <Text style={styles.emptySubtext}>
        Seja o primeiro a publicar uma vaga!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando vagas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vagas de Emprego</Text>
        <Text style={styles.headerSubtitle}>
          {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} disponível
          {jobs.length !== 1 ? "eis" : ""}
        </Text>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Botão Flutuante para Criar Vaga */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateJob}>
        <Icon name="plus" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingTop: SIZES.padding + 10,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body3,
    color: "#FFF",
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 80,
  },
  jobCard: {
    backgroundColor: COLORS.cardBackground || "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: "600",
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
    gap: 4,
  },
  tagText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
  },
  salaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  salaryText: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: COLORS.success || "#4CAF50",
  },
  description: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || "#E0E0E0",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: SIZES.body3,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
