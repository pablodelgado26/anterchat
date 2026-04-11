import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, SHADOWS, SIZES } from "../constants/theme";
import { getInitials } from "../utils/formatters";

export function ClayScreen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function ClayCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ClayButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  style,
  textStyle,
  disabled,
}) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.textWhite : COLORS.primary} />
      ) : (
        <>
          {icon ? (
            <Icon
              name={icon}
              size={18}
              color={isPrimary ? COLORS.textWhite : COLORS.primary}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            style={[
              styles.buttonText,
              isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function ClayInput({
  label,
  hint,
  multiline,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function AvatarBadge({ name, uri, size = SIZES.avatarMd }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  ) : (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

export function SectionTitle({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = "sprout-outline", title, subtitle }) {
  return (
    <ClayCard style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Icon name={icon} size={30} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </ClayCard>
  );
}

export function SegmentedTabs({ options, value, onChange, style }) {
  return (
    <ClayCard style={[styles.segment, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segmentOption, active && styles.segmentOptionActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ClayCard>
  );
}

export function StatPill({ label, value, icon }) {
  return (
    <ClayCard style={styles.statPill}>
      {icon ? <Icon name={icon} size={18} color={COLORS.primary} /> : null}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </ClayCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  button: {
    minHeight: 52,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: SIZES.body,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: COLORS.textWhite,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  inputWrap: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: SIZES.caption,
    marginTop: 6,
  },
  input: {
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    ...SHADOWS.soft,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.textWhite,
    fontWeight: "800",
    fontSize: 20,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.h3,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionAction: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.h3,
    fontWeight: "800",
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  segment: {
    flexDirection: "row",
    padding: 6,
    gap: 8,
  },
  segmentOption: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  segmentOptionActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: COLORS.textWhite,
  },
  statPill: {
    alignItems: "center",
    gap: 6,
    minWidth: 100,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 18,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
  },
});
