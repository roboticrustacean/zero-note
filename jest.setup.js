/* eslint-env jest */
const React = require('react');

// Standalone mock for react-native
jest.mock('react-native', () => {
  const React = require('react');
  const createMockComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    Platform: {
      OS: 'android',
      select: (objs) => objs.android || objs.default || objs.ios,
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (styles) => (Array.isArray(styles) ? Object.assign({}, ...styles) : styles || {}),
      absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 })),
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
    Share: {
      share: jest.fn(async () => ({ action: 'sharedAction' })),
    },
    Alert: {
      alert: jest.fn((title, message, buttons) => {
        // mock alert
      }),
    },
    Animated: {
      Value: jest.fn((val) => ({
        interpolate: jest.fn(() => 0),
        setValue: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: (cb) => cb && cb({ finished: true }),
      })),
      timing: jest.fn(() => ({
        start: (cb) => cb && cb({ finished: true }),
      })),
      View: createMockComponent('Animated.View'),
    },
    View: createMockComponent('View'),
    Text: createMockComponent('Text'),
    TextInput: React.forwardRef((props, ref) =>
      React.createElement('TextInput', { ...props, ref }, props.children)
    ),
    TouchableOpacity: createMockComponent('TouchableOpacity'),
    TouchableWithoutFeedback: createMockComponent('TouchableWithoutFeedback'),
    ScrollView: createMockComponent('ScrollView'),
    Modal: createMockComponent('Modal'),
    KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
    ActivityIndicator: createMockComponent('ActivityIndicator'),
    SafeAreaView: createMockComponent('SafeAreaView'),
    Switch: createMockComponent('Switch'),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const createMockSvgComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };
  return {
    __esModule: true,
    default: createMockSvgComponent('Svg'),
    Svg: createMockSvgComponent('Svg'),
    Path: createMockSvgComponent('Path'),
    Circle: createMockSvgComponent('Circle'),
    Rect: createMockSvgComponent('Rect'),
    G: createMockSvgComponent('G'),
    Line: createMockSvgComponent('Line'),
    Polygon: createMockSvgComponent('Polygon'),
    Polyline: createMockSvgComponent('Polyline'),
  };
});

// In-memory mock for AsyncStorage
const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async (key, value) => {
    mockStorage.set(key, value);
    return null;
  }),
  getItem: jest.fn(async (key) => {
    return mockStorage.get(key) || null;
  }),
  removeItem: jest.fn(async (key) => {
    mockStorage.delete(key);
    return null;
  }),
  clear: jest.fn(async () => {
    mockStorage.clear();
    return null;
  }),
  getAllKeys: jest.fn(async () => {
    return Array.from(mockStorage.keys());
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  AndroidImportance: {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
  },
  AndroidNotificationVisibility: {
    PUBLIC: 1,
    PRIVATE: 0,
    SECRET: -1,
  },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => true),
  getStringAsync: jest.fn(async () => ''),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));
