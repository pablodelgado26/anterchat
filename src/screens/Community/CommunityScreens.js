import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  AvatarBadge,
  ClayButton,
  ClayCard,
  ClayInput,
  ClayScreen,
  EmptyState,
  SegmentedTabs,
  SectionTitle,
} from "../../components/ui";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

const jobFilters = [
  { label: "Todas", value: "Todas" },
  { label: "Remoto", value: "Remoto" },
  { label: "Presencial", value: "Presencial" },
  { label: "Salvas", value: "Salvas" },
];
const profileTabs = [
  { label: "Vagas", value: "jobs" },
  { label: "Produtos", value: "products" },
  { label: "Publicações", value: "posts" },
];
const formatPrice = value =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const since = value => {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  if (mins < 1440) return `há ${Math.floor(mins / 60)} h`;
  return `há ${Math.floor(mins / 1440)} d`;
};
const personName = user => user?.name || "Pessoa da comunidade";
const Badge = ({ vip }) => vip ? <Text style={styles.vipBadge}>⭐ VIP</Text> : null;
const PageHeading = ({ title, subtitle, action, onAction }) => (
  <View style={styles.heading}>
    <View style={{ flex: 1 }}>
      <Text style={styles.headingTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headingSubtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <TouchableOpacity onPress={onAction} style={styles.headingAction}><Text style={styles.headingActionText}>＋ {action}</Text></TouchableOpacity> : null}
  </View>
);

function PostCard({ post, navigation }) {
  const { user, userById, hasVip, toggleLike, addComment, getOrCreateConversation } = useAuth();
  const author = userById(post.ownerId);
  const [comment, setComment] = useState("");
  const liked = post.likes.includes(user.id);
  const sendComment = async () => {
    if (!comment.trim()) return;
    await addComment(post.id, comment);
    setComment("");
    Alert.alert("Comentário publicado", "Sua resposta já está na conversa.");
  };
  const chat = async () => {
    try {
      const conversation = await getOrCreateConversation(author.id);
      navigation.navigate("CommunityConversation", { conversationId: conversation.id, otherUser: author });
    } catch (error) {
      Alert.alert("Não foi possível abrir o chat", error.message);
    }
  };
  return (
    <ClayCard style={[styles.postCard, hasVip(author) && styles.vipCard]}>
      <View style={styles.authorRow}>
        <AvatarBadge name={personName(author)} uri={author?.avatar} size={46} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameLine}><Text style={styles.authorName}>{personName(author)}</Text><Badge vip={hasVip(author)} /></View>
          <Text style={styles.meta}>{author?.headline || author?.type} · {since(post.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{post.content || post.text}</Text>
      <View style={styles.postStats}>
        <Text style={styles.meta}>{post.likes.length} curtidas</Text>
        <Text style={styles.meta}>{post.comments.length} comentários</Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(post.id)}><Icon name={liked ? "heart" : "heart-outline"} size={19} color={liked ? COLORS.danger : COLORS.textSecondary} /><Text style={styles.actionText}>{liked ? "Curtido" : "Curtir"}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Comentar", "Escreva sua resposta no campo abaixo.")}><Icon name="comment-outline" size={19} color={COLORS.textSecondary} /><Text style={styles.actionText}>Comentar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={chat}><Icon name="message-outline" size={19} color={COLORS.textSecondary} /><Text style={styles.actionText}>Mensagem</Text></TouchableOpacity>
      </View>
      {post.comments.map(item => (
        <View key={item.id} style={styles.commentBubble}>
          <Text style={styles.commentName}>{personName(userById(item.userId))}</Text>
          <Text style={styles.commentText}>{item.content || item.text}</Text>
        </View>
      ))}
      <View style={styles.commentInputRow}>
        <TextInput value={comment} onChangeText={setComment} placeholder="Escreva um comentário..." placeholderTextColor={COLORS.textMuted} style={styles.commentInput} maxLength={500} returnKeyType="send" onSubmitEditing={sendComment} />
        <TouchableOpacity onPress={sendComment} style={styles.sendComment}><Icon name="send" size={17} color={COLORS.textWhite} /></TouchableOpacity>
      </View>
    </ClayCard>
  );
}

