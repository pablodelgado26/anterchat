import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

// Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import FeedScreen from "../screens/Feed/FeedScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import JobsScreen from "../screens/Jobs/JobsScreen";
import ChatScreen from "../screens/Chat/ChatScreen";
import ConversationScreen from "../screens/Chat/ConversationScreen";
import PostDetailScreen from "../screens/Feed/PostDetailScreen";
import CreatePostScreen from "../screens/Feed/CreatePostScreen";
import CreateJobScreen from "../screens/Jobs/CreateJobScreen";
import JobDetailScreen from "../screens/Jobs/JobDetailScreen";
import ApplyJobScreen from "../screens/Jobs/ApplyJobScreen";
import ConnectionsScreen from "../screens/Profile/ConnectionsScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import NotificationsScreen from "../screens/Notifications/NotificationsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação por abas (Bottom Tabs)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarLabel: "Vagas",
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "Mensagens",
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Notificações",
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navegação principal (Stack)
export default function Navigation() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textWhite,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {!signed ? (
          // Telas de autenticação
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Criar Conta" }}
            />
          </>
        ) : (
          // Telas autenticadas
          <>
            {/* Navegação principal */}
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />

            {/* Telas modais/detalhes */}
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ title: "Publicação" }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ title: "Nova Publicação" }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: "Vaga" }}
            />
            <Stack.Screen
              name="CreateJob"
              component={CreateJobScreen}
              options={{ title: "Publicar Vaga" }}
            />
            <Stack.Screen
              name="ApplyJob"
              component={ApplyJobScreen}
              options={{ title: "Candidatar-se" }}
            />
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Connections"
              component={ConnectionsScreen}
              options={{ title: "Conexões" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: "Editar Perfil" }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: "Pesquisar" }}
            />
            <Stack.Screen
              name="UserProfile"
              component={ProfileScreen}
              options={({ route }) => ({
                title: route.params?.userName || "Perfil",
                headerShown: true,
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
