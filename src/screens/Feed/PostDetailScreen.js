import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  AvatarBadge,
  ClayButton,
  ClayCard,
  ClayInput,
  ClayScreen,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { postsAPI } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";

export default function PostDetailScreen({ route }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPost = async () => {
    try {
      const response = await postsAPI.getById(postId);
      setPost(response.data.data);
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel carregar a publicacao.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, []);

  const submitComment = async () => {
    if (!comment.trim()) return;
    await postsAPI.addComment(postId, comment);
    setComment("");
    loadPost();
  };

  if (!post) {
    return <ClayScreen />;
  }

  return (
    <ClayScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ClayCard>
          <View style={styles.header}>
            <AvatarBadge name={post.author.name} uri={post.author.avatar} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorHeadline}>{post.author.headline}</Text>
              <Text style={styles.authorTime}>{formatRelativeDate(post.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.content}</Text>

          {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}

          {post.externalLink ? (
            <ClayButton
              title="Abrir oferta externa"
              icon="open-in-new"
              style={{ marginTop: 16 }}
              onPress={() => Linking.openURL(post.externalLink)}
            />
          ) : null}

          <View style={styles.statRow}>
            <Text style={styles.stat}>{post._count?.likes || 0} curtidas</Text>
            <Text style={styles.stat}>{post._count?.comments || 0} comentarios</Text>
            <Text style={styles.stat}>{post.shareCount || 0} compartilhamentos</Text>
          </View>
        </ClayCard>

        <ClayCard style={{ marginTop: 16 }}>
          <Text style={styles.commentTitle}>Entrar na conversa</Text>
          <ClayInput
            label="Seu comentario"
            multiline
            value={comment}
            onChangeText={setComment}
          />
          <ClayButton title="Comentar" icon="send-outline" onPress={submitComment} />
        </ClayCard>

        <View style={{ marginTop: 18 }}>
          {post.comments?.length ? (
            post.comments.map((item) => (
              <ClayCard key={item.id} style={{ marginBottom: 12 }}>
                <View style={styles.commentHeader}>
                  <AvatarBadge name={item.author.name} uri={item.author.avatar} size={42} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.commentName}>{item.author.name}</Text>
                    <Text style={styles.commentTime}>{formatRelativeDate(item.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.commentBody}>{item.content}</Text>
              </ClayCard>
            ))
          ) : (
            <Text style={styles.emptyText}>Ainda nao ha comentarios nesta publicacao.</Text>
          )}
        </View>
      </ScrollView>
    </ClayScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 16,
  },
  authorHeadline: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  authorTime: {
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  title: {
    marginTop: 18,
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  description: {
    marginTop: 12,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginTop: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  stat: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  commentTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentName: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  commentTime: {
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  commentBody: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
});
