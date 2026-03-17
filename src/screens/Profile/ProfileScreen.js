import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { profileAPI } from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_IMAGE_SIZE = (SCREEN_WIDTH - 3) / 3; // 3 colunas com 1px gap

const TAB_MEDIA = "media";
const TAB_TEXT = "text";
const TAB_FOLLOW = "follow";

// ─── Avatar placeholder ───────────────────────────────────────────────────────
const AvatarPlaceholder = ({ name, size = 80, style }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS.primary,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.35, fontWeight: "bold" }}>
        {initials}
      </Text>
    </View>
  );
};

// ─── Cartão de post em grid (mídia) ──────────────────────────────────────────
const GridPostCard = ({ item, onPress }) => {
  const isVideo = !!item.videoUrl;
  const mediaUrl = item.imageUrl || item.videoUrl;

  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      {mediaUrl ? (
        <Image source={{ uri: mediaUrl }} style={styles.gridImage} resizeMode="cover" />
      ) : (
        <View style={[styles.gridImage, styles.gridImagePlaceholder]}>
          <Icon name="image-off" size={28} color={COLORS.textLight} />
        </View>
      )}
      {isVideo && (
        <View style={styles.videoOverlay}>
          <Icon name="play-circle" size={28} color="#fff" />
        </View>
      )}
      <View style={styles.gridOverlay}>
        <View style={styles.gridStat}>
          <Icon name="heart" size={12} color="#fff" />
          <Text style={styles.gridStatText}>{item._count?.likes ?? 0}</Text>
        </View>
        <View style={styles.gridStat}>
          <Icon name="comment" size={12} color="#fff" />
          <Text style={styles.gridStatText}>{item._count?.comments ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Cartão de post textual ───────────────────────────────────────────────────
const TextPostCard = ({ item, onPress }) => {
  const date = new Date(item.createdAt);
  const formatted = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <TouchableOpacity style={styles.textPostCard} onPress={() => onPress(item)} activeOpacity={0.85}>
      <Text style={styles.textPostContent} numberOfLines={4}>
        {item.content}
      </Text>
      <View style={styles.textPostFooter}>
        <Text style={styles.textPostDate}>{formatted}</Text>
        <View style={styles.textPostStats}>
          <Icon name="heart-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.textPostStatText}>{item._count?.likes ?? 0}</Text>
          <Icon name="comment-outline" size={14} color={COLORS.textSecondary} style={{ marginLeft: 10 }} />
          <Text style={styles.textPostStatText}>{item._count?.comments ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Cartão de usuário na lista de seguidores/seguindo ────────────────────────
const UserCard = ({ item, currentUserId, navigation }) => (
  <TouchableOpacity
    style={styles.userCard}
    onPress={() => navigation.push("UserProfile", { userId: item.id })}
    activeOpacity={0.85}
  >
    {item.avatar ? (
      <Image source={{ uri: item.avatar }} style={styles.userCardAvatar} />
    ) : (
      <AvatarPlaceholder name={item.name} size={44} />
    )}
    <View style={styles.userCardInfo}>
      <View style={styles.userCardNameRow}>
        <Text style={styles.userCardName}>{item.name}</Text>
        {item.isVerified && (
          <Icon name="check-decagram" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
        )}
      </View>
      {item.headline ? (
        <Text style={styles.userCardHeadline} numberOfLines={1}>{item.headline}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProfileScreen({ navigation, route }) {
  const { user: authUser } = useAuth();

  // Se vier userId por parâmetro, exibe o perfil daquele usuário; caso contrário exibe o próprio
  const targetUserId = route?.params?.userId ?? authUser?.id;
  const isOwnProfile = targetUserId === authUser?.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followUsers, setFollowUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(TAB_MEDIA);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followListType, setFollowListType] = useState("followers"); // 'followers' | 'following'
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // ── Buscar perfil ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileAPI.getProfile(targetUserId);
      setProfile(res.data.data);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    }
  }, [targetUserId]);

  // ── Buscar posts ───────────────────────────────────────────────────────────
  const fetchPosts = useCallback(
    async (tab, page = 1, append = false) => {
      const type = tab === TAB_MEDIA ? "media" : "text";
      try {
        setPostsLoading(true);
        const res = await profileAPI.getUserPosts(targetUserId, { type, page, limit: 12 });
        const newPosts = res.data.data;
        const pagination = res.data.pagination;
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        setHasMorePosts(pagination.page < pagination.totalPages);
      } catch (e) {
        // silently fail
      } finally {
        setPostsLoading(false);
      }
    },
    [targetUserId]
  );

  // ── Buscar seguidores/seguindo ─────────────────────────────────────────────
  const fetchFollowList = useCallback(
    async (type) => {
      try {
        setPostsLoading(true);
        const fn = type === "followers" ? profileAPI.getFollowers : profileAPI.getFollowing;
        const res = await fn(targetUserId);
        setFollowUsers(res.data.data);
      } catch (e) {
        setFollowUsers([]);
      } finally {
        setPostsLoading(false);
      }
    },
    [targetUserId]
  );

  // ── Carregamento inicial ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    await fetchProfile();
    await fetchPosts(TAB_MEDIA, 1);
    setLoading(false);
  }, [fetchProfile, fetchPosts]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  // ── Troca de aba ───────────────────────────────────────────────────────────
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      setPostPage(1);
      setPosts([]);
      setFollowUsers([]);
      if (tab === TAB_MEDIA || tab === TAB_TEXT) {
        fetchPosts(tab, 1);
      } else {
        fetchFollowList(followListType);
      }
    },
    [fetchPosts, fetchFollowList, followListType]
  );

  // ── Paginação de posts ─────────────────────────────────────────────────────
  const loadMorePosts = () => {
    if (!postsLoading && hasMorePosts && activeTab !== TAB_FOLLOW) {
      const next = postPage + 1;
      setPostPage(next);
      fetchPosts(activeTab, next, true);
    }
  };

  // ── Refresh ────────────────────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    setPostPage(1);
    await fetchProfile();
    if (activeTab !== TAB_FOLLOW) {
      await fetchPosts(activeTab, 1);
    } else {
      await fetchFollowList(followListType);
    }
    setRefreshing(false);
  };

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await profileAPI.unfollow(targetUserId);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: (prev.followersCount || 0) - 1,
        }));
      } else {
        await profileAPI.follow(targetUserId);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1,
        }));
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível realizar a ação.");
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Navegar para post ──────────────────────────────────────────────────────
  const handlePostPress = (post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  // ── Trocar tipo de lista de seguidores ─────────────────────────────────────
  const handleFollowListTypeChange = (type) => {
    setFollowListType(type);
    fetchFollowList(type);
  };

  // ─────────────────────── Renderização ─────────────────────────────────────
  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const postsCount = profile?._count?.posts ?? 0;
  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;

  // ─── Header do perfil ─────────────────────────────────────────────────────
  const ProfileHeader = () => (
    <View>
      {/* Cover image */}
      <View style={styles.coverContainer}>
        {profile?.coverImage ? (
          <Image source={{ uri: profile.coverImage }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>

      {/* Avatar + botões de ação */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <AvatarPlaceholder name={profile?.name} size={86} style={styles.avatar} />
          )}
        </View>

        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Text style={styles.outlineBtnText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlineBtn, { marginLeft: 8 }]}
                onPress={() => {}}
              >
                <Text style={styles.outlineBtnText}>Compartilhar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, profile?.isFollowing && styles.primaryBtnOutline]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={profile?.isFollowing ? COLORS.primary : "#fff"} />
              ) : (
                <Text style={[styles.primaryBtnText, profile?.isFollowing && styles.primaryBtnTextOutline]}>
                  {profile?.isFollowing ? "Seguindo" : "Seguir"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info do perfil */}
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{profile?.name}</Text>
          {profile?.isVerified && (
            <Icon name="check-decagram" size={18} color={COLORS.primary} style={{ marginLeft: 6 }} />
          )}
        </View>
        {profile?.headline ? (
          <Text style={styles.profileHeadline}>{profile.headline}</Text>
        ) : null}
        {profile?.bio ? (
          <Text style={styles.profileBio}>{profile.bio}</Text>
        ) : null}
        {profile?.location ? (
          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        ) : null}
        {profile?.website ? (
          <View style={styles.locationRow}>
            <Icon name="link-variant" size={14} color={COLORS.primary} />
            <Text style={[styles.locationText, { color: COLORS.primary }]}>{profile.website}</Text>
          </View>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statValue}>{postsCount}</Text>
          <Text style={styles.statLabel}>publicações</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setActiveTab(TAB_FOLLOW);
            handleFollowListTypeChange("followers");
          }}
        >
          <Text style={styles.statValue}>{followersCount.toLocaleString("pt-BR")}</Text>
          <Text style={styles.statLabel}>seguidores</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setActiveTab(TAB_FOLLOW);
            handleFollowListTypeChange("following");
          }}
        >
          <Text style={styles.statValue}>{followingCount.toLocaleString("pt-BR")}</Text>
          <Text style={styles.statLabel}>seguindo</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === TAB_MEDIA && styles.tabItemActive]}
          onPress={() => handleTabChange(TAB_MEDIA)}
        >
          <Icon
            name="grid"
            size={22}
            color={activeTab === TAB_MEDIA ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === TAB_TEXT && styles.tabItemActive]}
          onPress={() => handleTabChange(TAB_TEXT)}
        >
          <Icon
            name="text"
            size={22}
            color={activeTab === TAB_TEXT ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === TAB_FOLLOW && styles.tabItemActive]}
          onPress={() => handleTabChange(TAB_FOLLOW)}
        >
          <Icon
            name="account-group-outline"
            size={22}
            color={activeTab === TAB_FOLLOW ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Sub-abas para lista de seguidores/seguindo */}
      {activeTab === TAB_FOLLOW && (
        <View style={styles.subTabBar}>
          <TouchableOpacity
            style={[styles.subTabItem, followListType === "followers" && styles.subTabItemActive]}
            onPress={() => handleFollowListTypeChange("followers")}
          >
            <Text style={[styles.subTabText, followListType === "followers" && styles.subTabTextActive]}>
              Seguidores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabItem, followListType === "following" && styles.subTabItemActive]}
            onPress={() => handleFollowListTypeChange("following")}
          >
            <Text style={[styles.subTabText, followListType === "following" && styles.subTabTextActive]}>
              Seguindo
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ─── Conteúdo da aba ──────────────────────────────────────────────────────
  if (activeTab === TAB_MEDIA) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <FlatList
          key="grid"
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          ListHeaderComponent={<ProfileHeader />}
          renderItem={({ item }) => (
            <GridPostCard item={item} onPress={handlePostPress} />
          )}
          ListEmptyComponent={
            !postsLoading ? (
              <View style={styles.emptyState}>
                <Icon name="image-off-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Nenhuma publicação com foto ou vídeo</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            postsLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          columnWrapperStyle={{ gap: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
    );
  }

  if (activeTab === TAB_TEXT) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <FlatList
          key="text"
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={<ProfileHeader />}
          renderItem={({ item }) => (
            <TextPostCard item={item} onPress={handlePostPress} />
          )}
          ListEmptyComponent={
            !postsLoading ? (
              <View style={styles.emptyState}>
                <Icon name="text-box-remove-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Nenhuma publicação de texto</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            postsLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
    );
  }

  // TAB_FOLLOW
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        key="follow"
        data={followUsers}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<ProfileHeader />}
        renderItem={({ item }) => (
          <UserCard item={item} currentUserId={authUser?.id} navigation={navigation} />
        )}
        ListEmptyComponent={
          !postsLoading ? (
            <View style={styles.emptyState}>
              <Icon name="account-off-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {followListType === "followers" ? "Nenhum seguidor ainda" : "Não segue ninguém ainda"}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          postsLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  // Cover & Avatar
  coverContainer: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.backgroundGray,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryLight + "55",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -44,
    marginBottom: 8,
  },
  avatarWrapper: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.background,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },

  // Botões de ação
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  outlineBtn: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  outlineBtnText: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  primaryBtn: {
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: "center",
  },
  primaryBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  primaryBtnText: {
    fontSize: SIZES.small,
    fontWeight: "700",
    color: "#fff",
  },
  primaryBtnTextOutline: {
    color: COLORS.primary,
  },

  // Info do perfil
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  profileName: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  profileHeadline: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  profileBio: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 0,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },

  // Sub tab bar (seguidores / seguindo)
  subTabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundGray,
  },
  subTabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  subTabItemActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  subTabText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  subTabTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Grid
  gridItem: {
    width: GRID_IMAGE_SIZE,
    height: GRID_IMAGE_SIZE,
    margin: 0.5,
    position: "relative",
    backgroundColor: COLORS.backgroundGray,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  videoOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  gridOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  gridStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  gridStatText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },

  // Text post card
  textPostCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    padding: 14,
  },
  textPostContent: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  textPostFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textPostDate: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
  },
  textPostStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  textPostStatText: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
  },

  // User card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCardName: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  userCardHeadline: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