function JobCard({ job, navigation, compact = false }) {
  const { user, userById, hasVip, saveJob, applyJob, getOrCreateConversation } = useAuth();
  const owner = userById(job.ownerId);
  const own = owner?.id === user.id;
  const [showApplicants, setShowApplicants] = useState(false);
  const saved = (job.savedBy || []).includes(user.id);
  const applied = (job.applications || []).some(item => item.userId === user.id);
  const chat = async () => {
    try {
      const conversation = await getOrCreateConversation(owner.id);
      navigation.navigate("CommunityConversation", { conversationId: conversation.id, otherUser: owner });
    } catch (error) { Alert.alert("Não foi possível abrir o chat", error.message); }
  };
  const apply = async () => {
    const result = await applyJob(job.id);
    Alert.alert(result.success ? "Candidatura enviada" : "Atenção", result.success
      ? result.priority ? "Sua candidatura prioritária ⭐ foi enviada." : "Sua candidatura foi enviada com sucesso."
      : result.error);
  };
  const openApplicants = () => {
    const applicants = (job.applications || []).slice().sort((a, b) => Number(b.priority) - Number(a.priority));
    if (!applicants.length) return Alert.alert("Candidaturas recebidas", "Ainda não há candidaturas para esta vaga.");
    setShowApplicants(true);
  };
  return (
    <ClayCard style={[styles.jobCard, hasVip(owner) && styles.vipCard]}>
      <View style={styles.jobHeader}>
        <View style={styles.companyMark}><Icon name="briefcase-outline" color={COLORS.primary} size={23} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.meta}>{job.company} · {personName(owner)}</Text>
        </View>
        <Badge vip={hasVip(owner)} />
      </View>
      {job.salary ? <Text style={styles.salary}>{job.salary}</Text> : null}
      <View style={styles.tagRow}>
        <Text style={styles.tag}>⌖ {job.city}</Text><Text style={styles.tag}>{job.mode || "Presencial"}</Text><Text style={styles.tag}>{since(job.createdAt)}</Text>
      </View>
      {!compact ? <Text style={styles.description}>{job.description}</Text> : null}
      <View style={styles.cardFooter}>
        {own
          ? <TouchableOpacity style={styles.outlineButton} onPress={openApplicants}><Text style={styles.outlineText}>Candidaturas recebidas ({job.applications?.length || 0})</Text></TouchableOpacity>
          : <View style={styles.inlineActions}>
            <TouchableOpacity style={styles.outlineButton} onPress={() => saveJob(job.id)}><Text style={styles.outlineText}>{saved ? "★ Salva" : "☆ Salvar"}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primarySmall} onPress={apply} disabled={applied}><Text style={styles.primarySmallText}>{applied ? "Candidatado ✓" : hasVip(user) ? "Prioritária ⭐" : "Candidatar-se"}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chatSmall} onPress={chat}><Icon name="message-outline" size={17} color={COLORS.primary} /><Text style={styles.outlineText}>Chat</Text></TouchableOpacity>
          </View>}
      </View>
      <Modal visible={showApplicants} transparent animationType="slide" onRequestClose={() => setShowApplicants(false)}>
        <View style={styles.modalBackdrop}><View style={styles.applicantsModal}>
          <View style={styles.modalHeading}><Text style={styles.sectionHeading}>Candidaturas recebidas</Text><TouchableOpacity onPress={() => setShowApplicants(false)}><Icon name="close" size={22} color={COLORS.textSecondary} /></TouchableOpacity></View>
          {(job.applications || []).slice().sort((a, b) => Number(b.priority) - Number(a.priority) || new Date(a.createdAt) - new Date(b.createdAt)).map(application => {
            const applicant = userById(application.userId);
            return <View key={application.id} style={styles.applicantRow}><AvatarBadge name={personName(applicant)} uri={applicant?.avatar} size={42} /><View style={{ flex: 1 }}><Text style={styles.authorName}>{personName(applicant)}</Text><Text style={styles.meta}>{application.priority ? "⭐ Prioritária" : applicant?.headline || applicant?.type}</Text></View><TouchableOpacity style={styles.chatSmall} onPress={async () => {
              try {
                const conversation = await getOrCreateConversation(applicant.id);
                setShowApplicants(false);
                navigation.navigate("CommunityConversation", { conversationId: conversation.id, otherUser: applicant });
              } catch (error) { Alert.alert("Não foi possível abrir o chat", error.message); }
            }}><Icon name="message-outline" size={17} color={COLORS.primary} /><Text style={styles.outlineText}>Chat</Text></TouchableOpacity></View>;
          })}
        </View></View>
      </Modal>
    </ClayCard>
  );
}

function ProductCard({ product, navigation }) {
  const { user, userById, hasVip, reserveProduct, getOrCreateConversation } = useAuth();
  const owner = userById(product.ownerId);
  const own = product.ownerId === user.id;
  const chat = async () => {
    try {
      const conversation = await getOrCreateConversation(owner.id);
      navigation.navigate("CommunityConversation", { conversationId: conversation.id, otherUser: owner });
    } catch (error) { Alert.alert("Não foi possível abrir o chat", error.message); }
  };
  const reserve = async () => {
    const result = await reserveProduct(product.id);
    Alert.alert(result.success ? "Produto reservado" : "Indisponível", result.success
      ? "Converse com o vendedor para combinar os detalhes." : result.error);
  };
  return (
    <ClayCard style={[styles.productCard, hasVip(owner) && styles.vipCard]}>
      <View style={styles.productEmoji}><Text style={{ fontSize: 45 }}>{product.emoji || "✨"}</Text></View>
      <Text style={styles.productTitle}>{product.name} <Badge vip={hasVip(owner)} /></Text>
      <Text style={styles.meta}>⌖ {product.city} · {personName(owner)}</Text>
      <Text style={styles.productPrice}>{formatPrice(product.price)} {product.oldPrice ? <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text> : null}</Text>
      <Text style={styles.description}>{product.description}</Text>
      {own ? <Text style={styles.meta}>{product.reservedBy ? "Reservado" : "Sua oferta"}</Text> : (
        <View style={styles.inlineActions}>
          <TouchableOpacity style={styles.outlineButton} onPress={chat}><Text style={styles.outlineText}>◌ Chat</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.primarySmall, styles.goldButton]} onPress={reserve} disabled={!!product.reservedBy}><Text style={[styles.primarySmallText, styles.goldText]}>{product.reservedBy ? "Reservado" : "Reservar"}</Text></TouchableOpacity>
        </View>
      )}
    </ClayCard>
  );
}

