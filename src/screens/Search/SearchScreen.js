import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AvatarBadge, ClayButton, ClayCard, ClayInput, ClayScreen, EmptyState } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { profileAPI } from "../../services/api";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    const response = await profileAPI.searchUsers(query.trim());
    setResults(response.data.data || []);
  };

  return (
    <ClayScreen>
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Encontre profissionais e creators</Text>
            <Text style={styles.subtitle}>
              Busque por nome, bio, headline ou especialidade para ampliar sua rede.
            </Text>
            <ClayCard style={{ marginTop: 18 }}>
              <ClayInput
                label="Buscar"
                value={query}
                onChangeText={setQuery}
                placeholder="Ex: marketing, design, vendas..."
              />
              <ClayButton title="Pesquisar" icon="magnify" onPress={search} />
            </ClayCard>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("UserProfile", { userId: item.id })}>
            <ClayCard style={{ marginTop: 14 }}>
              <View style={styles.row}>
                <AvatarBadge name={item.name} uri={item.avatar} size={54} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.headline}>{item.headline || "Profissional no Antera Chat"}</Text>
                  <Text style={styles.bio} numberOfLines={2}>
                    {item.bio || item.location || "Clique para ver o perfil completo."}
                  </Text>
                </View>
              </View>
            </ClayCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query ? (
            <EmptyState
              icon="account-search-outline"
              title="Nenhum perfil encontrado"
              subtitle="Tente outro termo ou procure por uma habilidade mais ampla."
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
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 17,
  },
  headline: {
    color: COLORS.primaryDark,
    marginTop: 4,
    fontWeight: "700",
  },
  bio: {
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
});
