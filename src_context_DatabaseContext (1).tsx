"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import * as SQLite from "expo-sqlite"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"

interface Folder {
  id: string
  name: string
  parent_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}

interface Note {
  id: string
  title: string
  content: string
  folder_id: string | null
  user_id: string
  is_markdown: boolean
  created_at: string
  updated_at: string
}

interface DatabaseContextType {
  folders: Folder[]
  notes: Note[]
  loading: boolean
  createFolder: (name: string, parentId: string | null) => Promise<Folder>
  createNote: (title: string, folderId: string | null, isMarkdown: boolean) => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<Note>
  deleteFolder: (id: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  syncWithSupabase: () => Promise<void>
}

const db = SQLite.openDatabase("meganotes.db")

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize local database
  useEffect(() => {
    db.transaction(
      (tx) => {
        // Create folders table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          parent_id TEXT,
          user_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_synced INTEGER DEFAULT 0
        );`,
        )

        // Create notes table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          folder_id TEXT,
          user_id TEXT NOT NULL,
          is_markdown INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_synced INTEGER DEFAULT 0
        );`,
        )
      },
      (error) => {
        console.error("Error creating tables:", error)
      },
      () => {
        loadLocalData()
      },
    )
  }, [])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadLocalData()
      syncWithSupabase()
    } else {
      setFolders([])
      setNotes([])
    }
  }, [user])

  const loadLocalData = () => {
    if (!user) return

    setLoading(true)

    // Load folders
    db.transaction(
      (tx) => {
        tx.executeSql("SELECT * FROM folders WHERE user_id = ?;", [user.id], (_, { rows }) => {
          setFolders(rows._array)
        })

        // Load notes
        tx.executeSql("SELECT * FROM notes WHERE user_id = ?;", [user.id], (_, { rows }) => {
          setNotes(rows._array)
        })
      },
      (error) => {
        console.error("Error loading data:", error)
      },
      () => {
        setLoading(false)
      },
    )
  }

  const syncWithSupabase = async () => {
    if (!user) return

    try {
      // Fetch folders from Supabase
      const { data: remoteFolders, error: foldersError } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)

      if (foldersError) throw foldersError

      // Fetch notes from Supabase
      const { data: remoteNotes, error: notesError } = await supabase.from("notes").select("*").eq("user_id", user.id)

      if (notesError) throw notesError

      // Sync folders to local DB
      db.transaction(
        (tx) => {
          remoteFolders.forEach((folder) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO folders (id, name, parent_id, user_id, created_at, updated_at, is_synced)
             VALUES (?, ?, ?, ?, ?, ?, 1);`,
              [folder.id, folder.name, folder.parent_id, folder.user_id, folder.created_at, folder.updated_at],
            )
          })

          // Sync notes to local DB
          remoteNotes.forEach((note) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO notes (id, title, content, folder_id, user_id, is_markdown, created_at, updated_at, is_synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);`,
              [
                note.id,
                note.title,
                note.content,
                note.folder_id,
                note.user_id,
                note.is_markdown ? 1 : 0,
                note.created_at,
                note.updated_at,
              ],
            )
          })
        },
        (error) => {
          console.error("Error syncing with Supabase:", error)
        },
        () => {
          loadLocalData()
        },
      )
    } catch (error) {
      console.error("Error syncing with Supabase:", error)
    }
  }

  const createFolder = async (name: string, parentId: string | null): Promise<Folder> => {
    if (!user) throw new Error("User not authenticated")

    const now = new Date().toISOString()
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      parent_id: parentId,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    }

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO folders (id, name, parent_id, user_id, created_at, updated_at, is_synced)
           VALUES (?, ?, ?, ?, ?, ?, 0);`,
          [
            newFolder.id,
            newFolder.name,
            newFolder.parent_id,
            newFolder.user_id,
            newFolder.created_at,
            newFolder.updated_at,
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              // Update state
              setFolders((prev) => [...prev, newFolder])

              // Sync with Supabase
              supabase
                .from("folders")
                .insert(newFolder)
                .then(({ error }) => {
                  if (error) console.error("Error syncing folder to Supabase:", error)
                  else {
                    // Mark as synced
                    tx.executeSql("UPDATE folders SET is_synced = 1 WHERE id = ?;", [newFolder.id])
                  }
                })

              resolve(newFolder)
            } else {
              reject(new Error("Failed to create folder"))
            }
          },
          (_, error) => {
            reject(error)
            return false
          },
        )
      })
    })
  }

  const createNote = async (title: string, folderId: string | null, isMarkdown: boolean): Promise<Note> => {
    if (!user) throw new Error("User not authenticated")

    const now = new Date().toISOString()
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content: "",
      folder_id: folderId,
      user_id: user.id,
      is_markdown: isMarkdown,
      created_at: now,
      updated_at: now,
    }

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO notes (id, title, content, folder_id, user_id, is_markdown, created_at, updated_at, is_synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
          [
            newNote.id,
            newNote.title,
            newNote.content,
            newNote.folder_id,
            newNote.user_id,
            newNote.is_markdown ? 1 : 0,
            newNote.created_at,
            newNote.updated_at,
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              // Update state
              setNotes((prev) => [...prev, newNote])

              // Sync with Supabase
              supabase
                .from("notes")
                .insert(newNote)
                .then(({ error }) => {
                  if (error) console.error("Error syncing note to Supabase:", error)
                  else {
                    // Mark as synced
                    tx.executeSql("UPDATE notes SET is_synced = 1 WHERE id = ?;", [newNote.id])
                  }
                })

              resolve(newNote)
            } else {
              reject(new Error("Failed to create note"))
            }
          },
          (_, error) => {
            reject(error)
            return false
          },
        )
      })
    })
  }

  const updateNote = async (id: string, data: Partial<Note>): Promise<Note> => {
    if (!user) throw new Error("User not authenticated")

    const noteToUpdate = notes.find((note) => note.id === id)
    if (!noteToUpdate) throw new Error("Note not found")

    const updatedNote = {
      ...noteToUpdate,
      ...data,
      updated_at: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE notes SET 
           title = ?, 
           content = ?, 
           folder_id = ?, 
           is_markdown = ?, 
           updated_at = ?,
           is_synced = 0
           WHERE id = ?;`,
          [
            updatedNote.title,
            updatedNote.content,
            updatedNote.folder_id,
            updatedNote.is_markdown ? 1 : 0,
            updatedNote.updated_at,
            id,
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              // Update state
              setNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))

              // Sync with Supabase
              supabase
                .from("notes")
                .update(updatedNote)
                .eq("id", id)
                .then(({ error }) => {
                  if (error) console.error("Error syncing note update to Supabase:", error)
                  else {
                    // Mark as synced
                    tx.executeSql("UPDATE notes SET is_synced = 1 WHERE id = ?;", [id])
                  }
                })

              resolve(updatedNote)
            } else {
              reject(new Error("Failed to update note"))
            }
          },
          (_, error) => {
            reject(error)
            return false
          },
        )
      })
    })
  }

  const deleteFolder = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Delete the folder
        tx.executeSql(
          "DELETE FROM folders WHERE id = ?;",
          [id],
          (_, result) => {
            if (result.rowsAffected > 0) {
              // Update state
              setFolders((prev) => prev.filter((folder) => folder.id !== id))

              // Delete from Supabase
              supabase
                .from("folders")
                .delete()
                .eq("id", id)
                .then(({ error }) => {
                  if (error) console.error("Error deleting folder from Supabase:", error)
                })

              resolve()
            } else {
              reject(new Error("Failed to delete folder"))
            }
          },
          (_, error) => {
            reject(error)
            return false
          },
        )
      })
    })
  }

  const deleteNote = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Delete the note
        tx.executeSql(
          "DELETE FROM notes WHERE id = ?;",
          [id],
          (_, result) => {
            if (result.rowsAffected > 0) {
              // Update state
              setNotes((prev) => prev.filter((note) => note.id !== id))

              // Delete from Supabase
              supabase
                .from("notes")
                .delete()
                .eq("id", id)
                .then(({ error }) => {
                  if (error) console.error("Error deleting note from Supabase:", error)
                })

              resolve()
            } else {
              reject(new Error("Failed to delete note"))
            }
          },
          (_, error) => {
            reject(error)
            return false
          },
        )
      })
    })
  }

  return (
    <DatabaseContext.Provider
      value={{
        folders,
        notes,
        loading,
        createFolder,
        createNote,
        updateNote,
        deleteFolder,
        deleteNote,
        syncWithSupabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}
