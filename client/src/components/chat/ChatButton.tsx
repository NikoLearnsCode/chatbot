import {TbRobot} from 'react-icons/tb';
import {useEffect, useState} from 'react';

interface ChatButtonProps {
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

export const ChatButton = ({setIsOpen, isOpen}: ChatButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Hide button when modal opens
      setIsVisible(false);
    } else {
      if (!hasInitiallyLoaded) {
        // First load - show button with delay
        const timer = setTimeout(() => {
          setIsVisible(true);
          setHasInitiallyLoaded(true);
        }, 400);

        return () => clearTimeout(timer);
      } else {
        // Show button when modal closes
        setIsVisible(true);
      }
    }
  }, [isOpen, hasInitiallyLoaded]);

  return (
    <div
      className={`fixed bottom-7 right-7 md:bottom-10 md:right-10 lg:bottom-20 lg:right-20 z-15 transition-all duration-400 ease-out ${
        isVisible && !isOpen
          ? 'translate-x-0 translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-x-full translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <button
        id='ai-chat'
        aria-label={
          isOpen ? 'Chat is currently open' : 'Open AI chat interface'
        }
        aria-pressed={isOpen}
        onClick={() => setIsOpen(true)}
        className='group relative grid cursor-pointer h-[65px] w-[65px] md:h-[75px] md:w-[75px] bg-zinc-800 md:bg-zinc-900 place-content-center rounded-full border-2 border-zinc-50 transition-all hover:bg-orange-500 focus:border-orange-300 duration-700 ease-out hover:border-orange-300 hover:shadow-orange-300 focus:shadow-orange-300 shadow-zinc-100 shadow-md md:shadow-lg active:bg-orange-500 active:border-orange-300 active:shadow-orange-300 focus:bg-orange-500 outline-none animate-float-manual'
      >
        <TbRobot className='pointer-events-none relative text-[50px] md:text-[58px] text-zinc-50 transition-all duration-500 ease-out group-hover:text-zinc-50' />
      </button>
    </div>
  );
};
