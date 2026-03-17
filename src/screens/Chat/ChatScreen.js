import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { messagesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function Avatar({ user, size = 50 }) {
  if (user?.avatar) {
    return (
      <Image
        source={{ uri: user.avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  const initials = (user?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{ color: "#fff", fontWeight: "bold", fontSize: size * 0.36 }}
      >
        {initials}
      </Text>
    </View>
  );
}

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await messagesAPI.getConversations();
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (error) {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      pollingRef.current = setInterval(() => loadConversations(true), 15000);
      return () => clearInterval(pollingRef.current);
    }, [loadConversations]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const openConversation = (conv) => {
    navigation.navigate("Conversation", {
      conversationId: conv.id,
      userName: conv.otherUser?.name,
      userId: conv.otherUser?.id,
      userAvatar: conv.otherUser?.avatar,
      userHeadline: conv.otherUser?.headline,
    });
  };

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0,
  );

  const renderConversation = ({ item }) => {
    const other = item.otherUser;
    const lastMsg = item.messages?.[0];
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.convItem, isUnread && styles.convItemUnread]}
        onPress={() => openConversation(item)}
        activeOpacity={0.7}
      >
        <Avatar user={other} size={52} />
        <View style={styles.convContent}>
          <View style={styles.convHeader}>
            <Text
              style={[styles.convName, isUnread && styles.convNameBold]}
              numberOfLines={1}
            >
              {other?.name || "Usuário"}
            </Text>
            <Text style={styles.convTime}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <View style={styles.convFooter}>
            <Text
              style={[styles.convLastMsg, isUnread && styles.convLastMsgBold]}
              numberOfLines={1}
            >
              {lastMsg ? lastMsg.content : "Inicie uma conversa"}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-outline" size={72} color={COLORS.border} />
      <Text style={styles.emptyTitle}>Sem conversas ainda</Text>
      <Text style={styles.emptySubtitle}>
        Visite o perfil de alguém e inicie uma mensagem
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {totalUnread > 99 ? "99+" : totalUnread}
            </Text>
          </View>
        )}
      </View>

      {loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderConversation}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={
            conversations.length === 0 && styles.flatListEmpty
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: SIZES.padding,
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textWhite,
    flex: 1,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  convItemUnread: {
    backgroundColor: "#F0FDF4",
  },
  convContent: {
    flex: 1,
    marginLeft: 12,
  },
  convHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  convName: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  convNameBold: {
    fontWeight: "bold",
  },
  convTime: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
  },
  convFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convLastMsg: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  convLastMsgBold: {
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 78,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.paddingLarge,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  flatListEmpty: {
    flexGrow: 1,
  },
});
