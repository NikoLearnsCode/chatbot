import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingDisplayProps {
  isGenerating: boolean;
  displayedText: string;
  hasStarted: boolean;
  queuePosition: number | null;
  queueLength: number | null;
  isSomeoneProcessing: boolean;
}

export const StreamingDisplay = ({
  isGenerating,
  displayedText,
  hasStarted,
  queuePosition,
  queueLength,
  isSomeoneProcessing,
}: StreamingDisplayProps) => {
  return (
    <div className='relative'>
      {/* Streaming LLM response display */}
      {isGenerating && displayedText && (
        <div className='flex justify-start'>
          <div className='relative prose-li:marker:text-white prose-h1:my-4 prose prose-invert max-w-full prose-hr:border-zinc-800 rounded-md break-words px-2 text-white mb-3 w-full'>
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
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Queue status & thinking indicator */}
      {isGenerating && !hasStarted && (
        <div className='absolute top-0 left-0 z-10'>
          <div className='bg-zinc-900 mb-10 text-base text-white/90 whitespace-pre-wrap px-2 py-2 rounded animate-pulse'>
            {queuePosition !== null &&
            queuePosition === 0 &&
            isSomeoneProcessing
              ? `You're next in line - hang in there!`
              : queueLength !== null &&
                queueLength > 1 &&
                queuePosition !== null &&
                queuePosition > 0
              ? `You're #${queuePosition + 1} in queue - hang in there!`
              : 'Thinking...'}
          </div>
        </div>
      )}
    </div>
  );
};
