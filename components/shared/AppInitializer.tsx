'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AppInitializer — Smooth app startup with loading state.
 * Prevents black flashes during hydration and initial load.
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading
    const steps = [20, 45, 70, 90, 100];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        // Small delay before showing content for smooth transition
        setTimeout(() => setIsReady(true), 200);
      }
    }, 150);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1A1A2E',
            }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
              }}
            >
              🥋
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #C9A227, #FFD11A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              BLACKBELT
            </motion.div>

            {/* Progress bar container */}
            <div
              style={{
                width: 280,
                height: 4,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Progress fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #C9A227, #FFD11A)',
                  borderRadius: 2,
                  boxShadow: '0 0 10px rgba(201, 162, 39, 0.6)',
                }}
              />
            </div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              Carregando...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}
