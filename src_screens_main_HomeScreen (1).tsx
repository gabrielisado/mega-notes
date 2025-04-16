"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useData } from "../../context/DataContext"
import type { RootStackParamList } from "../../navigation/AppNavigator"
import FolderItem from "../../components/FolderItem"
import NoteItem from "../../components/NoteItem"
import FloatingActionButton from "../../components/FloatingActionButton"

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const { theme } = useTheme()
  const {
    folders,
    notes,
    loading,
    currentFolder,
    folderPath,
    navigateToFolder,
    createFolder,
    createNote,
    deleteFolder,
    deleteNote,
  } = useData()

  const [refreshing, setRefreshing] = useState(false)

  // Get current folders and notes based on current folder
  const currentFolders = folders.filter((folder) => folder.parent_id === (currentFolder?.id || null))
  const currentNotes = notes.filter((note) => note.folder_id === (currentFolder?.id || null))

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await navigateToFolder(currentFolder?.id || null)
    setRefreshing(false)
  }

  // Handle folder navigation
  const handleFolderPress = (folderId: string) => {
    navigateToFolder(folderId)
  }

  // Handle note navigation
  const handleNotePress = (noteId: string, title: string) => {
    navigation.navigate("Note", { noteId, title })
  }

  // Handle create folder
  const handleCreateFolder = () => {
    Alert.prompt("Create Folder", "Enter folder name:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async (name) => {
          if (name) {
            try {
              await createFolder(name, currentFolder?.id || null)
            } catch (error) {
              Alert.alert("Error", "Failed to create folder")
              console.error(error)
            }
          }
        },
      },
    ])
  }

  // Handle create note
  const handleCreateNote = () => {
    Alert.prompt("Create Note", "Enter note title:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async (title) => {
          if (title) {
            try {
              const newNote = await createNote(title, currentFolder?.id || null, true)
              if (newNote) {
                handleNotePress(newNote.id, newNote.title)
              }
            } catch (error) {
              Alert.alert("Error", "Failed to create note")
              console.error(error)
            }
          }
        },
      },
    ])
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
    backButton: {
      marginRight: 16,
      opacity: currentFolder ? 1 : 0.3,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    breadcrumb: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    breadcrumbItem: {
      fontSize: 14,
      color: theme.secondaryText,
    },
    breadcrumbActive: {
      fontSize: 14,
      color: theme.accent,
      fontWeight: "bold",
    },
    breadcrumbSeparator: {
      fontSize: 14,
      color: theme.secondaryText,
      marginHorizontal: 4,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.secondaryText,
      textAlign: "center",
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  })

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToFolder(currentFolder?.parent_id || null)}
          disabled={!currentFolder}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>MegaNotes</Text>
      </View>

      {/* Breadcrumb navigation */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity onPress={() => navigateToFolder(null)}>
          <Text style={!currentFolder ? styles.breadcrumbActive : styles.breadcrumbItem}>Home</Text>
        </TouchableOpacity>

        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity onPress={() => navigateToFolder(folder.id)}>
              <Text style={index === folderPath.length - 1 ? styles.breadcrumbActive : styles.breadcrumbItem}>
                {folder.name}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <View style={styles.content}>
        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              {currentFolders.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Folders</Text>
                  <FlatList
                    data={currentFolders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <FolderItem folder={item} onPress={() => handleFolderPress(item.id)} />}
                    horizontal={false}
                    numColumns={2}
                    scrollEnabled={false}
                  />
                </>
              )}

              {currentNotes.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Notes</Text>
                </>
              )}
            </>
          }
          ListEmptyComponent={
            currentFolders.length === 0 && currentNotes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.secondaryText} />
                <Text style={styles.emptyText}>This folder is empty. Create a new folder or note to get started.</Text>
              </View>
            ) : null
          }
          data={currentNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NoteItem note={item} onPress={() => handleNotePress(item.id, item.title)} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
        />
      </View>

      <FloatingActionButton onCreateFolder={handleCreateFolder} onCreateNote={handleCreateNote} />
    </View>
  )
}

export default HomeScreen
