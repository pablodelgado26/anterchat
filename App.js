import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import Navigation from "./src/navigation/Navigation";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" backgroundColor="#0E7C66" />
      <Navigation />
    </AuthProvider>
  );
}
