import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { messagesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

function formatMsgTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ uri, name, size = 36 }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  const initials = (name || "?")
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
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{ color: "#fff", fontWeight: "bold", fontSize: size * 0.38 }}
      >
        {initials}
      </Text>
    </View>
  );
}

export default function ConversationScreen({ navigation, route }) {
  const { user } = useAuth();
  const {
    conversationId,
    userName,
    userId: otherUserId,
    userAvatar,
    userHeadline,
  } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [convId, setConvId] = useState(conversationId || null);

  const flatListRef = useRef(null);
  const pollingRef = useRef(null);
  const lastCountRef = useRef(0);

  // Buscar ou criar conversa se não tiver conversationId
  const ensureConversation = useCallback(async () => {
    if (convId) return convId;
    if (!otherUserId) return null;
    try {
      const res = await messagesAPI.getOrCreateConversation(otherUserId);
      if (res.data.success) {
        const id = res.data.data.id;
        setConvId(id);
        return id;
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a conversa.");
    }
    return null;
  }, [convId, otherUserId]);

  const loadMessages = useCallback(
    async (silent = false) => {
      const id = await ensureConversation();
      if (!id) return;

      if (!silent) setLoading(true);
      try {
        const res = await messagesAPI.getMessages(id, { page: 1, limit: 50 });
        if (res.data.success) {
          const msgs = res.data.data;
          setMessages(msgs);
          if (msgs.length !== lastCountRef.current) {
            lastCountRef.current = msgs.length;
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: !silent }),
              100,
            );
          }
        }
      } catch (error) {
        // silencioso
      } finally {
        setLoading(false);
      }
    },
    [ensureConversation],
  );

  useEffect(() => {
    loadMessages();
    pollingRef.current = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(pollingRef.current);
  }, [loadMessages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const id = await ensureConversation();
    if (!id) return;

    setSending(true);
    setText("");
    try {
      const res = await messagesAPI.sendMessage(id, {
        content: trimmed,
        receiverId: otherUserId,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    } catch (error) {
      setText(trimmed);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === user?.id;
    const showTime =
      index === messages.length - 1 ||
      new Date(messages[index + 1]?.createdAt) - new Date(item.createdAt) >
        60000;

    return (
      <View
        style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
      >
        {!isMe && <Avatar uri={userAvatar} name={userName} size={30} />}
        <View style={styles.msgColumn}>
          <View
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
          >
            <Text
              style={[
                styles.bubbleText,
                isMe ? styles.bubbleTextMe : styles.bubbleTextOther,
              ]}
            >
              {item.content}
            </Text>
          </View>
          {showTime && (
            <Text
              style={[
                styles.msgTime,
                isMe ? styles.msgTimeRight : styles.msgTimeLeft,
              ]}
            >
              {formatMsgTime(item.createdAt)}
              {isMe && (
                <Text style={styles.readMark}>
                  {item.isRead ? "  ✓✓" : "  ✓"}
                </Text>
              )}
            </Text>
          )}
        </View>
        {isMe && <View style={{ width: 30 }} />}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-processing-outline" size={64} color={COLORS.border} />
      <Text style={styles.emptyText}>
        Diga olá para {userName || "esta pessoa"}!
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Avatar uri={userAvatar} name={userName} size={38} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {userName || "Usuário"}
          </Text>
          {userHeadline ? (
            <Text style={styles.headerHeadline} numberOfLines={1}>
              {userHeadline}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserProfile", { userId: otherUserId })
          }
          style={styles.profileBtn}
        >
          <Icon
            name="account-circle-outline"
            size={24}
            color={COLORS.textWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.messageListEmpty,
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={COLORS.textLight}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!text.trim() || sending) && styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: SIZES.paddingSmall,
    ...SHADOWS.medium,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: SIZES.body2,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
  headerHeadline: {
    fontSize: SIZES.tiny,
    color: "rgba(255,255,255,0.8)",
  },
  profileBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    paddingVertical: 12,
    paddingHorizontal: SIZES.paddingSmall,
  },
  messageListEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  msgRowRight: {
    justifyContent: "flex-end",
  },
  msgRowLeft: {
    justifyContent: "flex-start",
  },
  msgColumn: {
    maxWidth: "72%",
    marginHorizontal: 6,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 4,
    ...SHADOWS.small,
  },
  bubbleText: {
    fontSize: SIZES.body3,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: COLORS.textWhite,
  },
  bubbleTextOther: {
    color: COLORS.textPrimary,
  },
  msgTime: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
    marginHorizontal: 4,
  },
  msgTimeRight: {
    textAlign: "right",
  },
  msgTimeLeft: {
    textAlign: "left",
  },
  readMark: {
    color: COLORS.primaryLight,
    fontSize: 10,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.paddingSmall,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    ...SHADOWS.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
});
