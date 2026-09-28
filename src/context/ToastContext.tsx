import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828', icon: 'alert-circle' };
      default:
        return { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0', icon: 'information-circle' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: fadeAnim,
              backgroundColor: getToastConfig(toast.type).bg,
              borderColor: getToastConfig(toast.type).border,
            },
          ]}
        >
          <Ionicons
            name={getToastConfig(toast.type).icon as any}
            size={20}
            color={getToastConfig(toast.type).text}
          />
          <Text style={[styles.toastText, { color: getToastConfig(toast.type).text }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});