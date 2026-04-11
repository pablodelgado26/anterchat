import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AvatarBadge, ClayCard, ClayScreen, EmptyState } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { messagesAPI } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";

export default function ChatScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.data || []);
    } catch {
      setConversations([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, []),
  );

  return (
    <ClayScreen>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadConversations();
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.title}>Mensagens diretas</Text>
            <Text style={styles.subtitle}>
              Conduza networking, negociacoes e follow-ups sem sair do app.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const preview = item.messages?.[0]?.content || "Conversa iniciada";
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Conversation", {
                  conversationId: item.id,
                  otherUser: item.otherUser,
                })
              }
            >
              <ClayCard style={{ marginTop: 14 }}>
                <View style={styles.row}>
                  <AvatarBadge
                    name={item.otherUser?.name}
                    uri={item.otherUser?.avatar}
                    size={52}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{item.otherUser?.name}</Text>
                    <Text style={styles.headline}>{item.otherUser?.headline}</Text>
                    <Text style={styles.preview} numberOfLines={1}>
                      {preview}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.time}>
                      {item.lastMessageAt ? formatRelativeDate(item.lastMessageAt) : "nova"}
                    </Text>
                    {item.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </ClayCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="message-outline"
            title="Nenhuma conversa por aqui"
            subtitle="Comece uma conversa a partir de um perfil para ativar o chat."
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
    fontWeight: "800",
    fontSize: 16,
  },
  headline: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  preview: {
    color: COLORS.textMuted,
    marginTop: 8,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  unreadBadge: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: COLORS.textWhite,
    fontWeight: "900",
  },
});
