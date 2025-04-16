"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import type { AuthStackParamList } from "../../navigation/AppNavigator"

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Login">

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>()
  const { theme } = useTheme()
  const { signIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        Alert.alert("Error", error.message)
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 60,
      marginBottom: 40,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.secondaryText,
      textAlign: "center",
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    footer: {
      marginTop: 30,
      alignItems: "center",
    },
    footerText: {
      color: theme.secondaryText,
      fontSize: 14,
    },
    link: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 5,
    },
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={{ uri: "https://placeholder.svg?height=100&width=100" }} style={styles.logo} />
        <Text style={styles.title}>MegaNotes</Text>
        <Text style={styles.subtitle}>Your cozy place for notes and ideas</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={theme.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={theme.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen
