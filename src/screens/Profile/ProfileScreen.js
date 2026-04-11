import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  AvatarBadge,
  ClayButton,
  ClayCard,
  ClayScreen,
  EmptyState,
  SegmentedTabs,
  StatPill,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { messagesAPI, profileAPI } from "../../services/api";
import { formatFollowers } from "../../utils/formatters";

const tabs = [
  { label: "Marketing", value: "marketing" },
  { label: "Vendas", value: "sale" },
];

export default function ProfileScreen({ navigation, route }) {
  const { user } = useAuth();
  const targetUserId = route.params?.userId || user?.id;
  const ownProfile = targetUserId === user?.id;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("marketing");
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const [profileResponse, postsResponse] = await Promise.all([
      profileAPI.getProfile(targetUserId),
      profileAPI.getUserPosts(targetUserId, { type: tab }),
    ]);

    setProfile(profileResponse.data.data);
    setPosts(postsResponse.data.data || []);
    setRefreshing(false);
  }, [tab, targetUserId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const toggleFollow = async () => {
    if (profile?.isFollowing) {
      await profileAPI.unfollow(targetUserId);
    } else {
      await profileAPI.follow(targetUserId);
    }
    loadProfile();
  };

  const openChat = async () => {
    const response = await messagesAPI.getOrCreateConversation(targetUserId);
    navigation.navigate("Conversation", {
      conversationId: response.data.data.id,
      otherUser: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        headline: profile.headline,
      },
    });
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("PostDetail", { postId: item.id })}>
      <ClayCard style={{ marginTop: 14 }}>
        <Text style={styles.postType}>{item.type === "sale" ? "Venda" : "Marketing"}</Text>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.postImage} /> : null}
      </ClayCard>
    </TouchableOpacity>
  );

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
              loadProfile();
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          profile ? (
            <>
              <ClayCard>
                {profile.coverImage ? (
                  <Image source={{ uri: profile.coverImage }} style={styles.cover} />
                ) : (
                  <View style={styles.coverPlaceholder} />
                )}
                <View style={styles.profileTop}>
                  <AvatarBadge name={profile.name} uri={profile.avatar} size={84} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.headline}>{profile.headline || "Profissional no Antera Chat"}</Text>
                    <Text style={styles.bio}>{profile.bio || "Construa sua narrativa profissional e comercial."}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  {ownProfile ? (
                    <>
                      <ClayButton
                        title="Editar perfil"
                        icon="pencil-outline"
                        style={{ flex: 1 }}
                        onPress={() => navigation.navigate("EditProfile")}
                      />
                      <ClayButton
                        title="Minha rede"
                        variant="secondary"
                        icon="account-group-outline"
                        style={{ flex: 1 }}
                        onPress={() => navigation.navigate("Connections")}
                      />
                    </>
                  ) : (
                    <>
                      <ClayButton
                        title={profile.isFollowing ? "Seguindo" : "Seguir"}
                        icon="account-plus-outline"
                        style={{ flex: 1 }}
                        onPress={toggleFollow}
                      />
                      <ClayButton
                        title="Mensagem"
                        variant="secondary"
                        icon="message-outline"
                        style={{ flex: 1 }}
                        onPress={openChat}
                      />
                    </>
                  )}
                </View>
              </ClayCard>

              <View style={styles.statsRow}>
                <StatPill label="Seguidores" value={formatFollowers(profile.followersCount)} icon="account-multiple-outline" />
                <StatPill label="Seguindo" value={formatFollowers(profile.followingCount)} icon="account-arrow-right-outline" />
                <StatPill label="Posts" value={profile._count?.posts || 0} icon="post-outline" />
              </View>

              <SegmentedTabs options={tabs} value={tab} onChange={setTab} style={{ marginTop: 8 }} />
            </>
          ) : null
        }
        ListEmptyComponent={
          profile ? (
            <EmptyState
              icon="post-outline"
              title="Nenhum conteudo nesta aba"
              subtitle="Crie publicacoes de marketing e venda para separar sua vitrine profissional."
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
    paddingBottom: 110,
  },
  cover: {
    width: "100%",
    height: 130,
    borderRadius: 24,
  },
  coverPlaceholder: {
    height: 130,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
  },
  profileTop: {
    flexDirection: "row",
    marginTop: 16,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  headline: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    marginTop: 6,
  },
  bio: {
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },
  postType: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  postTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 10,
  },
  postContent: {
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    marginTop: 12,
  },
});