export function CommunityHomeScreen({ navigation }) {
  const { user, data, isVip, hasVip } = useAuth();
  const feed = useMemo(() => [
    ...data.posts.map(item => ({ kind: "post", item })),
    ...data.jobs.map(item => ({ kind: "job", item })),
    ...data.products.map(item => ({ kind: "product", item })),
  ].sort((a, b) => Number(hasVip(data.users.find(user => user.id === b.item.ownerId))) - Number(hasVip(data.users.find(user => user.id === a.item.ownerId))) || new Date(b.item.createdAt) - new Date(a.item.createdAt)), [data, hasVip]);
  return (
    <ClayScreen>
      <FlatList
        data={feed}
        keyExtractor={entry => `${entry.kind}-${entry.item.id}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<>
          <View style={styles.welcome}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.heroEyebrow}>RESERVA CHAT · SUA COMUNIDADE</Text>
              <Text style={styles.welcomeTitle}>Oi, {user.name.split(" ")[0]} 👋</Text>
              <Text style={styles.welcomeText}>Conexões que geram oportunidades.</Text>
            </View>
            <View style={styles.heroIcon}><Icon name="forum-outline" size={34} color="#FFFFFF" /></View>
            {isVip ? <View style={styles.heroBadge}><Badge vip /></View> : null}
          </View>
          <ClayCard style={styles.composer}>
            <TouchableOpacity style={styles.composerAction} onPress={() => navigation.navigate("CreateContent", { initialType: "publication" })}>
              <AvatarBadge name={user.name} uri={user.avatar} size={42} /><Text style={styles.composerPlaceholder}>Compartilhe uma ideia, vaga ou oferta...</Text>
            </TouchableOpacity>
            <View style={styles.composerButtons}>
              <TouchableOpacity onPress={() => navigation.navigate("CreateContent", { initialType: "publication" })}><Text style={styles.composerButton}>✎ Publicação</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("CreateContent", { initialType: "job" })}><Text style={styles.composerButton}>▤ Vaga</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("CreateContent", { initialType: "product" })}><Text style={styles.composerButton}>◇ Oferta</Text></TouchableOpacity>
            </View>
          </ClayCard>
          <SectionTitle title="Novidades da comunidade" subtitle="Ideias, oportunidades e ofertas em um só lugar." />
        </>}
        renderItem={({ item }) => item.kind === "post" ? <PostCard post={item.item} navigation={navigation} /> : item.kind === "job" ? <JobCard job={item.item} navigation={navigation} compact /> : <ProductCard product={item.item} navigation={navigation} />}
        ItemSeparatorComponent={() => <View style={{ height: 13 }} />}
      />
    </ClayScreen>
  );
}

export function CommunityJobsScreen({ navigation }) {
  const { user, data, hasVip } = useAuth();
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const results = useMemo(() => data.jobs.filter(job => {
    const owner = data.users.find(person => person.id === job.ownerId);
    const modeMatch = filter === "Todas" || filter === "Salvas" || job.mode === filter;
    const savedMatch = filter !== "Salvas" || (job.savedBy || []).includes(user.id);
    return modeMatch && savedMatch && `${job.title} ${job.company} ${job.city} ${owner?.name || ""}`.toLowerCase().includes(query.trim().toLowerCase());
  }).sort((a, b) => Number(hasVip(data.users.find(person => person.id === b.ownerId))) - Number(hasVip(data.users.find(person => person.id === a.ownerId))) || new Date(b.createdAt) - new Date(a.createdAt)), [data, filter, hasVip, query, user.id]);
  return (
    <ClayScreen>
      <FlatList data={results} keyExtractor={item => item.id} contentContainerStyle={styles.list}
        ListHeaderComponent={<>
          <PageHeading title="Encontre seu próximo passo" subtitle="Oportunidades para crescer profissionalmente." action="Publicar vaga" onAction={() => navigation.navigate("CreateContent", { initialType: "job" })} />
          <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Cargo, empresa ou cidade..." placeholderTextColor={COLORS.textMuted} />
          <SegmentedTabs options={jobFilters} value={filter} onChange={setFilter} style={{ marginBottom: 15 }} />
        </>}
        renderItem={({ item }) => <JobCard job={item} navigation={navigation} />}
        ItemSeparatorComponent={() => <View style={{ height: 13 }} />}
        ListEmptyComponent={<EmptyState icon="briefcase-search-outline" title="Nenhuma vaga encontrada" subtitle="Tente mudar os filtros ou publique uma oportunidade." />}
      />
    </ClayScreen>
  );
}

export function CommunityProductsScreen({ navigation }) {
  const { data, hasVip } = useAuth();
  const [query, setQuery] = useState("");
  const products = useMemo(() => data.products.filter(item => `${item.name} ${item.city} ${data.users.find(user => user.id === item.ownerId)?.name || ""}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(hasVip(data.users.find(user => user.id === b.ownerId))) - Number(hasVip(data.users.find(user => user.id === a.ownerId))) || new Date(b.createdAt) - new Date(a.createdAt)), [data, hasVip, query]);
  return (
    <ClayScreen>
      <FlatList data={products} keyExtractor={item => item.id} contentContainerStyle={styles.list}
        ListHeaderComponent={<>
          <PageHeading title="Descubra boas ofertas" subtitle="Produtos de pessoas e negócios da comunidade." action="Publicar oferta" onAction={() => navigation.navigate("CreateContent", { initialType: "product" })} />
          <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Buscar produto ou cidade..." placeholderTextColor={COLORS.textMuted} />
        </>}
        renderItem={({ item }) => <ProductCard product={item} navigation={navigation} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<EmptyState icon="tag-outline" title="Nenhuma oferta encontrada" subtitle="Que tal publicar a primeira oferta da comunidade?" />}
      />
    </ClayScreen>
  );
}

