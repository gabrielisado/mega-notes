"use client"

import { Alert } from "@/components/ui/alert"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useDatabase } from "../../context/DatabaseContext"
import NoteItem from "../../components/NoteItem"

const SearchScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { notes, folders, loading } = useDatabase()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Simulate search delay
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase()

      // Search in notes
      const matchedNotes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) || (note.content && note.content.toLowerCase().includes(query)),
      )

      // Search in folders
      const matchedFolders = folders.filter((folder) => folder.name.toLowerCase().includes(query))

      // Combine results
      const results = [
        ...matchedNotes.map((note) => ({ ...note, type: "note" })),
        ...matchedFolders.map((folder) => ({ ...folder, type: "folder" })),
      ]

      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, notes, folders])

  // Handle item press
  const handleItemPress = (item: any) => {
    if (item.type === "note") {
      navigation.navigate("Note" as never, { noteId: item.id, title: item.title } as never)
    } else {
      // Navigate to folder in HomeScreen
      // This would require state management or navigation params
      // For now, we'll just show an alert
      Alert.alert("Folder Selected", `You selected the folder: ${item.name}`)
    }
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
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: theme.text,
      fontSize: 16,
    },
    clearButton: {
      padding: 4,
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
    folderItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
    },
    folderIcon: {
      marginRight: 12,
    },
    folderName: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "bold",
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
      padding: 20,
      alignItems: "center",
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes and folders..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : searchQuery.length > 0 ? (
          searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) =>
                item.type === "note" ? (
                  <NoteItem note={item} onPress={() => handleItemPress(item)} />
                ) : (
                  <TouchableOpacity style={styles.folderItem} onPress={() => handleItemPress(item)}>
                    <Ionicons name="folder" size={24} color={theme.folderIcon} style={styles.folderIcon} />
                    <Text style={styles.folderName}>{item.name}</Text>
                  </TouchableOpacity>
                )
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.secondaryText} />
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={theme.secondaryText} />
            <Text style={styles.emptyText}>Search for notes and folders</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default SearchScreen
