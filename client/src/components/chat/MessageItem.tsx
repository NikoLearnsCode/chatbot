import {Construction} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {ChatMessage} from './types';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
}

export const MessageItem = ({message, index}: MessageItemProps) => {
  const isUser = message.role === 'user';
  const isFirstMessage = index === 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative rounded-md ${
          isUser
            ? `border bg-zinc-800 p-2 border-zinc-700/70 px-3 text-white text-[15px] mb-6 max-w-[85%] whitespace-pre-wrap break-words${
                !isFirstMessage ? ' mt-16' : ''
              }`
            : message.isError
            ? 'bg-zinc-800 border border-orange-400/40 p-4 rounded-lg max-w-[85%]'
            : 'bg-zinc-900 text-white prose-li:marker:text-white break-words prose prose-invert prose-h1:my-4 px-2 mb-3 w-full max-w-full prose-hr:border-zinc-800 '
        }`}
      >
        {/* Error message */}
        {message.isError ? (
          <div className='flex items-center gap-3'>
            <div>
              <h3 className='text-orange-400 animate-pulse flex gap-2 items-center font-medium text-lg mb-1'>
                <Construction className='w-6 h-6 text-orange-400 mb-0.5' />
                {message.content.includes('temporarily unavailable')
                  ? 'Service Maintenance'
                  : 'Connection Issue'}
              </h3>
              <p className='text-zinc-300 text-[13px] lg:text-sm'>
                {message.content}
              </p>
            </div>
          </div>
        ) : isUser ? (
          /* User message - plain text */
          <span>{message.content}</span>
        ) : (
          /* Assistant message - markdown support */
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({href, children}) => (
                <a
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`Open link: ${children} (opens in new tab)`}
                  className='hover:text-blue-200'
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

        {/* Timestamp display for user messages */}
        {message.timestamp && !message.isError && message.role === 'user' && (
          <span
            className={`absolute text-[11px] text-white/80 ${
              message.role === 'user' ? 'right-1 -top-5' : 'left-2 -top-3'
            }`}
          >
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
};
