import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ResizeHandleIcon } from './Icons';

interface FloatingWindowProps {
  children: React.ReactNode;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({ children }) => {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';
  const screenDimensions = Dimensions.get('window');

  // Desktop floating window dimensions
  const [windowSize, setWindowSize] = useState({
    width: Math.min(480, screenDimensions.width - 32),
    height: Math.min(680, screenDimensions.height - 48),
  });

  const sizeRef = useRef(windowSize);
  sizeRef.current = windowSize;

  const dragStartRef = useRef({ x: 0, y: 0, w: 480, h: 680 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        dragStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          w: sizeRef.current.width,
          h: sizeRef.current.height,
        };
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - dragStartRef.current.x;
        const dy = evt.nativeEvent.pageY - dragStartRef.current.y;

        const maxW = Dimensions.get('window').width - 24;
        const maxH = Dimensions.get('window').height - 24;

        const newW = Math.max(340, Math.min(maxW, dragStartRef.current.w + dx));
        const newH = Math.max(400, Math.min(maxH, dragStartRef.current.h + dy));

        setWindowSize({ width: newW, height: newH });
      },
    })
  ).current;

  if (!isWeb) {
    return <View style={[styles.mobileContainer, { backgroundColor: theme.canvas }]}>{children}</View>;
  }

  // Atmospheric desktop background based on theme mode
  const backdropGradient =
    theme.name === 'oled-dark'
      ? 'radial-gradient(ellipse at 50% 30%, #1c1d22 0%, #0d0e10 70%, #070708 100%)'
      : theme.name === 'warm-paper'
      ? 'radial-gradient(ellipse at 50% 25%, #FAF7F0 0%, #ECE6DA 65%, #DDD6C7 100%)'
      : 'radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #EFF1F5 65%, #DFE2E8 100%)';

  const webGlassStyle = isWeb
    ? ({
        backdropFilter: 'blur(32px) saturate(180%) contrast(102%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%) contrast(102%)',
        boxShadow:
          theme.name === 'oled-dark'
            ? '0 28px 64px -12px rgba(0, 0, 0, 0.75), 0 8px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)'
            : '0 28px 64px -12px rgba(0, 0, 0, 0.15), 0 8px 24px -4px rgba(0, 0, 0, 0.07), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.03)',
        backgroundImage: backdropGradient,
      } as any)
    : {};

  return (
    <View
      style={[
        styles.desktopBackdrop,
        isWeb ? ({ backgroundImage: backdropGradient } as any) : { backgroundColor: theme.canvas },
      ]}
    >
      {/* Liquid Glass Paper Floating Window */}
      <View
        style={[
          styles.windowFrame,
          {
            width: windowSize.width,
            height: windowSize.height,
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

        {/* Window Content */}
        <View style={styles.windowContent}>{children}</View>

        {/* Resizable Corner Handle */}
        <View
          {...panResponder.panHandlers}
          style={styles.resizeCorner}
          accessibilityLabel="Resize window"
          testID="window-resize-handle"
        >
          <ResizeHandleIcon size={12} color={theme.textMuted} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  desktopBackdrop: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  windowFrame: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.15,
    shadowRadius: 36,
    elevation: 20,
    position: 'relative',
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.8,
    zIndex: 10,
  },
  windowContent: {
    flex: 1,
  },
  resizeCorner: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'nwse-resize' as any,
    zIndex: 999,
  },
});
