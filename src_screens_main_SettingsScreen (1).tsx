"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { supabase } from "../../lib/supabase"

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", icon: "logo-github" },
  { id: "gemini", name: "Google Gemini", icon: "logo-google" },
  { id: "deepseek", name: "DeepSeek", icon: "planet-outline" },
  { id: "llama", name: "Llama", icon: "flame-outline" },
]

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const [aiConfigs, setAiConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Load AI configurations
  useEffect(() => {
    const loadAiConfigs = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("ai_configs").select("*").eq("user_id", user.id)

        if (error) throw error

        // Create default configs for providers that don't have one
        const existingProviders = data.map((config) => config.provider)
        const missingProviders = AI_PROVIDERS.filter((provider) => !existingProviders.includes(provider.id))

        if (missingProviders.length > 0) {
          const newConfigs = missingProviders.map((provider) => ({
            user_id: user.id,
            provider: provider.id,
            api_key: "",
            is_active: false,
          }))

          const { error: insertError } = await supabase.from("ai_configs").insert(newConfigs)

          if (insertError) throw insertError

          // Reload configs
          const { data: updatedData, error: reloadError } = await supabase
            .from("ai_configs")
            .select("*")
            .eq("user_id", user.id)

          if (reloadError) throw reloadError

          setAiConfigs(updatedData)
        } else {
          setAiConfigs(data)
        }
      } catch (error) {
        console.error("Error loading AI configurations:", error)
        Alert.alert("Error", "Failed to load AI configurations")
      } finally {
        setLoading(false)
      }
    }

    loadAiConfigs()
  }, [user])

  // Handle toggle AI provider
  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    if (!user) return

    try {
      // Update local state first for immediate feedback
      setAiConfigs((prev) =>
        prev.map((config) => (config.provider === providerId ? { ...config, is_active: isActive } : config)),
      )

      // Update in database
      const { error } = await supabase
        .from("ai_configs")
        .update({ is_active: isActive })
        .eq("user_id", user.id)
        .eq("provider", providerId)

      if (error) throw error
    } catch (error) {
      console.error("Error toggling AI provider:", error)
      Alert.alert("Error", "Failed to update AI provider settings")

      // Revert local state on error
      setAiConfigs((prev) =>
        prev.map((config) => (config.provider === providerId ? { ...config, is_active: !isActive } : config)),
      )
    }
  }

  // Handle save API key
  const handleSaveApiKey = async () => {
    if (!user || !editingProvider) return

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("ai_configs")
        .update({ api_key: apiKey })
        .eq("user_id", user.id)
        .eq("provider", editingProvider)

      if (error) throw error

      // Update local state
      setAiConfigs((prev) =>
        prev.map((config) => (config.provider === editingProvider ? { ...config, api_key: apiKey } : config)),
      )

      setEditingProvider(null)
      setApiKey("")
    } catch (error) {
      console.error("Error saving API key:", error)
      Alert.alert("Error", "Failed to save API key")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle edit API key
  const handleEditApiKey = (providerId: string, currentKey: string) => {
    setEditingProvider(providerId)
    setApiKey(currentKey)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    rowIcon: {
      marginRight: 12,
    },
    rowText: {
      fontSize: 16,
      color: theme.text,
    },
    apiKeyContainer: {
      marginTop: 8,
      marginBottom: 8,
    },
    apiKeyInput: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    apiKeyButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    apiKeyButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 4,
      marginLeft: 8,
    },
    apiKeyButtonText: {
      fontSize: 14,
      fontWeight: "bold",
    },
    cancelButton: {
      backgroundColor: theme.error + "20",
    },
    cancelButtonText: {
      color: theme.error,
    },
    saveButton: {
      backgroundColor: theme.success + "20",
    },
    saveButtonText: {
      color: theme.success,
    },
    editButton: {
      backgroundColor: theme.accent + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    },
    editButtonText: {
      fontSize: 14,
      color: theme.accent,
      fontWeight: "bold",
    },
    signOutButton: {
      backgroundColor: theme.error + "10",
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 24,
    },
    signOutText: {
      color: theme.error,
      fontSize: 16,
      fontWeight: "bold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    userInfo: {
      alignItems: "center",
      marginBottom: 16,
    },
    userEmail: {
      fontSize: 16,
      color: theme.text,
      marginTop: 8,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {user && (
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={64} color={theme.text} />
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.text} style={styles.rowIcon} />
              <Text style={styles.rowText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.accent + "80" }}
              thumbColor={isDark ? theme.accent : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Assistants</Text>

          {AI_PROVIDERS.map((provider, index) => {
            const config = aiConfigs.find((c) => c.provider === provider.id)
            const isLast = index === AI_PROVIDERS.length - 1
            const isEditing = editingProvider === provider.id

            return (
              <View key={provider.id}>
                <View style={[styles.row, isLast && styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Ionicons name={provider.icon} size={24} color={theme.text} style={styles.rowIcon} />
                    <Text style={styles.rowText}>{provider.name}</Text>
                  </View>

                  <Switch
                    value={config?.is_active || false}
                    onValueChange={(value) => handleToggleProvider(provider.id, value)}
                    trackColor={{ false: "#767577", true: theme.accent + "80" }}
                    thumbColor={config?.is_active ? theme.accent : "#f4f3f4"}
                    disabled={!config?.api_key}
                  />
                </View>

                {isEditing ? (
                  <View style={styles.apiKeyContainer}>
                    <TextInput
                      style={styles.apiKeyInput}
                      value={apiKey}
                      onChangeText={setApiKey}
                      placeholder="Enter API Key"
                      placeholderTextColor={theme.secondaryText}
                      secureTextEntry
                    />
                    <View style={styles.apiKeyButtons}>
                      <TouchableOpacity
                        style={[styles.apiKeyButton, styles.cancelButton]}
                        onPress={() => {
                          setEditingProvider(null)
                          setApiKey("")
                        }}
                      >
                        <Text style={[styles.apiKeyButtonText, styles.cancelButtonText]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.apiKeyButton, styles.saveButton]}
                        onPress={handleSaveApiKey}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color={theme.success} />
                        ) : (
                          <Text style={[styles.apiKeyButtonText, styles.saveButtonText]}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: "flex-end", marginTop: 4, marginBottom: 12 }}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditApiKey(provider.id, config?.api_key || "")}
                    >
                      <Text style={styles.editButtonText}>{config?.api_key ? "Edit API Key" : "Add API Key"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          })}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default SettingsScreen