export function CommunityChatScreen({ navigation }) {
  const { user, data, userById } = useAuth();
  const conversations = data.conversations.filter(item => item.members.includes(user.id))
    .sort((a, b) => new Date(b.messages.at(-1)?.createdAt || 0) - new Date(a.messages.at(-1)?.createdAt || 0));
  const open = conversation => {
    const otherUser = userById(conversation.members.find(memberId => memberId !== user.id));
    navigation.navigate("CommunityConversation", { conversationId: conversation.id, otherUser });
  };
  return (
    <ClayScreen>
      <FlatList data={conversations} keyExtractor={item => item.id} contentContainerStyle={styles.list}
        ListHeaderComponent={<PageHeading title="Suas conversas" subtitle="Boas oportunidades começam no diálogo." />}
        renderItem={({ item }) => {
          const other = userById(item.members.find(memberId => memberId !== user.id));
          const last = item.messages.at(-1);
          return <TouchableOpacity onPress={() => open(item)}><ClayCard style={styles.conversationCard}>
            <AvatarBadge name={personName(other)} uri={other?.avatar} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.authorName}>{personName(other)}</Text><Text style={styles.meta} numberOfLines={1}>{last?.content || "Conversa iniciada"}</Text></View>
            <Text style={styles.meta}>{last ? since(last.createdAt) : "nova"}</Text>
          </ClayCard></TouchableOpacity>;
        }}
        ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
        ListEmptyComponent={<EmptyState icon="message-outline" title="Nenhuma conversa por aqui" subtitle="Comece uma conversa a partir de uma vaga ou oferta." />}
      />
    </ClayScreen>
  );
}

export function CommunityConversationScreen({ navigation, route }) {
  const { conversationId, otherUser } = route.params;
  const { user, data, sendMessage } = useAuth();
  const [message, setMessage] = useState("");
  const conversation = data.conversations.find(item => item.id === conversationId);
  const submit = async () => {
    if (!message.trim() || !conversation) return;
    try {
      const text = message.trim();
      await sendMessage(conversationId, text);
      setMessage("");
    } catch (error) { Alert.alert("Mensagem não enviada", error.message); }
  };
  return (
    <ClayScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.chatHeader}><TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color={COLORS.textPrimary} /></TouchableOpacity><AvatarBadge name={personName(otherUser)} uri={otherUser?.avatar} size={42} /><View><Text style={styles.authorName}>{personName(otherUser)}</Text><Text style={styles.meta}>{otherUser?.headline || otherUser?.type}</Text></View></View>
        <FlatList data={conversation?.messages || []} keyExtractor={item => item.id} contentContainerStyle={styles.messageList}
          renderItem={({ item }) => <View style={[styles.messageBubble, item.senderId === user.id ? styles.myMessage : styles.theirMessage]}><Text style={item.senderId === user.id ? styles.myMessageText : styles.messageText}>{item.content}</Text><Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text></View>}
        />
        <View style={styles.messageComposer}><TextInput style={styles.messageInput} value={message} onChangeText={setMessage} placeholder="Escreva uma mensagem..." placeholderTextColor={COLORS.textMuted} maxLength={1000} onSubmitEditing={submit} returnKeyType="send" /><TouchableOpacity style={styles.sendButton} onPress={submit}><Icon name="send" size={18} color={COLORS.textWhite} /></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </ClayScreen>
  );
}

