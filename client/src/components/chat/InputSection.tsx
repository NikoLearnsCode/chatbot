import {ArrowUp, LoaderCircle} from 'lucide-react';

interface InputSectionProps {
  message: string;
  loading: boolean;
  isGenerating: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  sendPrompt: (quickPrompt?: string) => void;
}

export const InputSection = ({
  message,
  loading,
  isGenerating,
  textareaRef,
  handleInputChange,
  sendPrompt,
}: InputSectionProps) => {
  return (
    <div className='w-full bg-zinc-800 border-t border-zinc-700 lg:py-2 py-5 flex lg:rounded-none rounded-t-4xl'>
      <label htmlFor='chat-input' className='sr-only'>
        Type your question here
      </label>

      {/* Auto-resizing textarea */}
      <textarea
        id='chat-input'
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          // Enter to send, Shift+Enter for new line
          if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault();
            sendPrompt();
          }
        }}
        placeholder='Ask me anything...'
        rows={1}
        maxLength={500}
        aria-label='Type your question here'
        className='flex-1 relative bg-zinc-800 text-base text-white px-5 pr-16 lg:pr-20 py-3 pb-5 lg:py-3 resize-none focus:outline-none whitespace-pre-wrap max-h-24 overflow-y-auto lg:rounded-none rounded-t-4xl'
      />

      {/* Send Button with Loading States */}
      <button
        onClick={() => sendPrompt()}
        disabled={loading || message.trim() === ''}
        aria-label='Send message'
        className={`absolute right-4 lg:bottom-3 bottom-8 h-10 w-10 rounded-full transition-all duration-300 flex items-center justify-center disabled:pointer-events-none ${
          message.trim() === ''
            ? 'bg-zinc-900/60 text-zinc-500'
            : loading || isGenerating
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-900 text-white cursor-pointer hover:bg-zinc-700'
        }`}
      >
        {/* Dynamic button content based on state */}
        {loading || isGenerating ? (
          <div className='absolute inset-0 flex items-center justify-center'>
            <LoaderCircle className='w-5 h-5 animate-spin text-zinc-400' />
          </div>
        ) : (
          <ArrowUp className='w-5 h-5' />
        )}
      </button>
    </div>
  );
};
