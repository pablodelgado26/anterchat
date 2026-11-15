import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import {
  authAPI,
  jobsAPI,
  messagesAPI,
  postsAPI,
  productsAPI,
  profileAPI,
  vipAPI,
} from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "reserva-chat-state-v1";
const LEGACY_USER_KEY = "user";
const LEGACY_TOKEN_KEY = "token";
const DEMO_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
const id = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const ago = minutes => new Date(Date.now() - minutes * 60000).toISOString();

function createInitialState() {
  return {
    sessionId: "",
    users: [
      { id: "ana", name: "Ana Martins", email: "ana@reservachat.com", passwordHash: DEMO_HASH, type: "Profissional", bio: "Conectando talentos, boas ideias e oportunidades. ✨", headline: "Relacionamento com clientes · São Paulo, SP", avatar: "", vipUntil: "" },
      { id: "caio", name: "Caio Nogueira", email: "caio@reservachat.com", passwordHash: "", type: "Empresa/vendedor", bio: "Café especial direto de pequenos produtores.", headline: "Café do Caio · Campinas, SP", avatar: "", vipUntil: "" },
      { id: "bia", name: "Beatriz Lima", email: "bia@reservachat.com", passwordHash: "", type: "Profissional", bio: "Designer que transforma ideias em marcas memoráveis.", headline: "Design gráfico · Remoto", avatar: "", vipUntil: "" },
      { id: "leo", name: "Leonardo Souza", email: "leo@reservachat.com", passwordHash: "", type: "Empresa/vendedor", bio: "Peças autorais feitas com cuidado.", headline: "Ateliê Lume · São Paulo, SP", avatar: "", vipUntil: "" },
    ],
    posts: [
      { id: "post-a", ownerId: "ana", content: "Uma boa conversa abre portas que a gente nem sabia que existiam. Feliz de compartilhar e aprender com essa comunidade! 💚", createdAt: ago(18), likes: ["bia"], comments: [{ id: "comment-a", userId: "bia", content: "É isso! Conexões fazem toda a diferença." }] },
      { id: "post-b", ownerId: "bia", content: "Portfólio novo no ar! Estou aberta a conversar sobre projetos de identidade visual e design digital. ✨", createdAt: ago(95), likes: ["ana", "caio"], comments: [] },
      { id: "post-c", ownerId: "caio", content: "Semana de café fresquinho por aqui ☕ Quem quiser conhecer nossos grãos, me chama no chat!", createdAt: ago(210), likes: [], comments: [] },
    ],
    jobs: [
      { id: "job-ana", ownerId: "ana", title: "Assistente de Vendas", company: "Reserva & Co.", city: "São Paulo, SP", mode: "Presencial", salary: "R$ 2.800 – R$ 3.400", description: "Buscamos alguém comunicativo para encantar clientes, apoiar o time comercial e acompanhar pedidos. Experiência com atendimento é um diferencial.", createdAt: ago(45), savedBy: [], applications: [] },
      { id: "job-bia", ownerId: "bia", title: "Designer Júnior", company: "Estúdio Aurora", city: "Brasil", mode: "Remoto", salary: "R$ 3.200 – R$ 4.000", description: "Crie peças digitais, ajude a construir identidades visuais e cresça em um time colaborativo. Portfólio é bem-vindo.", createdAt: ago(130), savedBy: [], applications: [] },
      { id: "job-caio", ownerId: "caio", title: "Recepcionista", company: "Casa do Café", city: "Campinas, SP", mode: "Presencial", salary: "R$ 2.200 + benefícios", description: "Recepção acolhedora, organização de agenda e apoio às rotinas da loja. Jornada de segunda a sexta.", createdAt: ago(280), savedBy: [], applications: [] },
    ],
    products: [
      { id: "product-ana", ownerId: "ana", name: "Notebook leve 14”", city: "São Paulo, SP", price: 2499, oldPrice: 2999, emoji: "💻", description: "Notebook em ótimo estado, rápido para estudar e trabalhar. Acompanha carregador original.", createdAt: ago(70), reservedBy: "" },
      { id: "product-cafe", ownerId: "caio", name: "Café especial moído", city: "Campinas, SP", price: 38, oldPrice: 45, emoji: "☕", description: "Grãos selecionados, torra recente e notas de chocolate. Pacote de 250 g.", createdAt: ago(110), reservedBy: "" },
      { id: "product-vela", ownerId: "leo", name: "Vela artesanal de lavanda", city: "São Paulo, SP", price: 54, oldPrice: 68, emoji: "🕯️", description: "Feita à mão com cera vegetal para deixar qualquer espaço mais aconchegante.", createdAt: ago(230), reservedBy: "" },
    ],
    conversations: [
      { id: "conversation-ana-bia", members: ["ana", "bia"], messages: [{ id: "message-a", senderId: "bia", content: "Oi, Ana! Vi sua publicação, adorei a ideia. Vamos conversar?", createdAt: ago(140) }, { id: "message-b", senderId: "ana", content: "Oi, Bia! Claro, vai ser ótimo 😊", createdAt: ago(136) }] },
      { id: "conversation-ana-caio", members: ["ana", "caio"], messages: [{ id: "message-c", senderId: "caio", content: "Olá! Posso te contar mais sobre o café especial.", createdAt: ago(320) }] },
    ],
  };
}