export function CommunityVipScreen() {
  const { user, isVip, subscribeVip, cancelVip } = useAuth();
  const expires = user.vipUntil ? new Date(user.vipUntil).toLocaleDateString("pt-BR", { dateStyle: "long" }) : "";
  const choosePlan = (days, plan) => Alert.alert(
    `Plano ${plan} · ${days === 7 ? "R$ 3,00" : "R$ 12,00"}`,
    "Escolha uma forma de pagamento. Esta demonstração não realiza cobranças.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Pix", onPress: () => confirmPlan(days, "Pix") },
      { text: "Cartão", onPress: () => confirmPlan(days, "Cartão") },
    ],
  );
  const confirmPlan = (days, payment) => Alert.alert("Confirmar VIP", `Ativar por ${days} dias via ${payment}? Nenhuma cobrança será feita.`, [
    { text: "Voltar", style: "cancel" },
    { text: "Confirmar", onPress: async () => {
      try { await subscribeVip(days, payment === "Pix" ? "pix" : "card"); Alert.alert("VIP ativo ⭐", "Seu plano foi ativado em modo demonstração."); }
      catch (error) { Alert.alert("Não foi possível ativar", error.message); }
    } },
  ]);
  const cancel = () => Alert.alert("Cancelar VIP", "O selo será removido imediatamente nesta demonstração.", [
    { text: "Manter plano", style: "cancel" },
    { text: "Cancelar assinatura", style: "destructive", onPress: () => cancelVip().catch(error => Alert.alert("Erro", error.message)) },
  ]);
  return (
    <ClayScreen><ScrollView contentContainerStyle={styles.list}>
      <ClayCard style={styles.vipHero}><Text style={styles.eyebrow}>⭐ RESERVA VIP</Text><Text style={styles.vipTitle}>Mais destaque para o que faz você crescer.</Text><Text style={styles.description}>Seu trabalho merece ser visto. Ganhe prioridade, amplie sua vitrine e conecte-se a novas oportunidades.</Text>
        {isVip ? <View style={styles.vipStatus}><Text style={styles.vipStatusText}>⭐ VIP ativo · válido até {expires}</Text><ClayButton title="Cancelar" variant="secondary" onPress={cancel} /></View> : null}
      </ClayCard>
      <ClayCard><Text style={styles.sectionHeading}>Vantagens VIP</Text>{[
        ["⭐", "Perfil em destaque", "Selo VIP no perfil e nas publicações."],
        ["🚀", "Candidatura prioritária", "Seu interesse recebe destaque para quem publicou."],
        ["♾️", "Publicações sem limite", "Publique mais vagas e produtos."],
        ["✨", "Mais visibilidade", "Perfis VIP aparecem primeiro nos resultados."],
      ].map(([icon, title, description]) => <View key={title} style={styles.benefitRow}><Text style={styles.benefitIcon}>{icon}</Text><View><Text style={styles.authorName}>{title}</Text><Text style={styles.meta}>{description}</Text></View></View>)}</ClayCard>
      <SectionTitle title="Escolha seu plano" subtitle="Pagamento demonstrativo, sem cobrança real." />
      <View style={styles.planRow}>
        <ClayCard style={styles.planCard}><Text style={styles.planName}>Semanal</Text><Text style={styles.planPrice}>R$ 3,00</Text><Text style={styles.meta}>Renova em 7 dias</Text><ClayButton title="Escolher plano" onPress={() => choosePlan(7, "semanal")} style={{ marginTop: 12 }} /></ClayCard>
        <ClayCard style={[styles.planCard, styles.vipCard]}><Text style={styles.planName}>Mensal ⭐</Text><Text style={styles.planPrice}>R$ 12,00</Text><Text style={styles.meta}>Renova em 30 dias</Text><ClayButton title="Escolher plano" onPress={() => choosePlan(30, "mensal")} style={{ marginTop: 12 }} /></ClayCard>
      </View>
      {isVip ? <ClayButton title="Renovar plano mensal" variant="secondary" onPress={() => choosePlan(30, "mensal")} /> : null}
    </ScrollView></ClayScreen>
  );
}

