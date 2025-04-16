"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

interface FloatingActionButtonProps {
  onCreateFolder: () => void
  onCreateNote: () => void
}

const FloatingActionButton = ({ onCreateFolder, onCreateNote }: FloatingActionButtonProps) => {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Animation values
  const animation = React.useRef(new Animated.Value(0)).current

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1

    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start()

    setIsOpen(!isOpen)
  }

  // Folder button animation
  const folderButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: animation,
  }

  // Note button animation
  const noteButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: animation,
  }

  // Rotation animation for the main button
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  })

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      right: 24,
      bottom: 24,
      alignItems: "center",
    },
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accent,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      zIndex: 10,
    },
    actionButton: {
      position: "absolute",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
    actionButtonLabel: {
      position: "absolute",
      right: 60,
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    actionButtonText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      display: isOpen ? "flex" : "none",
    },
  })

  return (
    <>
      {isOpen && <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleMenu} activeOpacity={1} />}

      <View style={styles.container}>
        {/* Folder Button */}
        <Animated.View style={[styles.actionButton, folderButtonStyle]}>
          <TouchableOpacity
            onPress={() => {
              toggleMenu()
              onCreateFolder()
            }}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="folder-outline" size={24} color={theme.folderIcon} />
          </TouchableOpacity>
          <Animated.View style={[styles.actionButtonLabel, { opacity: animation }]}>
            <Text style={styles.actionButtonText}>New Folder</Text>
          </Animated.View>
        </Animated.View>

        {/* Note Button */}
        <Animated.View style={[styles.actionButton, noteButtonStyle]}>
          <TouchableOpacity
            onPress={() => {
              toggleMenu()
              onCreateNote()
            }}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="document-text-outline" size={24} color={theme.noteIcon} />
          </TouchableOpacity>
          <Animated.View style={[styles.actionButtonLabel, { opacity: animation }]}>
            <Text style={styles.actionButtonText}>New Note</Text>
          </Animated.View>
        </Animated.View>

        {/* Main Button */}
        <TouchableOpacity style={styles.button} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default FloatingActionButton
