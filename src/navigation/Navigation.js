import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SHADOWS, SIZES } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

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
            Chat: "message-text-outline",
            Notifications: "bell-outline",
            Profile: "account-outline",
          };

          return <Icon name={names[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: "Feed" }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: "Vagas" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: "Chat" }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: "Alertas" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
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
    <NavigationContainer>
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
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
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
              name="UserProfile"
              component={ProfileScreen}
              options={{ title: "Perfil" }}
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
    left: 14,
    right: 14,
    bottom: 18,
    height: 76,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    ...SHADOWS.soft,
  },
  tabLabel: {
    fontSize: SIZES.caption,
    fontWeight: "700",
  },
});
