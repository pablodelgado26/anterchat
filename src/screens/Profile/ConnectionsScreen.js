import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { AvatarBadge, ClayCard, ClayScreen, EmptyState } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { profileAPI } from "../../services/api";

export default function ConnectionsScreen() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [followersResponse, followingResponse] = await Promise.all([
        profileAPI.getFollowers(user.id),
        profileAPI.getFollowing(user.id),
      ]);
      setFollowers(followersResponse.data.data || []);
      setFollowing(followingResponse.data.data || []);
    };
    load();
  }, [user.id]);

  const combined = [
    ...followers.map((item) => ({ ...item, group: "Segue voce" })),
    ...following.map((item) => ({ ...item, group: "Voce segue" })),
  ];

  return (
    <ClayScreen>
      <FlatList
        data={combined}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.title}>Sua rede profissional</Text>
            <Text style={styles.subtitle}>
              Visualize quem esta acompanhando seu trabalho e quem voce esta acompanhando.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ClayCard style={{ marginTop: 14 }}>
            <View style={styles.row}>
              <AvatarBadge name={item.name} uri={item.avatar} size={52} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.headline}>{item.headline || item.group}</Text>
                <Text style={styles.group}>{item.group}</Text>
              </View>
            </View>
          </ClayCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="account-group-outline"
            title="Sua rede ainda esta pequena"
            subtitle="Use a busca para encontrar pessoas e comece a construir relacoes profissionais."
          />
        }
      />
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
    marginTop: 10,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 16,
  },
  headline: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  group: {
    color: COLORS.primaryDark,
    marginTop: 8,
    fontWeight: "700",
  },
});
