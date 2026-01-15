import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vagas de Emprego</Text>
      <Text style={styles.subtext}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  subtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
