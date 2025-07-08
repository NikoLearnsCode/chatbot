interface QuickQuestion {
  label: string;
  prompt: string;
}

interface QuickQuestionsSectionProps {
  hasMessages: boolean;
  greeting: string;
  message: string;
  sendPrompt: (quickPrompt?: string) => void;
  loading: boolean;
}

const quickQuestions: QuickQuestion[] = [
  {
    label: 'Technology',
    prompt: 'What is the latest trend in AI?',
  },
  {
    label: 'Math',
    prompt: 'What is 88 raised to the power of 20?',
  },
  {
    label: 'Geography',
    prompt: 'What is the capital of Germany?',
  },
  {
    label: 'Science',
    prompt: 'What is the speed of light?',
  },
  {
    label: 'History',
    prompt: 'When did the second world war end?',
  },
  {
    label: 'Culture',
    prompt: 'What is the most popular dish in Japan?',
  },
  {
    label: 'Art',
    prompt: 'What is the most popular art movement in the 20th century?',
  },
];

export const QuickQuestionsSection = ({
  hasMessages,
  greeting,
  message,
  sendPrompt,
  loading,
}: QuickQuestionsSectionProps) => {
  return (
    <>
      {/* Desktop greeting view */}
      <div
        className={`flex-1 overflow-y-auto h-full px-4 lg:px-5 pt-10 pb-6 ${
          hasMessages ? 'hidden' : ''
        }`}
      >
        <div className='flex flex-col items-center justify-start min-h-full'>
          <div className='flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto'>
            <h2 className='text-[32px] sm:text-4xl text-white text-center'>
              {greeting}
            </h2>

            {/* Desktop quickquestions */}
            <div className='hidden lg:block'>
              <p className='text-xl mb-5 text-white/80 text-center'>
                What are you curious about?
              </p>
              <div className='flex flex-wrap justify-center max-w-2/3 gap-2.5 mx-auto w-full'>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendPrompt(q.prompt)}
                    disabled={loading}
                    aria-label={`Ask question: ${q.label}`}
                    className='bg-zinc-800 border cursor-pointer border-zinc-700 text-xs sm:text-sm text-white px-4 py-2 rounded-full hover:bg-zinc-700 active:bg-zinc-700 min-h-10 focus:outline-orange-400'
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile QuickQuestions - horizontal scroll above input */}
      {!hasMessages && (
        <div
          className={`lg:hidden pb-4 transition-all duration-400 ease-out ${
            message.trim() === ''
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <div className='flex px-3 gap-2.5 overflow-x-auto scrollbar-hide'>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendPrompt(q.prompt)}
                disabled={loading}
                aria-label={`Ask question: ${q.label}`}
                className='bg-zinc-800 border cursor-pointer border-zinc-700 text-xs sm:text-sm text-white px-4.5 py-3.5 rounded-full hover:bg-zinc-700 active:bg-zinc-700 min-h-10 whitespace-nowrap flex-shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-orange-400'
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
