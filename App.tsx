import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider } from "./src/context/ThemeContext"
import { AuthProvider } from "./src/context/AuthContext"
import { DataProvider } from "./src/context/DataContext"
import { AIProvider } from "./src/context/AIContext"
import AppNavigator from "./src/navigation/AppNavigator"

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AIProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </AIProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
