"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { Note } from "../types/database"

interface NoteItemProps {
  note: Note
  onPress: () => void
}

const NoteItem = ({ note, onPress }: NoteItemProps) => {
  const { theme } = useTheme()

  // Format the date
  const formattedDate = new Date(note.updated_at).toLocaleDateString()

  // Get a preview of the content
  const contentPreview = note.content
    ? note.content.replace(/[#*`]/g, "").substring(0, 50) + (note.content.length > 50 ? "..." : "")
    : "No content"

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    noteIcon: {
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
    },
    content: {
      fontSize: 14,
      color: theme.secondaryText,
      marginBottom: 8,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    date: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    markdownBadge: {
      backgroundColor: theme.accent + "20", // 20% opacity
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    markdownText: {
      fontSize: 10,
      color: theme.accent,
      fontWeight: "bold",
    },
  })

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={20} color={theme.noteIcon} style={styles.noteIcon} />
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
      </View>
      <Text style={styles.content} numberOfLines={2}>
        {contentPreview}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.date}>Updated: {formattedDate}</Text>
        {note.is_markdown && (
          <View style={styles.markdownBadge}>
            <Text style={styles.markdownText}>Markdown</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default NoteItem
