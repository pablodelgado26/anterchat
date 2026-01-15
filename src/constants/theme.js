// Cores do tema Antera Chat (Verde e Branco - similar ao LinkedIn)
export const COLORS = {
  // Cores principais
  primary: '#10B981',      // Verde principal (Emerald-500)
  primaryDark: '#059669',  // Verde escuro (Emerald-600)
  primaryLight: '#34D399', // Verde claro (Emerald-400)
  
  // Cores de fundo
  background: '#FFFFFF',
  backgroundGray: '#F3F4F6',
  backgroundDark: '#1F2937',
  
  // Cores de texto
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Cores de borda e divisores
  border: '#E5E7EB',
  divider: '#D1D5DB',
  
  // Cores de estado
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Cores de interação
  like: '#EF4444',
  comment: '#6B7280',
  share: '#10B981',
  
  // Overlay e sombras
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const SIZES = {
  // Tamanhos de fonte
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,
  
  // Espaçamento
  padding: 16,
  paddingSmall: 8,
  paddingLarge: 24,
  
  // Border radius
  radius: 8,
  radiusSmall: 4,
  radiusLarge: 16,
  radiusFull: 9999,
  
  // Tamanhos de ícones
  iconSmall: 16,
  icon: 24,
  iconLarge: 32,
  
  // Tamanhos de avatar
  avatarSmall: 32,
  avatar: 48,
  avatarLarge: 80,
  avatarXLarge: 120,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
