import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { AvatarBadge, ClayButton, ClayInput, ClayScreen } from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { messagesAPI } from "../../services/api";

export default function ConversationScreen({ navigation, route }) {
  const { conversationId, otherUser } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const loadMessages = async () => {
    const response = await messagesAPI.getMessages(conversationId);
    setMessages(response.data.data || []);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const send = async () => {
    if (!message.trim()) return;
    await messagesAPI.sendMessage(conversationId, {
      content: message,
      receiverId: otherUser.id,
    });
    setMessage("");
    loadMessages();
  };

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AvatarBadge name={otherUser?.name} uri={otherUser?.avatar} size={46} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{otherUser?.name}</Text>
          <Text style={styles.headline}>{otherUser?.headline}</Text>
        </View>
      </View>
    ),
    [navigation, otherUser],
  );

  return (
    <ClayScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {header}
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.messageText, mine && { color: COLORS.textWhite }]}>
                  {item.content}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.footer}>
          <ClayInput
            style={{ flex: 1, marginBottom: 0 }}
            inputStyle={{ minHeight: 52 }}
            value={message}
            onChangeText={setMessage}
            placeholder="Escreva sua mensagem"
          />
          <ClayButton title="Enviar" icon="send" onPress={send} style={{ width: 110 }} />
        </View>
      </KeyboardAvoidingView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 12,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 16,
  },
  headline: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 18,
    gap: 12,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    maxWidth: "82%",
    marginBottom: 10,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
  },
  bubbleOther: {
    backgroundColor: COLORS.surfaceStrong,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    padding: 18,
    paddingTop: 8,
  },
});
