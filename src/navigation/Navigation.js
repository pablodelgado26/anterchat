import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import ConversationScreen from "../screens/Chat/ConversationScreen";
import PostDetailScreen from "../screens/Feed/PostDetailScreen";
import CreatePostScreen from "../screens/Feed/CreatePostScreen";
import CreateJobScreen from "../screens/Jobs/CreateJobScreen";
import JobDetailScreen from "../screens/Jobs/JobDetailScreen";
import ApplyJobScreen from "../screens/Jobs/ApplyJobScreen";
import ConnectionsScreen from "../screens/Profile/ConnectionsScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import {
  CommunityChatScreen,
  CommunityConversationScreen,
  CommunityEditProfileScreen,
  CommunityHomeScreen,
  CommunityJobsScreen,
  CommunityProductsScreen,
  CommunityProfileScreen,
  CommunityVipScreen,
  CreateContentScreen,
} from "../screens/Community/CommunityScreens";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const names = {
            Feed: "home-variant-outline",
            Jobs: "briefcase-outline",
            Products: "tag-outline",
            Chat: "message-text-outline",
            VIP: "star-circle-outline",
            Profile: "account-outline",
          };

          return <Icon name={names[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={CommunityHomeScreen} options={{ tabBarLabel: "Início" }} />
      <Tab.Screen name="Jobs" component={CommunityJobsScreen} options={{ tabBarLabel: "Vagas" }} />
      <Tab.Screen name="Products" component={CommunityProductsScreen} options={{ tabBarLabel: "Produtos" }} />
      <Tab.Screen name="Chat" component={CommunityChatScreen} options={{ tabBarLabel: "Chat" }} />
      <Tab.Screen name="VIP" component={CommunityVipScreen} options={{ tabBarLabel: "VIP" }} />
      <Tab.Screen
        name="Profile"
        component={CommunityProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: ["anterachat://"],
        config: {
          screens: {
            Login: "",
            ForgotPassword: {
              path: "reset-password",
              parse: { token: value => value },
            },
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: styles.headerTitle,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!signed ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Criar conta" }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: "Redefinir senha" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateContent"
              component={CreateContentScreen}
              options={{ title: "Publicar" }}
            />
            <Stack.Screen
              name="CommunityConversation"
              component={CommunityConversationScreen}
              options={{ title: "Conversa", headerShown: false }}
            />
            <Stack.Screen
              name="CommunityEditProfile"
              component={CommunityEditProfileScreen}
              options={{ title: "Editar perfil" }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ title: "Novo post" }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ title: "Publicacao" }}
            />
            <Stack.Screen
              name="CreateJob"
              component={CreateJobScreen}
              options={{ title: "Nova vaga" }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: "Detalhes da vaga" }}
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
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: "Editar perfil" }}
            />
            <Stack.Screen
              name="Connections"
              component={ConnectionsScreen}
              options={{ title: "Rede profissional" }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: "Buscar pessoas" }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: "Redefinir senha" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.backgroundAlt,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  tabBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 12,
    height: 66,
    maxWidth: 980,
    alignSelf: "center",
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 5,
    paddingBottom: 5,
    ...SHADOWS.soft,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
});
