import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { postsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getAll({ page: 1, limit: 10 });
      setPosts(response.data.data);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadPosts();
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.toggleLike(postId);
      // Atualizar lista
      loadPosts();
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
    >
      {/* Header do post */}
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.author.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.authorName}>{item.author.name}</Text>
          <Text style={styles.authorHeadline}>{item.author.headline}</Text>
          <Text style={styles.postTime}>
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Ações */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Icon
            name="thumb-up-outline"
            size={20}
            color={COLORS.textSecondary}
          />
          <Text style={styles.actionText}>{item._count.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
        >
          <Icon name="comment-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{item._count.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Antera Chat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Icon name="magnify" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />

      {/* Botão de criar post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <Icon name="plus" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 16,
  },
  listContent: {
    padding: SIZES.paddingSmall,
  },
  postCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.paddingSmall,
    ...SHADOWS.small,
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    fontWeight: "bold",
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: SIZES.body,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  authorHeadline: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  postTime: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
    marginTop: 2,
  },
  postContent: {
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 4,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.large,
  },
});
