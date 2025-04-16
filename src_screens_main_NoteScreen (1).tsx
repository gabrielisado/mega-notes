"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import Markdown from "react-native-markdown-display"
import { useTheme } from "../../context/ThemeContext"
import { useData } from "../../context/DataContext"
import type { RootStackParamList } from "../../navigation/AppNavigator"

type NoteScreenRouteProp = RouteProp<RootStackParamList, "Note">

const NoteScreen = () => {
  const route = useRoute<NoteScreenRouteProp>()
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { notes, updateNote } = useData()

  const { noteId, title } = route.params

  const [note, setNote] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load note data
  useEffect(() => {
    const foundNote = notes.find((n) => n.id === noteId)
    if (foundNote) {
      setNote(foundNote)
      setEditedTitle(foundNote.title)
      setEditedContent(foundNote.content || "")
    }
  }, [noteId, notes])

  // Update navigation header title
  useEffect(() => {
    navigation.setOptions({
      title: editedTitle || "New Note",
    })
  }, [editedTitle, navigation])

  // Handle save
  const handleSave = async () => {
    if (!note) return

    setIsSaving(true)

    try {
      await updateNote(note.id, {
        title: editedTitle,
        content: editedContent,
      })

      setIsEditing(false)
    } catch (error) {
      Alert.alert("Error", "Failed to save note")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    toolbarButton: {
      padding: 8,
    },
    toolbarTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    titleInput: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    contentInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      textAlignVertical: "top",
    },
    markdownContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    timestamp: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 8,
      textAlign: "right",
    },
  })

  if (!note) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.toolbar}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => {
                setEditedTitle(note.title)
                setEditedContent(note.content || "")
                setIsEditing(false)
              }}
            >
              <Ionicons name="close" size={24} color={theme.error} />
            </TouchableOpacity>

            <Text style={styles.toolbarTitle}>{isMarkdownPreview ? "Preview" : "Edit"}</Text>

            <View style={{ flexDirection: "row" }}>
              {note.is_markdown && (
                <TouchableOpacity style={styles.toolbarButton} onPress={() => setIsMarkdownPreview(!isMarkdownPreview)}>
                  <Ionicons name={isMarkdownPreview ? "create-outline" : "eye-outline"} size={24} color={theme.text} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.toolbarButton} onPress={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <Ionicons name="checkmark" size={24} color={theme.success} />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.toolbarButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={styles.toolbarTitle}>{note.is_markdown ? "Markdown Note" : "Text Note"}</Text>

            <TouchableOpacity style={styles.toolbarButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Note Title"
              placeholderTextColor={theme.secondaryText}
            />

            {isMarkdownPreview && note.is_markdown ? (
              <ScrollView style={styles.markdownContainer}>
                <Markdown
                  style={{
                    body: { color: theme.text, fontSize: 16 },
                    heading1: { color: theme.text, fontSize: 24, fontWeight: "bold", marginBottom: 16 },
                    heading2: { color: theme.text, fontSize: 20, fontWeight: "bold", marginBottom: 12 },
                    heading3: { color: theme.text, fontSize: 18, fontWeight: "bold", marginBottom: 8 },
                    paragraph: { color: theme.text, fontSize: 16, marginBottom: 16 },
                    link: { color: theme.accent },
                    blockquote: {
                      backgroundColor: theme.border + "40",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: theme.accent,
                    },
                  }}
                >
                  {editedContent}
                </Markdown>
              </ScrollView>
            ) : (
              <TextInput
                style={styles.contentInput}
                value={editedContent}
                onChangeText={setEditedContent}
                placeholder="Start writing..."
                placeholderTextColor={theme.secondaryText}
                multiline
              />
            )}
          </>
        ) : (
          <ScrollView>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>{note.title}</Text>

            {note.is_markdown ? (
              <Markdown
                style={{
                  body: { color: theme.text, fontSize: 16 },
                  heading1: { color: theme.text, fontSize: 24, fontWeight: "bold", marginBottom: 16 },
                  heading2: { color: theme.text, fontSize: 20, fontWeight: "bold", marginBottom: 12 },
                  heading3: { color: theme.text, fontSize: 18, fontWeight: "bold", marginBottom: 8 },
                  paragraph: { color: theme.text, fontSize: 16, marginBottom: 16 },
                  link: { color: theme.accent },
                  blockquote: {
                    backgroundColor: theme.border + "40",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.accent,
                  },
                }}
              >
                {note.content || ""}
              </Markdown>
            ) : (
              <Text style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}>{note.content || ""}</Text>
            )}

            <Text style={styles.timestamp}>Last updated: {new Date(note.updated_at).toLocaleString()}</Text>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

export default NoteScreen
