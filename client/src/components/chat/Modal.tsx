import {motion, AnimatePresence} from 'framer-motion';
import {useEffect} from 'react';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  setIsOpen: (isOpen: boolean) => void;
}

export const Modal = ({isOpen, children, setIsOpen}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Save scroll position and lock modal for mobile
      const scrollY = window.scrollY;
      document.body.dataset.scrollY = scrollY.toString();
      requestAnimationFrame(() => {
        // Workaround to cover for input-bounce on mobile
        document.body.style.backgroundColor = 'rgb(39 39 42)'; // bg-zinc-800
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.left = '0';
      });
    } else {
      requestAnimationFrame(() => {
        // Restore page background and scroll
        document.body.style.backgroundColor = 'rgb(24 24 27)'; // bg-zinc-900
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.left = '';

        // Restore scroll position
        const savedScrollY = document.body.dataset.scrollY;
        if (savedScrollY) {
          const scrollPosition = parseInt(savedScrollY, 10);
          window.scrollTo(0, scrollPosition);
          delete document.body.dataset.scrollY;
        }
      });
    }
    return () => {
      // Reset all modal styles on cleanup
      document.body.style.backgroundColor = 'rgb(24 24 27)';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
    };
  }, [isOpen]);

  // Animation settings
  const backdropVariants = {
    initial: {opacity: 0},
    animate: {opacity: 1},
    exit: {opacity: 0},
  };

  const modalVariants = {
    initial: {scale: 0, opacity: 0},
    animate: {scale: 1, opacity: 1},
    exit: {scale: 0, opacity: 0},
  };

  const animationConfig = {
    duration: 0.4,
    type: 'spring',
    bounce: 0.15,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={{duration: animationConfig.duration}}
          onClick={() => setIsOpen(false)}
          className='bg-zinc-950/80 backdrop-blur-[1px] lg:p-8 fixed inset-0 grid place-items-center z-30 cursor-pointer'
          role='dialog'
          aria-modal='true'
          aria-label='AI Chat Modal'
          style={{
            willChange: 'opacity',
            height: '100%',
          }}
        >
          <motion.div
            variants={modalVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={animationConfig}
            onClick={(e) => e.stopPropagation()}
            className='bg-zinc-800 text-zinc-50 lg:rounded-md lg:p-4 w-full lg:max-w-3xl h-full lg:h-[75vh] overflow-y-auto lg:overflow-y-visible cursor-default relative'
            role='document'
            style={{willChange: 'transform, opacity'}}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