async function hashPassword(password) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

function isVip(user) {
  return !!user?.vipUntil && new Date(user.vipUntil).getTime() > Date.now();
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: String(user.id),
    type: user.accountType || user.type || "Profissional",
    avatar: user.avatar || "",
    vipUntil: user.vipUntil || "",
  };
}

function normalizePost(post) {
  return {
    ...post,
    id: String(post.id),
    ownerId: String(post.authorId ?? post.author?.id ?? post.ownerId),
    content: post.content || post.text || "",
    likes: (post.likes || []).map(like => String(like.userId ?? like)),
    comments: (post.comments || []).map(comment => ({
      ...comment,
      id: String(comment.id),
      userId: String(comment.authorId ?? comment.author?.id ?? comment.userId),
      content: comment.content || comment.text || "",
    })),
  };
}

function normalizeJob(job, currentUserId = "") {
  return {
    ...job,
    id: String(job.id),
    ownerId: String(job.postedById ?? job.postedBy?.id ?? job.ownerId),
    company: job.companyName || job.company?.name || job.company || job.postedBy?.name || "",
    city: job.city || job.location || "",
    mode: job.mode || job.workplaceType || "Presencial",
    salary: job.salary || job.salaryRange || "",
    createdAt: job.createdAt || new Date().toISOString(),
    savedBy: job.saved ? [String(currentUserId)] : (job.savedBy || []).map(String),
    applications: (job.applications || []).map(application => ({
      ...application,
      id: String(application.id),
      userId: String(application.candidateUserId ?? application.candidateUser?.id ?? application.userId),
      priority: application.priority ?? application.isPriority ?? false,
    })),
  };
}

function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    ownerId: String(product.sellerId ?? product.seller?.id ?? product.ownerId),
    reservedBy: product.reservedBy || (product.reservedById ? String(product.reservedById) : ""),
    createdAt: product.createdAt || new Date().toISOString(),
  };
}

