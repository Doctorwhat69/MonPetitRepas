import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../context/ThemeContext';

/**
 * Design System Global - SaaS / 60-30-10
 * Centralise l'intégralité des styles de l'application et s'adapte au mode sombre/clair.
 */
export const getGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    // =========================================================================
    // 1. LAYOUT & CONTENEURS PRINCIPAUX
    // =========================================================================
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },
    content: {
      gap: 12,
    },
    // Carte style Figma avec arrondis prononcés et ombre douce
    card: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
        },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // =========================================================================
    // 2. MODALES, OVERLAYS & DIALOGUES
    // =========================================================================
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    dialogCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 20,
    },
    dialogTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 6,
    },
    dialogSub: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    editCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 20,
    },
    editTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 14,
    },
    editButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },

    // =========================================================================
    // 3. TYPOGRAPHIE & TEXTES
    // =========================================================================
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primaryDark,
      marginTop: 10,
    },
    text: {
      fontSize: 14,
      color: theme.text,
    },
    textSecondary: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    dateText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    caloriesText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginVertical: 4,
    },
    macrosText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.textSecondary,
      marginTop: 30,
    },
    empty: {
      textAlign: 'center',
      color: theme.textSecondary,
      marginTop: 30,
    },

    // =========================================================================
    // 4. FORMULAIRES, INPUTS & CHAMPS DE RECHERCHE
    // =========================================================================
    label: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    input: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.text,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      fontSize: 15,
      marginBottom: 12,
    },
    searchBar: {
      marginBottom: 16,
    },
    inputQuantite: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.text,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      marginBottom: 16,
    },
    field: {
      flex: 1,
    },

    // =========================================================================
    // 5. PROFIL & AVATAR
    // =========================================================================
    avatarSection: {
      alignItems: 'center',
      marginBottom: 10,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    inputAvatar: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.text,
      borderWidth: 1,
      borderRadius: 6,
      padding: 6,
      fontSize: 12,
      width: '100%',
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    calcHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    toggleAuto: {
      fontSize: 13,
      color: theme.primaryDark,
      fontWeight: 'bold',
    },
    timeBox: {
      backgroundColor: theme.isDark ? '#00363a' : '#E0F7FA',
      padding: 10,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    timeText: {
      fontSize: 11,
      color: theme.isDark ? '#e0f7fa' : '#006064',
      fontWeight: '600',
    },
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    // =========================================================================
    // 6. ACCUEIL, REPAS & RÉSUMÉ NUTRITIONNEL
    // =========================================================================
    summaryCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
        },
      }),
    },
    summaryTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    progressBackground: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginVertical: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    macrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    macro: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    itemCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    itemDetails: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    saveButtonContainer: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    // =========================================================================
    // 7. LISTES D'ALIMENTS & CARTES PRODUIT
    // =========================================================================
    productImage: {
      width: 56,
      height: 56,
      borderRadius: 12,
      marginRight: 12,
    },
    placeholderImage: {
      backgroundColor: theme.border,
    },
    cardInfo: {
      flex: 1,
      paddingRight: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    cardBrand: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '500',
    },
    cardDetails: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    detailCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      padding: 20,
      borderRadius: 16,
    },
    detailTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },

    // =========================================================================
    // 8. BOUTONS, BADGES, CHIPS & ACTIONS
    // =========================================================================
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      marginTop: 10,
    },
    editBtn: {
      color: theme.primary,
      fontWeight: '600',
    },
    deleteBtn: {
      color: theme.danger,
      fontWeight: '600',
    },
    deleteButton: {
      color: theme.danger,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    badgeActive: {
      backgroundColor: theme.primary,
    },
    textActive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    textInactive: {
      color: theme.textSecondary,
    },
    chip: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    chipTextActive: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },

    // =========================================================================
    // 9. MESSAGES, ALERTES & TOGGLES
    // =========================================================================
    toggleContainer: {
      marginTop: 15,
      alignItems: 'center',
    },
    toggleText: {
      color: theme.primary,
      fontSize: 14,
    },
    messageBox: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    errorBox: {
      backgroundColor: theme.isDark ? '#421010' : '#FFEBEE',
    },
    successBox: {
      backgroundColor: theme.isDark ? '#0f3818' : '#E8F5E9',
    },
    messageText: {
      fontSize: 13,
      textAlign: 'center',
    },
    errorText: {
      color: theme.danger,
    },
    successText: {
      color: '#2E7D32',
    },

    // =========================================================================
    // 10. ALIGNEMENTS & GRILLES DE DISPOSITION
    // =========================================================================
    row: {
      flexDirection: 'row',
      gap: 10,
      marginVertical: 6,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    grid2: {
      flexDirection: 'row',
      gap: 10,
    },
    grid3: {
      flexDirection: 'row',
      gap: 8,
    },
    wrapRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginVertical: 6,
    },
    dayCard: {
      width: 48,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      marginRight: 8,
    },
    dayName: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    todayIndicator: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      marginTop: 3,
    },
  });