export function CommunityProfileScreen({ navigation }) {
  const { user, data, isVip, logout, deleteOwnItem } = useAuth();
  const [tab, setTab] = useState("jobs");
  const mine = {
    jobs: data.jobs.filter(item => item.ownerId === user.id),
    products: data.products.filter(item => item.ownerId === user.id),
    posts: data.posts.filter(item => item.ownerId === user.id),
  };
  const remove = (kind, item) => Alert.alert("Excluir publicação", "Esta ação não pode ser desfeita.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: () => deleteOwnItem(kind, item.id).catch(error => Alert.alert("Erro", error.message)) },
  ]);
  return (
    <ClayScreen><ScrollView contentContainerStyle={styles.list}>
      <ClayCard style={[styles.profileCard, isVip && styles.vipCard]}>
        <View style={styles.profileCover} />
        <View style={styles.profileBody}><View style={styles.profileTop}><AvatarBadge name={user.name} uri={user.avatar} size={76} /><View style={{ flex: 1 }}><View style={styles.nameLine}><Text style={styles.profileName}>{user.name}</Text><Badge vip={isVip} /></View><Text style={styles.meta}>{user.headline || user.type}</Text></View></View>
          <Text style={styles.description}>{user.bio || "Conte um pouco sobre você e seus objetivos."}</Text>
          <View style={styles.profileActions}><ClayButton title="Editar perfil" variant="secondary" icon="pencil-outline" onPress={() => navigation.navigate("CommunityEditProfile")} style={{ flex: 1 }} /><ClayButton title="Sair" variant="secondary" icon="logout" onPress={() => logout().catch(error => Alert.alert("Erro ao sair", error.message))} style={{ flex: 1 }} /></View>
        </View>
      </ClayCard>
      <View style={styles.statsRow}>{[["Vagas", mine.jobs.length], ["Produtos", mine.products.length], ["Publicações", mine.posts.length], ["Curtidas", mine.posts.reduce((sum, post) => sum + post.likes.length, 0)]].map(([label, count]) => <ClayCard key={label} style={styles.stat}><Text style={styles.statValue}>{count}</Text><Text style={styles.meta}>{label}</Text></ClayCard>)}</View>
      <SegmentedTabs options={profileTabs.map(item => ({ ...item, label: `${item.label} (${mine[item.value].length})` }))} value={tab} onChange={setTab} />
      <View style={{ gap: 12, marginTop: 14 }}>
        {mine[tab].length ? mine[tab].map(item => (
          <ClayCard key={item.id} style={styles.ownItem}>
            {tab === "jobs" ? <><Text style={styles.jobTitle}>{item.title}</Text><Text style={styles.meta}>{item.company} · {item.city} · {item.mode}</Text><Text style={styles.salary}>{item.salary}</Text></>
              : tab === "products" ? <><Text style={styles.productTitle}>{item.emoji} {item.name}</Text><Text style={styles.meta}>{item.city}</Text><Text style={styles.productPrice}>{formatPrice(item.price)}</Text></>
                : <><Text style={styles.postText}>{item.content}</Text><Text style={styles.meta}>{item.likes.length} curtidas · {item.comments.length} comentários</Text></>}
            <TouchableOpacity style={styles.deleteButton} onPress={() => remove(tab, item)}><Icon name="trash-can-outline" size={17} color={COLORS.danger} /><Text style={styles.deleteText}>Excluir</Text></TouchableOpacity>
          </ClayCard>
        )) : <EmptyState title={`Você ainda não publicou ${tab === "jobs" ? "vagas" : tab === "products" ? "produtos" : "publicações"}`} subtitle="Compartilhe uma novidade para começar." />}
      </View>
    </ScrollView></ClayScreen>
  );
}

export function CommunityEditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name || "", headline: user.headline || "", bio: user.bio || "", avatar: user.avatar || "" });
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => {
    if (form.name.trim().length < 2) return Alert.alert("Nome inválido", "Informe seu nome.");
    if (form.avatar && !/^https?:\/\//i.test(form.avatar)) return Alert.alert("Foto inválida", "Use uma URL iniciada por https:// ou http://.");
    try { await updateUser({ ...form, name: form.name.trim(), avatar: form.avatar.trim() }); navigation.goBack(); }
    catch (error) { Alert.alert("Não foi possível salvar", error.message); }
  };
  return <ClayScreen><ScrollView contentContainerStyle={styles.list}><PageHeading title="Editar perfil" subtitle="Deixe sua apresentação com a sua cara." /><ClayCard>
    <ClayInput label="Nome" value={form.name} onChangeText={value => update("name", value)} />
    <ClayInput label="Foto (URL, opcional)" value={form.avatar} onChangeText={value => update("avatar", value)} autoCapitalize="none" />
    <ClayInput label="Área / título profissional" value={form.headline} onChangeText={value => update("headline", value)} />
    <ClayInput label="Descrição" value={form.bio} onChangeText={value => update("bio", value)} multiline />
  </ClayCard><ClayButton title="Salvar alterações" icon="content-save-outline" onPress={save} /></ScrollView></ClayScreen>;
}

