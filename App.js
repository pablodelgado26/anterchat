import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import Navigation from "./src/navigation/Navigation";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#10B981" />
      <Navigation />
    </AuthProvider>
  );
}
