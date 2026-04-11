import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AvatarBadge, ClayCard, ClayScreen, EmptyState } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { notificationsAPI } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await notificationsAPI.markAllAsRead();
    loadNotifications();
  };

  return (
    <ClayScreen>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Alertas</Text>
                <Text style={styles.subtitle}>Curtidas, comentarios, seguidores, mensagens e vagas.</Text>
              </View>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.action}>Marcar tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ClayCard style={{ marginTop: 14, opacity: item.isRead ? 0.75 : 1 }}>
            <View style={styles.row}>
              <AvatarBadge name={item.sender?.name} uri={item.sender?.avatar} size={50} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody}>
                  {item.sender?.name} {item.body || "gerou uma nova atualizacao para voce"}
                </Text>
                <Text style={styles.time}>{formatRelativeDate(item.createdAt)}</Text>
              </View>
            </View>
          </ClayCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bell-outline"
            title="Sem novidades no momento"
            subtitle="Quando alguem interagir com voce, os alertas aparecem aqui."
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
    maxWidth: 260,
  },
  action: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
  },
  notificationTitle: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 16,
  },
  notificationBody: {
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  time: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 12,
  },
});
