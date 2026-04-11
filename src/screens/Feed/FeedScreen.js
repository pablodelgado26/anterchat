import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  AvatarBadge,
  ClayButton,
  ClayCard,
  ClayScreen,
  EmptyState,
  SectionTitle,
  SegmentedTabs,
} from "../../components/ui";
import { COLORS, SIZES } from "../../constants/theme";
import { postsAPI, profileAPI } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";

const feedTabs = [
  { label: "Tudo", value: "all" },
  { label: "Marketing", value: "marketing" },
  { label: "Venda", value: "sale" },
];

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const loadPosts = useCallback(async (selectedTab = tab) => {
    try {
      const response = await postsAPI.getAll(
        selectedTab === "all" ? {} : { type: selectedTab },
      );
      setPosts(response.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar feed", error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    loadPosts(tab);
  }, [tab, loadPosts]);

  useFocusEffect(
    useCallback(() => {
      loadPosts(tab);
    }, [loadPosts, tab]),
  );

  const toggleLike = async (postId) => {
    await postsAPI.toggleLike(postId);
    loadPosts(tab);
  };

  const handleShare = async (post) => {
    await postsAPI.share(post.id);
    if (post.externalLink) {
      await Linking.openURL(post.externalLink);
    }
    loadPosts(tab);
  };

  const handleFollow = async (authorId) => {
    try {
      await profileAPI.follow(authorId);
    } catch {}
  };

  const renderPost = ({ item }) => {
    const isSale = item.type === "sale";

    return (
      <ClayCard style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => navigation.navigate("UserProfile", { userId: item.author.id })}
          >
            <AvatarBadge name={item.author.name} uri={item.author.avatar} size={52} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                {item.author.isVerified ? (
                  <Icon name="check-decagram" size={16} color={COLORS.primary} />
                ) : null}
              </View>
              <Text style={styles.authorHeadline}>{item.author.headline || "Profissional"}</Text>
              <Text style={styles.authorTime}>{formatRelativeDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFollow(item.author.id)}>
            <Text style={styles.followText}>Seguir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.typeChip, isSale && styles.typeChipSale]}>
            <Text style={[styles.typeChipText, isSale && styles.typeChipTextSale]}>
              {isSale ? "Venda" : "Marketing"}
            </Text>
          </View>
          {isSale && item.productPrice ? (
            <Text style={styles.priceText}>{item.productPrice}</Text>
          ) : null}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.postImage} /> : null}

        {isSale && item.externalLink ? (
          <ClayButton
            title="Abrir link do produto"
            icon="open-in-new"
            style={{ marginTop: 14 }}
            onPress={() => Linking.openURL(item.externalLink)}
          />
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item._count?.likes || 0} curtidas</Text>
          <Text style={styles.metaText}>{item._count?.comments || 0} comentarios</Text>
          <Text style={styles.metaText}>{item.shareCount || 0} compartilhamentos</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.action} onPress={() => toggleLike(item.id)}>
            <Icon
              name={item.likedByCurrentUser ? "heart" : "heart-outline"}
              size={20}
              color={item.likedByCurrentUser ? COLORS.danger : COLORS.textSecondary}
            />
            <Text style={styles.actionText}>Curtir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
          >
            <Icon name="comment-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>Comentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={() => handleShare(item)}>
            <Icon name="share-variant-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </ClayCard>
    );
  };

  return (
    <ClayScreen>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPosts(tab);
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ClayCard style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Antera Chat</Text>
              <Text style={styles.heroTitle}>Rede profissional simples para crescer, vender e se conectar.</Text>
              <Text style={styles.heroSubtitle}>
                Publique conteudo de marketing pessoal, produtos e novas oportunidades em um so lugar.
              </Text>
              <View style={styles.heroActions}>
                <ClayButton title="Novo post" icon="plus" onPress={() => navigation.navigate("CreatePost")} style={{ flex: 1 }} />
                <ClayButton
                  title="Buscar pessoas"
                  variant="secondary"
                  icon="magnify"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate("Search")}
                />
              </View>
            </ClayCard>
            <SectionTitle
              title="Feed profissional"
              subtitle="Misture autoridade, networking e divulgacao de produtos."
            />
            <SegmentedTabs options={feedTabs} value={tab} onChange={setTab} />
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="Seu feed ainda esta vazio"
              subtitle="Crie uma publicacao de marketing ou venda para dar o tom da sua rede."
            />
          ) : null
        }
      />
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
  },
  heroCard: {
    marginTop: 10,
    marginBottom: 18,
  },
  heroEyebrow: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 10,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  postCard: {
    marginTop: 14,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  authorRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 16,
  },
  authorHeadline: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  authorTime: {
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  followText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  tagRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeChip: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeChipSale: {
    backgroundColor: "#EEF6D7",
  },
  typeChipText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  typeChipTextSale: {
    color: "#6A8E1B",
  },
  priceText: {
    color: COLORS.primaryDark,
    fontWeight: "900",
  },
  postTitle: {
    marginTop: 14,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  postContent: {
    marginTop: 10,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: SIZES.radiusMd,
    marginTop: 14,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
});