export function CreateContentScreen({ navigation, route }) {
  const { createPost, createJob, createProduct } = useAuth();
  const [type, setType] = useState(route.params?.initialType || "publication");
  const [form, setForm] = useState({ content: "", title: "", company: "", city: "", salary: "", mode: "Remoto", description: "", name: "", price: "", oldPrice: "", emoji: "✨" });
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const publish = async () => {
    try {
      if (type === "publication") {
        if (!form.content.trim()) return Alert.alert("Texto obrigatório", "Escreva algo antes de publicar.");
        await createPost(form.content);
      } else if (type === "job") {
        if (!form.title.trim() || !form.company.trim() || !form.city.trim() || !form.description.trim()) return Alert.alert("Campos obrigatórios", "Preencha cargo, empresa, cidade e descrição.");
        await createJob({ title: form.title.trim(), company: form.company.trim(), city: form.city.trim(), salary: form.salary.trim(), mode: form.mode, description: form.description.trim() });
      } else {
        const price = Number(String(form.price).replace(",", "."));
        const rawOldPrice = String(form.oldPrice).trim();
        const oldPrice = rawOldPrice ? Number(rawOldPrice.replace(",", ".")) : null;
        if (!form.name.trim() || !form.city.trim() || !form.description.trim() || !(price > 0)) return Alert.alert("Campos obrigatórios", "Preencha nome, preço, cidade e descrição.");
        if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= price)) return Alert.alert("Preço inválido", "O preço antigo precisa ser maior que o preço atual.");
        await createProduct({ name: form.name.trim(), city: form.city.trim(), description: form.description.trim(), price, oldPrice, emoji: form.emoji.trim() || "✨" });
      }
      navigation.goBack();
      Alert.alert("Publicado!", type === "job" ? "Sua vaga já está disponível." : type === "product" ? "Sua oferta já está disponível." : "Sua publicação já está no feed.");
    } catch (error) {
      if (error.message.includes("Limite grátis")) {
        Alert.alert("Limite do plano grátis", error.message, [{ text: "Agora não", style: "cancel" }, { text: "Ver VIP", onPress: () => navigation.navigate("Main", { screen: "VIP" }) }]);
      } else Alert.alert("Não foi possível publicar", error.message);
    }
  };
  return <ClayScreen><ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
    <PageHeading title="Criar publicação" subtitle="Compartilhe uma ideia, oportunidade ou oferta." />
    <SegmentedTabs options={[{ label: "Publicação", value: "publication" }, { label: "Vaga", value: "job" }, { label: "Produto", value: "product" }]} value={type} onChange={setType} />
    <ClayCard style={{ marginTop: 14 }}>
      {type === "publication" ? <ClayInput label="O que você quer compartilhar?" value={form.content} onChangeText={value => update("content", value)} placeholder="Uma ideia, conquista ou novidade da sua área..." multiline maxLength={1500} />
        : type === "job" ? <>
          <ClayInput label="Cargo" value={form.title} onChangeText={value => update("title", value)} placeholder="Ex.: Analista de Marketing" />
          <ClayInput label="Empresa" value={form.company} onChangeText={value => update("company", value)} />
          <ClayInput label="Cidade" value={form.city} onChangeText={value => update("city", value)} />
          <ClayInput label="Salário" value={form.salary} onChangeText={value => update("salary", value)} placeholder="Ex.: R$ 3.000 – R$ 4.000" />
          <Text style={styles.fieldLabel}>Modalidade</Text><SegmentedTabs options={["Remoto", "Presencial", "Híbrido"].map(value => ({ label: value, value }))} value={form.mode} onChange={value => update("mode", value)} />
          <ClayInput label="Descrição" value={form.description} onChangeText={value => update("description", value)} multiline />
        </> : <>
          <ClayInput label="Nome do produto" value={form.name} onChangeText={value => update("name", value)} />
          <ClayInput label="Preço (R$)" value={form.price} onChangeText={value => update("price", value)} keyboardType="decimal-pad" />
          <ClayInput label="Preço antigo (opcional)" value={form.oldPrice} onChangeText={value => update("oldPrice", value)} keyboardType="decimal-pad" />
          <ClayInput label="Cidade" value={form.city} onChangeText={value => update("city", value)} />
          <ClayInput label="Emoji" value={form.emoji} onChangeText={value => update("emoji", value)} />
          <ClayInput label="Descrição" value={form.description} onChangeText={value => update("description", value)} multiline />
        </>}
    </ClayCard>
    <ClayButton title="Publicar" icon="rocket-launch-outline" onPress={publish} />
  </ScrollView></ClayScreen>;
}

