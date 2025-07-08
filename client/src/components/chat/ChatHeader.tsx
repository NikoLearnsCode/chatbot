import {Plus, X} from 'lucide-react';

interface ChatHeaderProps {
  hasMessages: boolean;
  loading: boolean;
  onNewChat: () => void;
  onClose: () => void;
}

export const ChatHeader = ({
  hasMessages,
  loading,
  onNewChat,
  onClose,
}: ChatHeaderProps) => {
  return (
    <div className='flex justify-center items-center'>
      {hasMessages && (
        <button
          onClick={onNewChat}
          disabled={loading}
          aria-label='Start a new chat conversation'
          className='px-4 py-2.5 disabled:pointer-events-none lg:py-2 flex cursor-pointer items-center justify-center border-b z-10 border-r border-zinc-800/60 bg-zinc-900 w-full text-zinc-50 text-xs font-medium tracking-wide hover:text-emerald-400 active:text-emerald-400 transition group'
        >
          <span
            className={`flex items-center ${
              loading ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <Plus
              strokeWidth={2.5}
              size={14}
              className={`mr-1 mb-[1px] ${
                loading ? 'text-zinc-50' : 'text-emerald-400'
              }`}
            />
            New chat
          </span>
        </button>
      )}

      <button
        onClick={onClose}
        aria-label='Close chat interface'
        className='px-4 py-2.5 z-10 lg:py-2 cursor-pointer flex items-center justify-center border-b border-zinc-800/60 bg-zinc-900 w-full text-zinc-50 text-xs font-medium hover:text-rose-400 active:text-rose-400 transition'
      >
        <span className='flex items-center'>
          <X strokeWidth={2.5} size={14} className='mr-1 text-rose-400' />
          Close
        </span>
      </button>
    </div>
  );
};
