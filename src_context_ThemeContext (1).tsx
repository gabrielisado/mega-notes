"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define theme colors
const lightTheme = {
  background: "#F9F7F3",
  card: "#FFFFFF",
  text: "#333333",
  secondaryText: "#666666",
  accent: "#E57373", // Warm red for cozy feel
  border: "#E0E0E0",
  shadow: "rgba(0, 0, 0, 0.1)",
  success: "#81C784",
  error: "#E57373",
  folderIcon: "#FFB74D", // Warm orange for folders
  noteIcon: "#90CAF9", // Soft blue for notes
}

const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E0E0E0",
  secondaryText: "#AAAAAA",
  accent: "#F48FB1", // Soft pink for cozy dark mode
  border: "#333333",
  shadow: "rgba(0, 0, 0, 0.3)",
  success: "#66BB6A",
  error: "#EF5350",
  folderIcon: "#FFB74D", // Keep folder color consistent
  noteIcon: "#64B5F6", // Slightly darker blue for notes
}

type Theme = typeof lightTheme

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? darkTheme : lightTheme

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme")
        if (storedTheme !== null) {
          setIsDark(storedTheme === "dark")
        } else {
          // Use system preference if no stored preference
          setIsDark(systemColorScheme === "dark")
        }
      } catch (error) {
        console.error("Error loading theme preference:", error)
      }
    }

    loadThemePreference()
  }, [systemColorScheme])

  const toggleTheme = async () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light")
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
