"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"
import type { AIConfig } from "../types/database"

type AIContextType = {
  aiConfigs: AIConfig[]
  loading: boolean
  updateAIConfig: (id: string, data: Partial<AIConfig>) => Promise<AIConfig | null>
  getActiveAIConfig: () => AIConfig | null
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([])
  const [loading, setLoading] = useState(true)

  // Load AI configurations when user changes
  useEffect(() => {
    if (user) {
      loadAIConfigs()
    } else {
      setAIConfigs([])
    }
  }, [user])

  const loadAIConfigs = async () => {
    if (!user) return

    setLoading(true)

    try {
      const { data, error } = await supabase.from("ai_configs").select("*").eq("user_id", user.id)

      if (error) throw error

      setAIConfigs(data as AIConfig[])
    } catch (error) {
      console.error("Error loading AI configurations:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAIConfig = async (id: string, data: Partial<AIConfig>): Promise<AIConfig | null> => {
    try {
      const { data: updatedData, error } = await supabase
        .from("ai_configs")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      const updatedConfig = updatedData as AIConfig
      setAIConfigs((prev) => prev.map((config) => (config.id === id ? updatedConfig : config)))
      return updatedConfig
    } catch (error) {
      console.error("Error updating AI configuration:", error)
      return null
    }
  }

  const getActiveAIConfig = (): AIConfig | null => {
    return aiConfigs.find((config) => config.is_active) || null
  }

  return (
    <AIContext.Provider value={{ aiConfigs, loading, updateAIConfig, getActiveAIConfig }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}
