'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AppInitializer — Smooth app startup with loading state and automatic theme detection.
 * Prevents black flashes during hydration and initial load.
 * Adapts to system color scheme preference (light/dark).
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Detect system color scheme preference
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Simulate progressive loading with minimum display time to prevent flicker
    const steps = [20, 45, 70, 90, 100];
    let currentStep = 0;
    const startTime = Date.now();
    const minDisplayTime = 1200; // Minimum 1.2s to prevent flash

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        // Ensure minimum display time before hiding
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => setIsReady(true), remaining + 200);
      }
    }, 120); // Slightly slower for smoother feel

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Theme-aware colors
  const bg = isDark ? '#1A1A2E' : '#f5f5f5';
  const barTrack = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

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
              background: bg,
            }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                fontSize: '3rem',
                marginBottom: '2rem',
              }}
            >
              🥋
            </motion.div>

            {/* Progress bar container */}
            <div
              style={{
                width: 280,
                height: 4,
                background: barTrack,
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
                color: textColor,
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
