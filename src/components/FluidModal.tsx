import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface FluidModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'sheet' | 'floating';
}

export const FluidModal: React.FC<FluidModalProps> = ({
  visible,
  onClose,
  children,
  variant = 'sheet',
}) => {
  const { theme } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.spring(animValue, {
        toValue: 1,
        damping: 26,
        mass: 0.8,
        stiffness: 240,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, animValue]);

  if (!isRendered) return null;

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.65],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [variant === 'sheet' ? 300 : 80, 0],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const isDesktopWeb = Platform.OS === 'web' && Dimensions.get('window').width > 600;
  const isWeb = Platform.OS === 'web';

  const webGlassStyle = isWeb
    ? ({
        backdropFilter: 'blur(36px) saturate(190%) contrast(102%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%) contrast(102%)',
        boxShadow:
          theme.name === 'oled-dark'
            ? '0 32px 72px -16px rgba(0, 0, 0, 0.85), 0 12px 28px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)'
            : '0 32px 72px -16px rgba(0, 0, 0, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.08), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.03)',
      } as any)
    : {};

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: '#000000',
            },
            isWeb ? ({ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as any) : {},
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Floating / Sheet Panel */}
      <Animated.View
        style={[
          styles.panelWrapper,
          variant === 'sheet' && !isDesktopWeb ? styles.sheetPosition : styles.floatingPosition,
          {
            transform: [{ translateY }, { scale }],
            opacity: animValue,
          },
        ]}
      >
        <View
          style={[
            styles.panelContent,
            {
              backgroundColor: theme.glassBg,
              borderColor: theme.glassBorder,
            },
            webGlassStyle,
          ]}
        >
          {/* Top Specular Rim Reflection Highlight */}
          <View
            style={[
              styles.specularRim,
              {
                backgroundColor: theme.glassHighlight,
              },
            ]}
          />

          {/* Subtle drag / pull indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: theme.textMuted, opacity: 0.3 }]} />
          </View>

          <SafeAreaView style={styles.innerContent}>{children}</SafeAreaView>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panelWrapper: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    zIndex: 1001,
  },
  sheetPosition: {
    position: 'absolute',
    bottom: 0,
    maxHeight: '88%',
  },
  floatingPosition: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    maxHeight: '85%',
  },
  panelContent: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
    height: '100%',
    position: 'relative',
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.75,
    zIndex: 10,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  innerContent: {
    flex: 1,
  },
});