const styles = StyleSheet.create({
  list: { width: "100%", maxWidth: 960, alignSelf: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 14 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  headingTitle: { color: COLORS.textPrimary, fontSize: 25, lineHeight: 31, fontWeight: "900", letterSpacing: -0.5 },
  headingSubtitle: { color: COLORS.textSecondary, marginTop: 4, lineHeight: 20 },
  headingAction: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: COLORS.primary },
  headingActionText: { color: COLORS.textWhite, fontSize: 12, fontWeight: "800" },
  welcome: { minHeight: 168, position: "relative", overflow: "hidden", flexDirection: "row", alignItems: "center", padding: 24, borderRadius: 28, backgroundColor: COLORS.primaryDeep, marginBottom: 2 },
  welcomeCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: COLORS.primaryGlow, fontSize: 10, letterSpacing: 1.15, fontWeight: "900" },
  heroIcon: { position: "absolute", right: 26, bottom: 22, width: 78, height: 78, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", transform: [{ rotate: "-8deg" }] },
  heroBadge: { position: "absolute", top: 20, right: 20 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, letterSpacing: 1, fontWeight: "900" },
  welcomeTitle: { color: COLORS.textWhite, fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8, marginTop: 9 },
  welcomeText: { color: "rgba(255,255,255,0.76)", marginTop: 5, fontSize: 14 },
  composer: { padding: 16, marginBottom: 4, borderRadius: 22 },
  composerAction: { flexDirection: "row", alignItems: "center", gap: 10 },
  composerPlaceholder: { flex: 1, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textMuted, overflow: "hidden", backgroundColor: COLORS.surfaceStrong, fontSize: 13 },
  composerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  composerButton: { color: COLORS.primaryDark, fontWeight: "800", fontSize: 12 },
  postCard: { padding: 18, borderRadius: 22 },
  vipCard: { borderColor: COLORS.warning, borderWidth: 1.5 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  authorName: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  meta: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  vipBadge: { overflow: "hidden", backgroundColor: "#FFF1CB", color: "#94620C", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, fontSize: 10, fontWeight: "900" },
  postText: { color: COLORS.textPrimary, lineHeight: 23, marginTop: 15, fontSize: 15 },
  postStats: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 12 },
  actionRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 7 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 7, borderRadius: 12 },
  actionText: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 12 },
  commentBubble: { marginTop: 7, padding: 10, borderRadius: 12, backgroundColor: COLORS.backgroundAlt },
  commentName: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 12 },
  commentText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  commentInput: { minHeight: 40, flex: 1, paddingHorizontal: 13, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary, backgroundColor: COLORS.surfaceStrong, fontSize: 12 },
  sendComment: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  jobCard: { padding: 18, borderRadius: 22 },
  jobHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  companyMark: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center" },
  jobTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: "900" },
  salary: { color: COLORS.primaryDark, fontWeight: "900", marginTop: 12 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 11 },
  tag: { color: COLORS.textSecondary, backgroundColor: COLORS.backgroundAlt, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 30, fontSize: 10, fontWeight: "700" },
  description: { color: COLORS.textSecondary, lineHeight: 20, fontSize: 12, marginTop: 11 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 11, marginTop: 12 },
  inlineActions: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" },
  outlineButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  outlineText: { color: COLORS.primaryDark, fontWeight: "800", fontSize: 11 },
  primarySmall: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 },
  primarySmallText: { color: COLORS.textWhite, fontWeight: "800", fontSize: 11 },
  chatSmall: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 5 },
  productCard: { padding: 16, borderRadius: 22 },
  productEmoji: { height: 120, borderRadius: 17, backgroundColor: COLORS.backgroundAlt, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  productTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  productPrice: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900", marginTop: 10 },
  oldPrice: { color: COLORS.textMuted, textDecorationLine: "line-through", fontSize: 12, fontWeight: "500" },
  goldButton: { backgroundColor: COLORS.warning },
  goldText: { color: "#33250A" },
  search: { minHeight: 48, backgroundColor: COLORS.surfaceStrong, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, paddingHorizontal: 15, color: COLORS.textPrimary },
  conversationCard: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 20 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  messageList: { padding: 15, gap: 9 },
  messageBubble: { maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 16 },
  myMessage: { alignSelf: "flex-end", backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: "flex-start", backgroundColor: COLORS.surfaceStrong, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.textPrimary, lineHeight: 19 },
  myMessageText: { color: COLORS.textWhite, lineHeight: 19 },
  messageTime: { color: COLORS.textMuted, fontSize: 9, textAlign: "right", marginTop: 4 },
  messageComposer: { flexDirection: "row", alignItems: "center", gap: 9, padding: 12, borderTopWidth: 1, borderColor: COLORS.border },
  messageInput: { minHeight: 44, flex: 1, backgroundColor: COLORS.surfaceStrong, borderRadius: 23, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, color: COLORS.textPrimary },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary },
  vipHero: { backgroundColor: COLORS.backgroundAlt, borderColor: COLORS.warning },
  vipTitle: { color: COLORS.textPrimary, fontSize: 24, lineHeight: 30, fontWeight: "900", marginTop: 10 },
  vipStatus: { marginTop: 15, gap: 10 },
  vipStatusText: { color: COLORS.primaryDark, fontWeight: "800" },
  sectionHeading: { color: COLORS.textPrimary, fontSize: 19, fontWeight: "900", marginBottom: 6 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 10, borderTopWidth: 1, borderColor: COLORS.border },
  benefitIcon: { fontSize: 20, width: 30 },
  planRow: { flexDirection: "row", gap: 10 },
  planCard: { flex: 1, padding: 13 },
  planName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  planPrice: { color: COLORS.primaryDark, fontSize: 22, fontWeight: "900", marginTop: 8 },
  profileCard: { overflow: "hidden", padding: 0 },
  profileCover: { height: 105, backgroundColor: COLORS.primary },
  profileBody: { padding: 15 },
  profileTop: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: -38 },
  profileName: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 19 },
  profileActions: { flexDirection: "row", gap: 9, marginTop: 14 },
  statsRow: { flexDirection: "row", gap: 6 },
  stat: { flex: 1, alignItems: "center", padding: 9 },
  statValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  ownItem: { padding: 13 },
  deleteButton: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 9 },
  deleteText: { color: COLORS.danger, fontWeight: "700", fontSize: 11 },
  fieldLabel: { color: COLORS.textPrimary, fontWeight: "700", marginBottom: 8 },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "rgba(0,0,0,0.5)" },
  applicantsModal: { maxHeight: "80%", padding: 17, borderRadius: 18, backgroundColor: COLORS.surface, gap: 12 },
  modalHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  applicantRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 8, borderTopWidth: 1, borderColor: COLORS.border },
});
