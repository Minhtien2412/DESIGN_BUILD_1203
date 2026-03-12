/**
 * European Luxury Animation System
 * Smooth, refined transitions inspired by high-end web experiences
 */

export const Animations = {
  // Timing functions (European sophistication)
  timing: {
    instant: 0,
    fast: 200,
    normal: 300,
    smooth: 400,
    slow: 600,
    elegant: 800,
  },

  // Easing curves (luxury feel)
  easing: {
    // Smooth, natural movements
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    
    // Luxury curves (refined acceleration)
    elegant: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sophisticated: 'cubic-bezier(0.35, 0, 0.25, 1)',
    smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
  },

  // Spring configs (for React Native Animated)
  spring: {
    gentle: {
      damping: 20,
      mass: 1,
      stiffness: 100,
    },
    smooth: {
      damping: 15,
      mass: 1,
      stiffness: 120,
    },
    bouncy: {
      damping: 10,
      mass: 1,
      stiffness: 150,
    },
  },

  // Scale transforms
  scale: {
    press: 0.97,      // Subtle press feedback
    hover: 1.02,      // Gentle hover lift
    active: 0.95,     // Active state
  },

  // Opacity values
  opacity: {
    hidden: 0,
    subtle: 0.4,
    muted: 0.6,
    visible: 0.8,
    full: 1,
  },
};

// Animation presets for common UI patterns
export const AnimationPresets = {
  // Card entrance
  cardEntrance: {
    from: { opacity: 0, transform: [{ translateY: 20 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
    duration: Animations.timing.smooth,
  },

  // Fade in
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: Animations.timing.normal,
  },

  // Slide up
  slideUp: {
    from: { opacity: 0, transform: [{ translateY: 30 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
    duration: Animations.timing.smooth,
  },

  // Scale in
  scaleIn: {
    from: { opacity: 0, transform: [{ scale: 0.9 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
    duration: Animations.timing.normal,
  },
};