function normalizeConversation(conversation, userId) {
  const firstUser = normalizeUser(conversation.user1);
  const secondUser = normalizeUser(conversation.user2);
  const messages = (conversation.messages || []).map(message => ({
    ...message,
    id: String(message.id),
    senderId: String(message.senderId),
    content: message.content || "",
  }));
  return {
    ...conversation,
    id: String(conversation.id),
    members: [String(conversation.user1Id ?? firstUser?.id), String(conversation.user2Id ?? secondUser?.id)],
    messages,
    otherUser: String(conversation.user1Id) === String(userId) ? secondUser : firstUser,
  };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(createInitialState);
  const stateRef = useRef(state);
  const remoteSessionRef = useRef(false);
  const [loading, setLoading] = useState(true);

  const commit = useCallback(async updater => {
    const next = typeof updater === "function" ? updater(stateRef.current) : updater;
    stateRef.current = next;
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Erro ao salvar os dados da comunidade:", error);
      throw new Error("Não foi possível salvar as alterações neste dispositivo.");
    }
    return next;
  }, []);

  const refreshRemoteData = useCallback(async apiUser => {
    const user = normalizeUser(apiUser || stateRef.current.users.find(item => item.id === stateRef.current.sessionId));
    if (!user) throw new Error("Não foi possível identificar a conta conectada.");
    const [postsResponse, jobsResponse, productsResponse, conversationsResponse] = await Promise.all([
      postsAPI.getAll({ page: 1, limit: 100 }),
      jobsAPI.getAll({ page: 1, limit: 100 }),
      productsAPI.getAll(),
      messagesAPI.getConversations(),
    ]);
    const posts = (postsResponse.data.data || []).map(normalizePost);
    const jobRows = jobsResponse.data.data || [];
    const jobs = jobRows.map(job => normalizeJob(job, user.id));
    const ownJobs = jobs.filter(job => job.ownerId === user.id);
    const applicationResults = await Promise.all(ownJobs.map(async job => {
      const response = await jobsAPI.getApplications(job.id);
      return [job.id, response.data.data || []];
    }));
    const applicationsByJob = new Map(applicationResults);
    for (const job of jobs) {
      if (applicationsByJob.has(job.id)) {
        job.applications = applicationsByJob.get(job.id).map(application => ({
          ...application,
          id: String(application.id),
          userId: String(application.candidateUserId ?? application.candidateUser?.id),
          priority: application.priority ?? application.isPriority ?? false,
        }));
      } else if (job.alreadyApplied) {
        job.applications = [{ id: `application-${job.id}`, userId: user.id, priority: false }];
      }
    }
    const products = (productsResponse.data.data || []).map(normalizeProduct);
    const conversations = await Promise.all((conversationsResponse.data.data || []).map(async summary => {
      const normalized = normalizeConversation(summary, user.id);
      const response = await messagesAPI.getMessages(normalized.id, { page: 1, limit: 100 });
      normalized.messages = (response.data.data || []).map(message => ({
        ...message,
        id: String(message.id),
        senderId: String(message.senderId),
        content: message.content || "",
      }));
      return normalized;
    }));
    const users = new Map();
    const addUser = candidate => {
      const normalized = normalizeUser(candidate);
      if (normalized?.id) users.set(normalized.id, { ...users.get(normalized.id), ...normalized });
    };
    addUser(user);
    (postsResponse.data.data || []).forEach(post => addUser(post.author));
    jobRows.forEach(job => addUser(job.postedBy));
    (productsResponse.data.data || []).forEach(product => addUser(product.seller));
    jobs.forEach(job => (job.applications || []).forEach(application => addUser(application.candidateUser)));
    (conversationsResponse.data.data || []).forEach(conversation => {
      addUser(conversation.user1);
      addUser(conversation.user2);
      addUser(conversation.otherUser);
    });
    const next = {
      ...stateRef.current,
      sessionId: user.id,
      users: [...users.values()],
      posts,
      jobs,
      products,
      conversations,
    };
    await commit(next);
    return next;
  }, [commit]);

  useEffect(() => {
    let active = true;
    const loadStoredData = async () => {
      try {
        const [stored, legacyUser, legacyToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(LEGACY_USER_KEY),
          AsyncStorage.getItem(LEGACY_TOKEN_KEY),
        ]);
        if (!active) return;
        if (stored) {
          const parsed = JSON.parse(stored);
          const seeded = createInitialState();
          const restored = {
            ...seeded,
            ...parsed,
            users: Array.isArray(parsed.users) ? parsed.users : seeded.users,
            posts: Array.isArray(parsed.posts) ? parsed.posts : seeded.posts,
            jobs: Array.isArray(parsed.jobs) ? parsed.jobs : seeded.jobs,
            products: Array.isArray(parsed.products) ? parsed.products : seeded.products,
            conversations: Array.isArray(parsed.conversations) ? parsed.conversations : seeded.conversations,
          };
          const restoredUser = legacyUser && legacyToken ? normalizeUser(JSON.parse(legacyUser)) : null;
          if (restoredUser) {
            const existingIndex = restored.users.findIndex(item => item.id === restoredUser.id);
            if (existingIndex >= 0) restored.users[existingIndex] = { ...restored.users[existingIndex], ...restoredUser };
            else restored.users.push({ ...restoredUser, passwordHash: "" });
            restored.sessionId = restoredUser.id;
            remoteSessionRef.current = true;
          }
          stateRef.current = restored;
          setState(restored);
          if (restoredUser) {
            try {
              await refreshRemoteData(restoredUser);
            } catch (error) {
              console.error("Não foi possível sincronizar os dados com o servidor:", error);
            }
          }
        } else if (legacyUser && legacyToken) {
          const user = normalizeUser(JSON.parse(legacyUser));
          const seeded = createInitialState();
          if (user?.id) {
            seeded.users.push({ ...user, passwordHash: "" });
            seeded.sessionId = user.id;
            remoteSessionRef.current = true;
          }
          stateRef.current = seeded;
          setState(seeded);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
          if (user) {
            try {
              await refreshRemoteData(user);
            } catch (error) {
              console.error("Não foi possível sincronizar os dados com o servidor:", error);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar os dados da comunidade:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStoredData();
    return () => { active = false; };
  }, [refreshRemoteData]);

  const currentUser = state.users.find(user => user.id === state.sessionId) || null;
  const userById = useCallback(userId => state.users.find(user => user.id === userId) || null, [state.users]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return { success: false, error: "Preencha e-mail e senha." };
    try {
      const response = await authAPI.login(normalizedEmail, password);
      const { token, user: apiUser } = response.data.data;
      const user = normalizeUser(apiUser);
      await AsyncStorage.setItem(LEGACY_TOKEN_KEY, token);
      await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
      remoteSessionRef.current = true;
      await commit(current => ({
        ...current,
        users: [...current.users.filter(item => item.email?.toLowerCase() !== normalizedEmail && item.id !== user.id), user],
        sessionId: user.id,
      }));
      try {
        await refreshRemoteData(user);
        return { success: true };
      } catch (error) {
        console.error("Login efetuado, mas não foi possível carregar o conteúdo:", error);
        return { success: true, warning: "Sua sessão foi iniciada, mas alguns dados não carregaram. Verifique a conexão com o servidor." };
      }
    } catch (remoteError) {
      if (remoteError.response) {
        return { success: false, error: remoteError.response.data?.error || "E-mail ou senha incorretos." };
      }
      try {
        const passwordHash = await hashPassword(password);
        const localUser = stateRef.current.users.find(item => item.email?.toLowerCase() === normalizedEmail);
        if (!localUser || localUser.passwordHash !== passwordHash) {
          return { success: false, error: "Não foi possível conectar ao servidor. Verifique a conexão ou continue como visitante." };
        }
        remoteSessionRef.current = false;
        await commit(current => ({ ...current, sessionId: localUser.id }));
        await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(localUser));
        await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
        return { success: true, warning: "Modo demonstração offline: alterações ficam salvas apenas neste dispositivo." };
      } catch (error) {
        return { success: false, error: error.message || "Não foi possível entrar. Tente novamente." };
      }
    }
  }, [commit, refreshRemoteData]);

  const register = useCallback(async ({ name, email, password, type = "Profissional" }) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const response = await authAPI.register({
        name: name.trim(),
        email: normalizedEmail,
        password,
        accountType: type,
      });
      const { token, user: apiUser } = response.data.data;
      const user = normalizeUser(apiUser);
      await AsyncStorage.setItem(LEGACY_TOKEN_KEY, token);
      await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
      remoteSessionRef.current = true;
      await commit(current => ({
        ...current,
        users: [...current.users.filter(item => item.email?.toLowerCase() !== normalizedEmail), user],
        sessionId: user.id,
      }));
      try {
        await refreshRemoteData(user);
      } catch (error) {
        console.error("Conta criada, mas não foi possível carregar o conteúdo:", error);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message || "Não foi possível criar a conta." };
    }
  }, [commit, refreshRemoteData]);

  const requestPasswordReset = useCallback(async email => {
    try {
      await authAPI.requestPasswordReset(email.trim().toLowerCase());
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Não foi possível solicitar a redefinição.",
      };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Não foi possível redefinir a senha.",
      };
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    remoteSessionRef.current = false;
    const guest = { id: "guest", name: "Visitante", email: "", passwordHash: "", type: "Profissional", bio: "Conhecendo a comunidade Reserva Chat.", headline: "Visitante", avatar: "", vipUntil: "" };
    await commit(current => ({
      ...current,
      users: current.users.some(user => user.id === guest.id) ? current.users : [...current.users, guest],
      sessionId: guest.id,
    }));
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  }, [commit]);

  const logout = useCallback(async () => {
    remoteSessionRef.current = false;
    await commit(current => ({ ...current, sessionId: "" }));
    await AsyncStorage.multiRemove([LEGACY_USER_KEY, LEGACY_TOKEN_KEY]);
  }, [commit]);

  const updateUser = useCallback(async changes => {
    const userId = stateRef.current.sessionId;
    let updatedChanges = changes;
    if (remoteSessionRef.current) {
      const response = await profileAPI.updateProfile({
        name: changes.name,
        headline: changes.headline,
        bio: changes.bio,
        avatar: changes.avatar,
      });
      updatedChanges = normalizeUser(response.data.data);
    }
    await commit(current => ({
      ...current,
      users: current.users.map(user => user.id === userId ? { ...user, ...updatedChanges } : user),
    }));
    const updatedUser = stateRef.current.users.find(user => user.id === userId);
    if (updatedUser) await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(updatedUser));
  }, [commit]);

  const cancelVip = useCallback(async () => {
    if (remoteSessionRef.current) await vipAPI.cancel();
    const userId = stateRef.current.sessionId;
    await commit(current => ({
      ...current,
      users: current.users.map(user => user.id === userId ? { ...user, vipUntil: "" } : user),
    }));
    const updatedUser = stateRef.current.users.find(user => user.id === userId);
    if (updatedUser) await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(updatedUser));
  }, [commit]);

  const createPost = useCallback(async content => {
    if (!stateRef.current.sessionId) throw new Error("Entre para publicar.");
    if (remoteSessionRef.current) {
      await postsAPI.create({ content: content.trim() });
      await refreshRemoteData();
      return;
    }
    const post = { id: id("post"), ownerId: stateRef.current.sessionId, content: content.trim(), createdAt: new Date().toISOString(), likes: [], comments: [] };
    await commit(current => ({ ...current, posts: [post, ...current.posts] }));
  }, [commit, refreshRemoteData]);

  const createJob = useCallback(async jobData => {
    const user = stateRef.current.users.find(item => item.id === stateRef.current.sessionId);
    if (!user) throw new Error("Entre para publicar uma vaga.");
    if (!isVip(user) && stateRef.current.jobs.filter(item => item.ownerId === user.id).length >= 3) throw new Error("Limite grátis de 3 vagas atingido. Conheça o plano VIP.");
    if (remoteSessionRef.current) {
      try {
        await jobsAPI.create({
          title: jobData.title,
          companyName: jobData.company,
          description: jobData.description,
          city: jobData.city,
          mode: jobData.mode,
          salary: jobData.salary,
        });
        await refreshRemoteData();
        return;
      } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Não foi possível publicar a vaga.");
      }
    }
    const job = { ...jobData, id: id("job"), ownerId: user.id, createdAt: new Date().toISOString(), savedBy: [], applications: [] };
    await commit(current => ({ ...current, jobs: [job, ...current.jobs] }));
  }, [commit, refreshRemoteData]);

  const createProduct = useCallback(async productData => {
    const user = stateRef.current.users.find(item => item.id === stateRef.current.sessionId);
    if (!user) throw new Error("Entre para publicar uma oferta.");
    if (!isVip(user) && stateRef.current.products.filter(item => item.ownerId === user.id).length >= 3) throw new Error("Limite grátis de 3 produtos atingido. Conheça o plano VIP.");
    if (remoteSessionRef.current) {
      try {
        await productsAPI.create(productData);
        await refreshRemoteData();
        return;
      } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Não foi possível publicar a oferta.");
      }
    }
    const product = { ...productData, id: id("product"), ownerId: user.id, createdAt: new Date().toISOString(), reservedBy: "" };
    await commit(current => ({ ...current, products: [product, ...current.products] }));
  }, [commit, refreshRemoteData]);

  const toggleLike = useCallback(async postId => {
    if (remoteSessionRef.current) {
      await postsAPI.toggleLike(postId);
      await refreshRemoteData();
      return;
    }
    const userId = stateRef.current.sessionId;
    await commit(current => ({
      ...current,
      posts: current.posts.map(post => post.id !== postId ? post : {
        ...post, likes: post.likes.includes(userId) ? post.likes.filter(item => item !== userId) : [...post.likes, userId],
      }),
    }));
  }, [commit, refreshRemoteData]);

  const addComment = useCallback(async (postId, content) => {
    if (remoteSessionRef.current) {
      await postsAPI.addComment(postId, content.trim());
      await refreshRemoteData();
      return;
    }
    const userId = stateRef.current.sessionId;
    await commit(current => ({
      ...current,
      posts: current.posts.map(post => post.id !== postId ? post : {
        ...post, comments: [...post.comments, { id: id("comment"), userId, content: content.trim() }],
      }),
    }));
  }, [commit, refreshRemoteData]);

  const saveJob = useCallback(async jobId => {
    const userId = stateRef.current.sessionId;
    if (remoteSessionRef.current) {
      const job = stateRef.current.jobs.find(item => item.id === jobId);
      await jobsAPI.setSaved(jobId, !(job?.savedBy || []).includes(userId));
      await refreshRemoteData();
      return;
    }
    await commit(current => ({
      ...current,
      jobs: current.jobs.map(job => job.id !== jobId ? job : {
        ...job, savedBy: (job.savedBy || []).includes(userId) ? job.savedBy.filter(item => item !== userId) : [...(job.savedBy || []), userId],
      }),
    }));
  }, [commit, refreshRemoteData]);

  const applyJob = useCallback(async jobId => {
    const userId = stateRef.current.sessionId;
    const user = stateRef.current.users.find(item => item.id === userId);
    const job = stateRef.current.jobs.find(item => item.id === jobId);
    if (!job || job.ownerId === userId) return { success: false, error: "Esta vaga não está disponível para candidatura." };
    if ((job.applications || []).some(item => item.userId === userId)) return { success: false, error: "Você já se candidatou a esta vaga." };
    if (remoteSessionRef.current) {
      try {
        const response = await jobsAPI.apply(jobId, {});
        await refreshRemoteData();
        return { success: true, priority: !!response.data.data.isPriority };
      } catch (error) {
        return { success: false, error: error.response?.data?.error || error.message || "Não foi possível enviar a candidatura." };
      }
    }
    const application = { id: id("application"), userId, priority: isVip(user), createdAt: new Date().toISOString() };
    await commit(current => ({
      ...current,
      jobs: current.jobs.map(item => item.id === jobId ? { ...item, applications: [...(item.applications || []), application] } : item),
    }));
    return { success: true, priority: application.priority };
  }, [commit, refreshRemoteData]);

  const reserveProduct = useCallback(async productId => {
    const userId = stateRef.current.sessionId;
    const product = stateRef.current.products.find(item => item.id === productId);
    if (!product || product.reservedBy) return { success: false, error: "Este produto já foi reservado." };
    if (remoteSessionRef.current) {
      try {
        await productsAPI.reserve(productId);
        await refreshRemoteData();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.response?.data?.error || error.message || "Não foi possível reservar o produto." };
      }
    }
    await commit(current => ({ ...current, products: current.products.map(item => item.id === productId ? { ...item, reservedBy: userId } : item) }));
    return { success: true };
  }, [commit, refreshRemoteData]);

  const getOrCreateConversation = useCallback(async otherUserId => {
    const ownId = stateRef.current.sessionId;
    if (!ownId || !otherUserId || ownId === otherUserId) throw new Error("Não é possível iniciar esta conversa.");
    if (remoteSessionRef.current) {
      try {
        const response = await messagesAPI.getOrCreateConversation(otherUserId);
        const conversation = normalizeConversation(response.data.data, ownId);
        await commit(current => {
          const exists = current.conversations.some(item => item.id === conversation.id);
          return {
            ...current,
            users: conversation.otherUser && !current.users.some(item => item.id === conversation.otherUser.id)
              ? [...current.users, conversation.otherUser]
              : current.users,
            conversations: exists
              ? current.conversations.map(item => item.id === conversation.id ? { ...item, ...conversation } : item)
              : [...current.conversations, conversation],
          };
        });
        return conversation;
      } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Não foi possível iniciar a conversa.");
      }
    }
    let conversation = stateRef.current.conversations.find(item => item.members.includes(ownId) && item.members.includes(otherUserId));
    if (!conversation) {
      conversation = { id: id("conversation"), members: [ownId, otherUserId], messages: [] };
      await commit(current => ({ ...current, conversations: [...current.conversations, conversation] }));
    }
    return conversation;
  }, [commit]);

  const sendMessage = useCallback(async (conversationId, content) => {
    const ownId = stateRef.current.sessionId;
    const conversation = stateRef.current.conversations.find(item => item.id === conversationId);
    if (!conversation) throw new Error("Conversa não encontrada.");
    let message = { id: id("message"), senderId: ownId, content: content.trim(), createdAt: new Date().toISOString() };
    if (remoteSessionRef.current) {
      const receiverId = conversation.members.find(memberId => memberId !== ownId);
      try {
        const response = await messagesAPI.sendMessage(conversationId, { content: content.trim(), receiverId });
        message = {
          ...response.data.data,
          id: String(response.data.data.id),
          senderId: String(response.data.data.senderId),
          content: response.data.data.content,
        };
      } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Não foi possível enviar a mensagem.");
      }
    }
    await commit(current => ({
      ...current,
      conversations: current.conversations.map(conversation => conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, message] } : conversation),
    }));
    return message;
  }, [commit]);

  const subscribeVip = useCallback(async (days, paymentMethod = "pix") => {
    const user = stateRef.current.users.find(item => item.id === stateRef.current.sessionId);
    if (!user) throw new Error("Entre para assinar o VIP.");
    if (remoteSessionRef.current) {
      const plan = days === 7 ? "weekly" : "monthly";
      try {
        const response = await vipAPI.subscribe({
          plan,
          paymentMethod,
        });
        const vipUntil = response.data.data.vipUntil || response.data.data.subscription?.expiresAt;
        await commit(current => ({
          ...current,
          users: current.users.map(item => item.id === user.id ? { ...item, vipUntil } : item),
        }));
        return;
      } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Não foi possível ativar o VIP.");
      }
    }
    const start = isVip(user) ? new Date(user.vipUntil).getTime() : Date.now();
    await updateUser({ vipUntil: new Date(start + days * 86400000).toISOString() });
  }, [commit, updateUser]);

  const deleteOwnItem = useCallback(async (kind, itemId) => {
    if (!["posts", "jobs", "products"].includes(kind)) return;
    const userId = stateRef.current.sessionId;
    if (remoteSessionRef.current) {
      if (kind === "posts") await postsAPI.delete(itemId);
      else if (kind === "jobs") await jobsAPI.delete(itemId);
      else await productsAPI.delete(itemId);
      await refreshRemoteData();
      return;
    }
    await commit(current => ({ ...current, [kind]: current[kind].filter(item => item.id !== itemId || item.ownerId !== userId) }));
  }, [commit, refreshRemoteData]);

  const value = useMemo(() => ({
    user: currentUser, data: state, loading, signed: !!currentUser,
    isVip: isVip(currentUser), hasVip: isVip, userById, login, register, requestPasswordReset, resetPassword,
    continueAsGuest, logout, updateUser, cancelVip, createPost, createJob, createProduct,
    toggleLike, addComment, saveJob, applyJob, reserveProduct, getOrCreateConversation,
    sendMessage, subscribeVip, deleteOwnItem,
  }), [currentUser, state, loading, userById, login, register, requestPasswordReset, resetPassword, continueAsGuest, logout, updateUser, cancelVip, createPost, createJob, createProduct, toggleLike, addComment, saveJob, applyJob, reserveProduct, getOrCreateConversation, sendMessage, subscribeVip, deleteOwnItem]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
