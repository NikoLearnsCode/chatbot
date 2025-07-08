import {useState, useRef, useEffect, useCallback} from 'react';
import {ChatButton} from './ChatButton';
import {Modal} from './Modal';
import {ChatLayout} from './ChatLayout';
import {v4 as uuidv4} from 'uuid';
import type {ChatMessage} from './types';

export default function ChatMain() {
  const selectedModel = 'llama3.1:8b';
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Chat state
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Chat history
  const [loading, setLoading] = useState(false);

  // Queue system state
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueLength, setQueueLength] = useState<number | null>(null);
  const [isSomeoneProcessing, setIsSomeoneProcessing] =
    useState<boolean>(false);

  // UI state
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const [displayedText, setDisplayedText] = useState(''); // Streaming response
  const [isGenerating, setIsGenerating] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const hasScrolledOnOpen = useRef(false);

  // Refs
  const hasStarted = useRef(false);
  const userTriedToSend = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(uuidv4());
  const wsRef = useRef<WebSocket | null>(null);

  // Utility functions
  const now = useCallback(() => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const pushErrorToMessages = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: message,
        isError: true,
      },
    ]);

    setIsGenerating(false);
    setLoading(false);
    setDisplayedText('');
  }, []);

  // Set greeting based on time of day
  useEffect(() => {
    const h = new Date().getHours();

    if (h >= 4 && h < 12) {
      setGreeting('Good morning!');
    } else if (h >= 12 && h < 17) {
      setGreeting('Good afternoon!');
    } else if (h >= 17 && h < 23) {
      setGreeting('Good evening!');
    } else {
      setGreeting('Good night!');
    }
  }, []);

  // WebSocket connection and message handling
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    wsRef.current = ws;

    // =========================================================================
    //    WebSocket Message Handler (Receiver)
    // =========================================================================

    // Receives responses from the server after 'sendPrompt' has sent a request.
    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        // Displays the user's position in the queue in real-time.
        if (msg.type === 'queue') {
          setQueuePosition(msg.position);
          setQueueLength(msg.length ?? null);
          setIsSomeoneProcessing(!!msg.isSomeoneProcessing);
        }

        // The server signals that the entire LLM response has been sent.
        else if (msg.type === 'done') {
          setDisplayedText((prevDisplayedText) => {
            // Saves the accumulated, streamed text as a permanent message.
            if (prevDisplayedText.trim()) {
              setMessages((prev) => {
                if (
                  prev.length > 0 &&
                  prev[prev.length - 1].content === prevDisplayedText
                ) {
                  return prev; // Avoid duplicates
                }
                return [
                  ...prev,
                  {
                    role: 'assistant',
                    content: prevDisplayedText,
                    model: selectedModel,
                  },
                ];
              });
            }

            setIsGenerating(false);
            setLoading(false);
            return '';
          });
        } else if (msg.type === 'error') {
          if (userTriedToSend.current) {
            pushErrorToMessages(
              'Service temporarily unavailable. Please try again in a moment.'
            );
            setDisplayedText('');
            setIsGenerating(false);
            setLoading(false);
          }
        }

        // Streaming text
        else if (msg.message && typeof msg.message.content === 'string') {
          if (!hasStarted.current) {
            hasStarted.current = true;
            setQueuePosition(null);
          }

          setDisplayedText((prev) => prev + msg.message.content);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    // WebSocket error handler
    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setDisplayedText('');
      setIsGenerating(false);
      setLoading(false);
    };

    // WebSocket close handler
    ws.onclose = (event: CloseEvent) => {
      // Only show error if user actively tried to send a message
      if (userTriedToSend.current) {
        if (event.code === 1006 || event.code === 1001) {
          pushErrorToMessages(
            'Connection was interrupted. Please refresh the page and try again.'
          );
        } else {
          pushErrorToMessages(
            'Service temporarily unavailable. Please try again later.'
          );
        }
      }

      userTriedToSend.current = false;
      setDisplayedText('');
      setIsGenerating(false);
      setLoading(false);
    };

    // Cleanup function
    return () => {
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      wsRef.current?.close();
    };
  }, [pushErrorToMessages]);

  // Escape close
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen, setIsChatOpen]);

  // Auto-resize textarea based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  // =========================================================================
  //      Main Message Sending Function (Sender)
  // =========================================================================

  // Sends the user's prompt to the server.
  const sendPrompt = async (quick?: string) => {
    const text = (quick ?? input).trim();
    if (!text) return;

    // Creates a "user" message and adds it to the chat history immediately.
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: now(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);

    // Clears the input field and activates loading indicators.
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);
    setIsGenerating(true);
    setUserScrolledUp(false);
    hasStarted.current = false;
    setDisplayedText('');
    setQueuePosition(null);

    // Memory management, edit for more or less history (use less if computer is made of wood)
    const maxHistory = 10;
    const messagesForApi = updated
      .slice(-maxHistory)
      .map(({role, content}) => ({role, content}));

    const requestId = requestIdRef.current;

    // Send to Server, after this, 'ws.onmessage' takes over to handle the responses.
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          id: requestId,
          model: selectedModel,
          messages: messagesForApi,
        })
      );
    } else {
      // Handles connection errors.
      pushErrorToMessages(
        'Service temporarily unavailable. Please try again later.'
      );
      setIsGenerating(false);
      setLoading(false);
    }
  };

  // =========================================================================
  //      Scroll Management
  // =========================================================================

  // Main scroll function
  const scrollToBottom = useCallback((behavior?: 'smooth' | 'auto') => {
    const scrollBehavior = typeof behavior === 'string' ? behavior : 'smooth';
    setIsScrolling(true);
    chatEndRef.current?.scrollIntoView({behavior: scrollBehavior});
    setIsScrolling(false);
  }, []);

  // Scroll to bottom when generating if user hasn't scrolled up
  useEffect(() => {
    if (isGenerating && displayedText && !userScrolledUp) {
      scrollToBottom('auto');
    }
  }, [isGenerating, displayedText, userScrolledUp, scrollToBottom]);

  // Scroll to bottom when a new message is added, sentPrompt will set userScrolledUp to false
  useEffect(() => {
    if (messages[messages.length - 1] && !userScrolledUp) {
      scrollToBottom('auto');
    }
  }, [messages, scrollToBottom, userScrolledUp]);

  // Scroll to bottom when chat is opened
  useEffect(() => {
    if (isChatOpen && !hasScrolledOnOpen.current && messages.length > 0) {
      hasScrolledOnOpen.current = true;
      setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
    }

    // Reset when chat is closed
    if (!isChatOpen) {
      hasScrolledOnOpen.current = false;
    }
  }, [isChatOpen, scrollToBottom, messages.length]);

  // Scroll detection
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const threshold = 10;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const scrolledUp = distanceFromBottom > threshold;
    setUserScrolledUp(scrolledUp);

    // Reset scroll flag when near the bottom
    if (distanceFromBottom <= threshold) {
      setIsScrolling(false);
    }
  }, [chatContainerRef]);

  // Add scroll listener to chat container
  useEffect(() => {
    const container = chatContainerRef.current;
    if (isChatOpen && container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isChatOpen, chatContainerRef, handleScroll]);

  return (
    <>
      <ChatButton setIsOpen={setIsChatOpen} isOpen={isChatOpen} />
      <Modal isOpen={isChatOpen} setIsOpen={setIsChatOpen}>
        <ChatLayout
          messages={messages}
          message={input}
          loading={loading}
          greeting={greeting}
          scrollToBottom={scrollToBottom}
          isScrolling={isScrolling}
          userScrolledUp={userScrolledUp}
          hasStarted={hasStarted.current}
          displayedText={displayedText}
          setIsChatOpen={setIsChatOpen}
          queuePosition={queuePosition}
          queueLength={queueLength}
          isSomeoneProcessing={isSomeoneProcessing}
          chatContainerRef={chatContainerRef}
          handleInputChange={handleInputChange}
          sendPrompt={sendPrompt}
          isGenerating={isGenerating}
          setMessages={setMessages}
          textareaRef={textareaRef}
          chatEndRef={chatEndRef}
        />
      </Modal>
    </>
  );
}
