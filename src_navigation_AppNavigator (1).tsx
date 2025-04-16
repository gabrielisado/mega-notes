"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen"
import RegisterScreen from "../screens/auth/RegisterScreen"

// Main screens
import HomeScreen from "../screens/main/HomeScreen"
import NoteScreen from "../screens/main/NoteScreen"
import SearchScreen from "../screens/main/SearchScreen"
import SettingsScreen from "../screens/main/SettingsScreen"

// Define navigation param types
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Note: { noteId: string; title: string }
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainTabParamList = {
  Home: undefined
  Search: undefined
  Settings: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const AuthStack = createStackNavigator<AuthStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// Auth navigator
const AuthNavigator = () => {
  const { theme } = useTheme()

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          elevation: 5,
        },
        headerTintColor: theme.text,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  )
}

// Main tab navigator
const MainTabNavigator = () => {
  const { theme } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondaryText,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

// Root navigator
const AppNavigator = () => {
  const { user, loading } = useAuth()
  const { theme } = useTheme()

  if (loading) {
    // You could return a loading screen here
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
            shadowColor: theme.shadow,
            elevation: 5,
          },
          headerTintColor: theme.text,
          cardStyle: { backgroundColor: theme.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="Note"
              component={NoteScreen}
              options={({ route }) => ({
                title: route.params?.title || "Note",
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
