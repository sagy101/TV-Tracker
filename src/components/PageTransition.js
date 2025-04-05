import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -100,
  }
};

// Transition settings
const pageTransition = {
  type: 'tween',
  ease: 'easeInOut', 
  duration: 0.3
};

const PageTransition = ({ children, location }) => {
  return (
    <div className="overflow-hidden" style={{ position: 'relative' }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition; 