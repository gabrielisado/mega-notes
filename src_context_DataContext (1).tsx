"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"
import type { Folder, Note } from "../types/database"

type DataContextType = {
  folders: Folder[]
  notes: Note[]
  loading: boolean
  currentFolder: Folder | null
  folderPath: Folder[]
  navigateToFolder: (folderId: string | null) => void
  createFolder: (name: string, parentId: string | null) => Promise<Folder | null>
  createNote: (title: string, folderId: string | null, isMarkdown: boolean) => Promise<Note | null>
  updateNote: (id: string, data: Partial<Note>) => Promise<Note | null>
  deleteFolder: (id: string) => Promise<boolean>
  deleteNote: (id: string) => Promise<boolean>
  searchNotes: (query: string) => Promise<Note[]>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [folderPath, setFolderPath] = useState<Folder[]>([])

  // Load folders and notes when user changes
  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setFolders([])
      setNotes([])
      setCurrentFolder(null)
      setFolderPath([])
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Load folders
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (folderError) throw folderError

      // Load notes
      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (noteError) throw noteError

      setFolders(folderData)
      setNotes(noteData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to a folder and update the folder path
  const navigateToFolder = async (folderId: string | null) => {
    if (!folderId) {
      // Root folder
      setCurrentFolder(null)
      setFolderPath([])
      return
    }

    const folder = folders.find((f) => f.id === folderId)
    if (!folder) return

    setCurrentFolder(folder)

    // Build folder path
    const path: Folder[] = [folder]
    let parentId = folder.parent_id

    while (parentId) {
      const parentFolder = folders.find((f) => f.id === parentId)
      if (parentFolder) {
        path.unshift(parentFolder)
        parentId = parentFolder.parent_id
      } else {
        break
      }
    }

    setFolderPath(path)
  }

  // Create a new folder
  const createFolder = async (name: string, parentId: string | null): Promise<Folder | null> => {
    if (!user) return null

    try {
      const newFolder: Omit<Folder, "id" | "created_at" | "updated_at"> = {
        name,
        parent_id: parentId,
        user_id: user.id,
      }

      const { data, error } = await supabase.from("folders").insert(newFolder).select().single()

      if (error) throw error

      const createdFolder = data as Folder
      setFolders((prev) => [...prev, createdFolder])
      return createdFolder
    } catch (error) {
      console.error("Error creating folder:", error)
      return null
    }
  }

  // Create a new note
  const createNote = async (title: string, folderId: string | null, isMarkdown: boolean): Promise<Note | null> => {
    if (!user) return null

    try {
      const newNote: Omit<Note, "id" | "created_at" | "updated_at"> = {
        title,
        content: "",
        folder_id: folderId,
        user_id: user.id,
        is_markdown: isMarkdown,
      }

      const { data, error } = await supabase.from("notes").insert(newNote).select().single()

      if (error) throw error

      const createdNote = data as Note
      setNotes((prev) => [createdNote, ...prev])
      return createdNote
    } catch (error) {
      console.error("Error creating note:", error)
      return null
    }
  }

  // Update a note
  const updateNote = async (id: string, data: Partial<Note>): Promise<Note | null> => {
    try {
      const { data: updatedData, error } = await supabase
        .from("notes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      const updatedNote = updatedData as Note
      setNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))
      return updatedNote
    } catch (error) {
      console.error("Error updating note:", error)
      return null
    }
  }

  // Delete a folder
  const deleteFolder = async (id: string): Promise<boolean> => {
    try {
      // First, check if folder has any notes
      const { data: folderNotes, error: notesError } = await supabase.from("notes").select("id").eq("folder_id", id)

      if (notesError) throw notesError

      if (folderNotes.length > 0) {
        // Delete all notes in the folder
        const { error: deleteNotesError } = await supabase.from("notes").delete().eq("folder_id", id)
        if (deleteNotesError) throw deleteNotesError
      }

      // Check for subfolders
      const { data: subfolders, error: subfoldersError } = await supabase
        .from("folders")
        .select("id")
        .eq("parent_id", id)

      if (subfoldersError) throw subfoldersError

      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteFolder(subfolder.id)
      }

      // Delete the folder itself
      const { error } = await supabase.from("folders").delete().eq("id", id)
      if (error) throw error

      // Update state
      setFolders((prev) => prev.filter((folder) => folder.id !== id))
      setNotes((prev) => prev.filter((note) => note.folder_id !== id))

      // If we're in the deleted folder, navigate to parent
      if (currentFolder?.id === id) {
        navigateToFolder(currentFolder.parent_id)
      }

      return true
    } catch (error) {
      console.error("Error deleting folder:", error)
      return false
    }
  }

  // Delete a note
  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) throw error

      setNotes((prev) => prev.filter((note) => note.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting note:", error)
      return false
    }
  }

  // Search notes
  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!user || !query.trim()) return []

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      return data as Note[]
    } catch (error) {
      console.error("Error searching notes:", error)
      return []
    }
  }

  return (
    <DataContext.Provider
      value={{
        folders,
        notes,
        loading,
        currentFolder,
        folderPath,
        navigateToFolder,
        createFolder,
        createNote,
        updateNote,
        deleteFolder,
        deleteNote,
        searchNotes,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
