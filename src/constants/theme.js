import { Appearance } from "react-native";

const isDarkMode = Appearance.getColorScheme() === "dark";

export const COLORS = {
  primary: isDarkMode ? "#287E66" : "#176B56",
  primaryDark: isDarkMode ? "#91D6C1" : "#105440",
  primaryDeep: isDarkMode ? "#173D32" : "#104E40",
  primarySoft: isDarkMode ? "#1B3930" : "#E8F3EE",
  primaryGlow: isDarkMode ? "#A6DCC9" : "#C7E4D8",
  background: isDarkMode ? "#101915" : "#F4F7F5",
  backgroundAlt: isDarkMode ? "#19251F" : "#EDF3EF",
  surface: isDarkMode ? "#1A2720" : "#FFFFFF",
  surfaceStrong: isDarkMode ? "#16221C" : "#FBFDFC",
  textPrimary: isDarkMode ? "#EDF4EF" : "#172820",
  textSecondary: isDarkMode ? "#B2C1B8" : "#60736A",
  textMuted: isDarkMode ? "#91A198" : "#839189",
  textWhite: "#FFFFFF",
  border: isDarkMode ? "#2B3A32" : "#E3EBE6",
  shadowDark: isDarkMode ? "rgba(0, 0, 0, 0.28)" : "rgba(24, 54, 41, 0.08)",
  shadowLight: "rgba(255,255,255,0.95)",
  success: "#2F9A78",
  warning: isDarkMode ? "#F4C25D" : "#F2B33D",
  danger: isDarkMode ? "#FF8989" : "#C54E4E",
  info: isDarkMode ? "#78B7FF" : "#5D9CE6",
  overlay: "rgba(10, 37, 23, 0.18)",
};

export const SIZES = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  radiusSm: 12,
  radiusMd: 18,
  radiusLg: 24,
  radiusXl: 32,
  iconSm: 16,
  iconMd: 22,
  iconLg: 28,
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 84,
  h1: 32,
  h2: 26,
  h3: 21,
  body: 16,
  bodySm: 14,
  caption: 12,
};

export const SHADOWS = {
  clay: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 10,
  },
  clayInset: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 0,
  },
  soft: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
};
