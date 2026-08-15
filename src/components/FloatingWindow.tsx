import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  PanResponder,
  Text,
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

  return (
    <View style={[styles.desktopBackdrop, { backgroundColor: '#ECE9E2' }]}>
      {/* Floating Resizable Window Frame */}
      <View
        style={[
          styles.windowFrame,
          {
            width: windowSize.width,
            height: windowSize.height,
            backgroundColor: theme.canvas,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Subtle Traffic Light / Window Bar */}
        <View style={[styles.windowTitleBar, { borderBottomColor: theme.borderSubtle }]}>
          <View style={styles.windowControls}>
            <View style={[styles.controlDot, { backgroundColor: '#FF5F56' }]} />
            <View style={[styles.controlDot, { backgroundColor: '#FFBD2E' }]} />
            <View style={[styles.controlDot, { backgroundColor: '#27C93F' }]} />
          </View>
          <Text style={[styles.windowTitle, { color: theme.textMuted }]}>Ø Zero Note</Text>
          <View style={{ width: 44 }} />
        </View>

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
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 24,
    position: 'relative',
  },
  windowTitleBar: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    opacity: 0.8,
  },
  windowControls: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  controlDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    opacity: 0.85,
  },
  windowTitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
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
