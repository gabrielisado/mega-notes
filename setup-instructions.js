import { execSync } from 'child_process';
import fs from 'fs';

console.log("MegaNotes App Setup Process\n");

// Step 1: Install Expo CLI globally if not already installed
console.log("Step 1: Installing Expo CLI globally...");
console.log("Command: npm install -g expo-cli");
console.log("Note: You'll need to run this command in your terminal\n");

// Step 2: Initialize a new Expo project
console.log("Step 2: Creating a new Expo project...");
console.log("Command: npx create-expo-app MegaNotes");
console.log("Note: This will create a new directory called 'MegaNotes'\n");

// Step 3: Navigate to the project directory
console.log("Step 3: Navigate to the project directory...");
console.log("Command: cd MegaNotes\n");

// Step 4: Install required dependencies
console.log("Step 4: Installing required dependencies...");
console.log(`Command: npx expo install 
  react-native-sqlite-storage 
  @supabase/supabase-js 
  @react-navigation/native 
  @react-navigation/stack 
  @react-navigation/bottom-tabs
  react-native-markdown-display
  react-native-paper
  react-native-vector-icons
  react-native-gesture-handler
  react-native-reanimated
  react-native-safe-area-context
  react-native-screens
  expo-secure-store
  expo-file-system
  expo-sqlite
  @expo/vector-icons
`);

// Step 5: Install dev dependencies
console.log("\nStep 5: Installing development dependencies...");
console.log(`Command: npm install --save-dev 
  typescript 
  @types/react 
  @types/react-native
`);

console.log("\nAfter completing these steps, your project will be set up and ready for development.");
console.log("You can start the development server with: npx expo start");
