import {useEffect} from 'react';
import type {ChatMessage} from './types';
import {ChatHeader} from './ChatHeader';
import {MessageItem} from './MessageItem';
import {StreamingDisplay} from './StreamingDisplay';
import {ScrollButton} from './ScrollButton';
import {InputSection} from './InputSection';
import {QuickQuestionsSection} from './QuickQuestionsSection';

interface ChatLayoutProps {
  messages: ChatMessage[];
  message: string;
  loading: boolean;
  hasStarted: boolean;
  isGenerating: boolean;
  queuePosition: number | null;
  queueLength: number | null;
  scrollToBottom: () => void;
  isSomeoneProcessing: boolean;
  displayedText: string;
  greeting: string;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setMessages: (m: ChatMessage[]) => void;
  setIsChatOpen: (o: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  sendPrompt: (quickPrompt?: string) => void;
  userScrolledUp: boolean;
  isScrolling: boolean;
}

export const ChatLayout = ({
  messages,
  message,
  loading,
  displayedText,
  greeting,
  queueLength,
  hasStarted,
  queuePosition,
  isSomeoneProcessing,
  setMessages,
  chatContainerRef,
  isGenerating,
  setIsChatOpen,
  handleInputChange,
  sendPrompt,
  textareaRef,
  chatEndRef,
  userScrolledUp,
  isScrolling,
  scrollToBottom,
}: ChatLayoutProps) => {
  const handleNewChat = () => {
    setMessages([]);
  };

  // Auto-focus input on desktop only
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      textareaRef.current?.focus();
    }
  }, [textareaRef]);

  return (
    <div className='relative h-full flex flex-col lg:border lg:border-zinc-700 bg-zinc-900'>
      {/* Header with action buttons */}
      <ChatHeader
        hasMessages={messages.length > 0}
        loading={loading}
        onNewChat={handleNewChat}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Message list */}
      <div
        className={`flex-1 overflow-y-auto h-full px-4 lg:px-5 pt-10 pb-6 space-y-2 ${
          messages.length === 0 ? 'hidden' : ''
        }`}
        ref={chatContainerRef}
      >
        {/* Render all messages except system messages */}
        {messages
          .filter((m) => m.role !== 'system')
          .map((msg, i) => (
            <MessageItem key={i} message={msg} index={i} />
          ))}

        <StreamingDisplay
          isGenerating={isGenerating}
          displayedText={displayedText}
          hasStarted={hasStarted}
          queuePosition={queuePosition}
          queueLength={queueLength}
          isSomeoneProcessing={isSomeoneProcessing}
        />

        {/* Scroll anchor for auto-scroll functionality */}
        <div ref={chatEndRef} />
      </div>

      <QuickQuestionsSection
        hasMessages={messages.length > 0}
        greeting={greeting}
        message={message}
        sendPrompt={sendPrompt}
        loading={loading}
      />

      <ScrollButton
        userScrolledUp={userScrolledUp}
        hasMessages={messages.length > 0}
        loading={loading}
        isGenerating={isGenerating}
        isScrolling={isScrolling}
        message={message}
        scrollToBottom={scrollToBottom}
      />

      <InputSection
        message={message}
        loading={loading}
        isGenerating={isGenerating}
        textareaRef={textareaRef}
        handleInputChange={handleInputChange}
        sendPrompt={sendPrompt}
      />
    </div>
  );
};
