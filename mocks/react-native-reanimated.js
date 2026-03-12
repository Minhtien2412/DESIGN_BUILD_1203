// Mock for react-native-reanimated to prevent runtime errors
// This is a temporary workaround until reanimated is properly configured

const { Animated: RNAnimated } = require('react-native');

// Mock for useSharedValue
const useSharedValue = (initialValue) => {
  return { value: initialValue };
};

// Mock for useAnimatedStyle
const useAnimatedStyle = (callback) => {
  return callback();
};

// Mock for withTiming
const withTiming = (toValue, config, callback) => {
  if (callback) callback(true);
  return toValue;
};

// Mock for withSpring
const withSpring = (toValue, config, callback) => {
  if (callback) callback(true);
  return toValue;
};

// Mock for withDelay
const withDelay = (delay, animation) => {
  return animation;
};

// Mock for withRepeat
const withRepeat = (animation, numberOfReps, reverse, callback) => {
  return animation;
};

// Mock for withSequence
const withSequence = (...animations) => {
  return animations[0];
};

// Mock for runOnJS
const runOnJS = (fn) => fn;

// Mock for useAnimatedGestureHandler
const useAnimatedGestureHandler = (handlers) => handlers;

// Mock for useAnimatedReaction
const useAnimatedReaction = () => {};

// Mock for useDerivedValue
const useDerivedValue = (callback) => {
  return { value: callback() };
};

// Mock for useWorkletCallback
const useWorkletCallback = (callback) => callback;

// Mock Animated component
const createAnimatedComponent = (Component) => Component;

// Mock Animated object (similar to react-native's Animated)
const Animated = {
  View: RNAnimated.View,
  Text: RNAnimated.Text,
  ScrollView: RNAnimated.ScrollView,
  Image: RNAnimated.Image,
  FlatList: RNAnimated.FlatList,
  createAnimatedComponent,
};

// Export all functions and components
module.exports = Animated;
module.exports.default = Animated;
module.exports.useSharedValue = useSharedValue;
module.exports.useAnimatedStyle = useAnimatedStyle;
module.exports.withTiming = withTiming;
module.exports.withSpring = withSpring;
module.exports.withDelay = withDelay;
module.exports.withRepeat = withRepeat;
module.exports.withSequence = withSequence;
module.exports.runOnJS = runOnJS;
module.exports.useAnimatedGestureHandler = useAnimatedGestureHandler;
module.exports.useAnimatedReaction = useAnimatedReaction;
module.exports.useDerivedValue = useDerivedValue;
module.exports.useWorkletCallback = useWorkletCallback;
module.exports.createAnimatedComponent = createAnimatedComponent;

// Layout animations (no-op)
module.exports.FadeIn = undefined;
module.exports.FadeOut = undefined;
module.exports.FadeInUp = undefined;
module.exports.FadeInDown = undefined;
module.exports.FadeInLeft = undefined;
module.exports.FadeInRight = undefined;
module.exports.SlideInUp = undefined;
module.exports.SlideInDown = undefined;
module.exports.SlideInLeft = undefined;
module.exports.SlideInRight = undefined;
module.exports.Layout = undefined;
module.exports.ZoomIn = undefined;
module.exports.ZoomOut = undefined;
