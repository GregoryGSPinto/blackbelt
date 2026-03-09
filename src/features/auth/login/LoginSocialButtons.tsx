'use client';

import { memo } from 'react';
import { motion, type Variants } from 'framer-motion';

type LoginSocialButtonsProps = {
  AnimatedSpinner: ({ color }: { color: string }) => React.JSX.Element;
  AppleIcon: ({ color }: { color: string }) => React.JSX.Element;
  GoogleIcon: () => React.JSX.Element;
  colors: {
    cardBorder: string;
    error: string;
    text: string;
  };
  handleAppleSignIn: () => void;
  handleGoogleSignIn: () => void;
  isDark: boolean;
  isOAuthLoading: boolean;
  shouldReduceMotion: boolean | null;
  springTransition: {
    type: 'spring';
    stiffness: number;
    damping: number;
  };
  staggerContainer: Variants;
  staggerItem: Variants;
  t: (key: string) => string;
};

export const LoginSocialButtons = memo(function LoginSocialButtons({
  AnimatedSpinner,
  AppleIcon,
  GoogleIcon,
  colors,
  handleAppleSignIn,
  handleGoogleSignIn,
  isDark,
  isOAuthLoading,
  shouldReduceMotion,
  springTransition,
  staggerContainer,
  staggerItem,
  t,
}: LoginSocialButtonsProps) {
  return (
    <motion.div
      style={{ display: 'flex' }}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.button
        variants={staggerItem}
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isOAuthLoading}
        aria-label={t('login.loginWithGoogle')}
        style={{
          flex: 1,
          height: 52,
          border: 'none',
          borderRight: `1px solid ${colors.cardBorder}`,
          borderRadius: 0,
          background: 'transparent',
          cursor: isOAuthLoading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: shouldReduceMotion ? undefined : 'transform',
          opacity: isOAuthLoading ? 0.6 : 1,
        }}
        whileHover={shouldReduceMotion || isOAuthLoading ? undefined : {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          scale: 1.03,
        }}
        whileTap={shouldReduceMotion || isOAuthLoading ? undefined : { scale: 0.97 }}
        transition={springTransition}
      >
        {isOAuthLoading ? <AnimatedSpinner color={colors.error} /> : <GoogleIcon />}
      </motion.button>
      <motion.button
        variants={staggerItem}
        type="button"
        onClick={handleAppleSignIn}
        disabled={isOAuthLoading}
        aria-label={t('login.loginWithApple')}
        style={{
          flex: 1,
          height: 52,
          border: 'none',
          borderRadius: 0,
          background: 'transparent',
          cursor: isOAuthLoading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: shouldReduceMotion ? undefined : 'transform',
          opacity: isOAuthLoading ? 0.6 : 1,
        }}
        whileHover={shouldReduceMotion || isOAuthLoading ? undefined : {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          scale: 1.03,
        }}
        whileTap={shouldReduceMotion || isOAuthLoading ? undefined : { scale: 0.97 }}
        transition={springTransition}
      >
        {isOAuthLoading ? <AnimatedSpinner color={colors.error} /> : <AppleIcon color={colors.text} />}
      </motion.button>
    </motion.div>
  );
});
