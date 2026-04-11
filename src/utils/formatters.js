export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

export const formatRelativeDate = (dateString) => {
  if (!dateString) return "";

  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `${diffDays} d`;

  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

export const formatFileLabel = (file) => {
  if (!file) return "";
  return file.name || file.fileName || "curriculo";
};

export const parseListInput = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export const formatFollowers = (value = 0) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value);
