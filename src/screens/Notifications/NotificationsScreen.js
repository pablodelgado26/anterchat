import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { notificationsAPI, messagesAPI } from "../../services/api";

// ─── Helpers ────────────────────────────────────────────────
function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function Avatar({ user, size = 46 }) {
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
        style={{ color: "#fff", fontWeight: "bold", fontSize: size * 0.34 }}
      >
        {initials}
      </Text>
    </View>
  );
}

const NOTIF_CONFIG = {
  follow: {
    icon: "account-plus",
    color: COLORS.primary,
    label: (n) => `começou a te seguir`,
  },
  like: {
    icon: "heart",
    color: COLORS.like,
    label: (n) => `curtiu seu post`,
  },
  comment: {
    icon: "comment-text",
    color: COLORS.info,
    label: (n) =>
      n.body ? `comentou no seu post: "${n.body}"` : `comentou no seu post`,
  },
  message: {
    icon: "message-text",
    color: "#8B5CF6",
    label: (n) =>
      n.body ? `enviou uma mensagem: "${n.body}"` : `enviou uma mensagem`,
  },
};

// ─── Main Screen ─────────────────────────────────────────────
export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef(null);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ page: 1, limit: 30 });
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
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
      loadNotifications();
      pollingRef.current = setInterval(() => loadNotifications(true), 20000);
      return () => clearInterval(pollingRef.current);
    }, [loadNotifications]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível marcar as notificações.");
    }
  };

  const handleNotifPress = async (item) => {
    // Marcar como lida
    if (!item.isRead) {
      notificationsAPI.markAsRead(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    // Navegar conforme tipo
    switch (item.type) {
      case "follow":
        navigation.navigate("UserProfile", { userId: item.senderId });
        break;
      case "like":
      case "comment":
        if (item.postId) {
          navigation.navigate("PostDetail", { postId: item.postId });
        }
        break;
      case "message":
        try {
          const res = await messagesAPI.getOrCreateConversation(item.senderId);
          if (res.data.success) {
            const conv = res.data.data;
            navigation.navigate("Conversation", {
              conversationId: conv.id,
              userName: item.sender?.name,
              userId: item.senderId,
              userAvatar: item.sender?.avatar,
              userHeadline: item.sender?.headline,
            });
          }
        } catch (error) {
          // silencioso
        }
        break;
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Remover notificação", "Deseja remover esta notificação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await notificationsAPI.delete(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover.");
          }
        },
      },
    ]);
  };

  const renderNotification = ({ item }) => {
    const config = NOTIF_CONFIG[item.type] || NOTIF_CONFIG.follow;
    const senderName = item.sender?.name || "Alguém";

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
        onPress={() => handleNotifPress(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.75}
      >
        {/* Avatar + badge ícone */}
        <View style={styles.avatarWrapper}>
          <Avatar user={item.sender} size={48} />
          <View style={[styles.typeBadge, { backgroundColor: config.color }]}>
            <Icon name={config.icon} size={13} color="#fff" />
          </View>
        </View>

        {/* Conteúdo */}
        <View style={styles.notifContent}>
          <Text style={styles.notifText} numberOfLines={3}>
            <Text style={styles.notifSender}>{senderName} </Text>
            {config.label(item)}
          </Text>
          <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
        </View>

        {/* Bolinha de não lido */}
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bell-outline" size={72} color={COLORS.border} />
      <Text style={styles.emptyTitle}>Sem notificações</Text>
      <Text style={styles.emptySubtitle}>
        Quando alguém curtir, comentar ou te seguir, você verá aqui
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={
            notifications.length === 0 && styles.flatListEmpty
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
    marginRight: 8,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  markAllText: {
    color: COLORS.textWhite,
    fontSize: SIZES.tiny,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  notifItemUnread: {
    backgroundColor: "#F0FDF4",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notifSender: {
    fontWeight: "bold",
  },
  notifTime: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SIZES.padding,
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
