"use client"
import { Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { Folder } from "../types/database"

interface FolderItemProps {
  folder: Folder
  onPress: () => void
}

const FolderItem = ({ folder, onPress }: FolderItemProps) => {
  const { theme } = useTheme()

  // Format the date
  const formattedDate = new Date(folder.updated_at).toLocaleDateString()

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      marginRight: 12,
      width: "48%",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    folderIcon: {
      marginBottom: 12,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    date: {
      fontSize: 12,
      color: theme.secondaryText,
    },
  })

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name="folder" size={32} color={theme.folderIcon} style={styles.folderIcon} />
      <Text style={styles.name} numberOfLines={1}>
        {folder.name}
      </Text>
      <Text style={styles.date}>Updated: {formattedDate}</Text>
    </TouchableOpacity>
  )
}

export default FolderItem
