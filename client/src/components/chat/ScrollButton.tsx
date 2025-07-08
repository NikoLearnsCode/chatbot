import {ArrowUp} from 'lucide-react';

interface ScrollButtonProps {
  userScrolledUp: boolean;
  hasMessages: boolean;
  loading: boolean;
  isGenerating: boolean;
  isScrolling: boolean;
  message: string;
  scrollToBottom: () => void;
}

export const ScrollButton = ({
  userScrolledUp,
  hasMessages,
  loading,
  isGenerating,
  isScrolling,
  message,
  scrollToBottom,
}: ScrollButtonProps) => {
  const shouldShow =
    userScrolledUp && hasMessages && !loading && !isGenerating && !isScrolling;

  if (!shouldShow) return null;

  return (
    <div
      className={`absolute bottom-27 lg:bottom-19 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-400 ease-out ${
        userScrolledUp
          ? message === ''
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2'
          : 'opacity-0 translate-y-2'
      }`}
    >
      <button
        onClick={() => scrollToBottom()}
        aria-label='Scroll to bottom'
        className='bg-zinc-900 border border-zinc-700 text-white h-9 w-9 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-zinc-800 active:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-orange-400'
      >
        <ArrowUp className='w-4.5 h-4.5 rotate-180' />
      </button>
    </div>
  );
};
