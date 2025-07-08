require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const {systemPromptTest} = require('./systemPrompts/prompt.example');

const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173'];
const PORT = process.env.PORT || 3000;
const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';

// WebSocket needs HTTP server for initial handshake, then upgrades to WebSocket protocol
const server = http.createServer(); // Handles WebSocket handshake
const wsServer = new WebSocket.Server({server}); // Handles WebSocket messages

// Heartbeat to detect and close broken connections
const interval = setInterval(() => {
  wsServer.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wsServer.on('close', () => {
  clearInterval(interval);
});

/* ========================================================
 *               Queue System
 * ======================================================== */

let wsQueue = [];
let isProcessingWs = false;
let processingId = null;

// Broadcast queue positions to all waiting clients
function broadcastQueuePositions() {
  wsQueue.forEach((entry, idx) => {
    if (entry.ws.readyState === WebSocket.OPEN) {
      entry.ws.send(
        JSON.stringify({
          type: 'queue',
          position: idx,
          length: wsQueue.length,
          isSomeoneProcessing: processingId !== null,
        })
      );
    }
  });
}

/* ========================================================
 *                WebSocket Handlers
 * ======================================================== */

wsServer.on('connection', (ws, req) => {
  ws.isAlive = true;
  // Heartbeat function to listen for pong from client
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('error', console.error);

  // Validate origin
  const origin = req.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    console.log(`Rejected connection from origin: ${origin}`);
    ws.close();
    return;
  }

  console.log('New WebSocket connection established');

  // Handle messages
  ws.on('message', async (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch {
      ws.send(JSON.stringify({type: 'error', message: 'Invalid JSON format'}));
      return;
    }

    // Validate required parameters
    if (!data.id || !data.model || !Array.isArray(data.messages)) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing required parameters: id, model, and messages array',
        })
      );
      return;
    }

    // Add to queue
    wsQueue.push({ws, ...data});
    broadcastQueuePositions();
    processWsQueue();
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsQueue = wsQueue.filter((q) => q.ws !== ws);
    broadcastQueuePositions();
  });
});

/* ========================================================
 *               Queue Processing
 * ======================================================== */

async function processWsQueue() {
  if (isProcessingWs || wsQueue.length === 0) return;

  isProcessingWs = true;
  const {ws, id, model, messages} = wsQueue.shift();
  processingId = id;
  broadcastQueuePositions();

  console.log(`Processing request ID: ${id} with model: ${model}`);

  try {
    const messagesWithSystemPrompt = [
      {role: 'system', content: systemPromptTest},
      ...messages,
    ];

    // Make streaming request to Ollama
    const ollamaRes = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model,
        messages: messagesWithSystemPrompt,
        stream: true,
      }),
    });

    // Handle API errors
    if (!ollamaRes.ok) {
      const errorBody = await ollamaRes.text();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: `Ollama API error (${ollamaRes.status}): ${errorBody}`,
          })
        );
      }

      isProcessingWs = false;
      processingId = null;
      broadcastQueuePositions();
      setTimeout(processWsQueue, 10);
      return;
    }

    // Process streaming response
    let buffer = '';
    let isCompleted = false;

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const {done, value} = await reader.read();

        if (done) break;
        if (ws.readyState !== WebSocket.OPEN) break;

        // Decode chunk and build JSON lines
        buffer += decoder.decode(value, {stream: true});
        let lines = buffer.split('\n');
        buffer = lines.pop();

        // Process each complete JSON line
        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);

            // Forward message content to client
            if (data.message && typeof data.message.content === 'string') {
              ws.send(line);
            }

            // Handle completion
            if (data.done) {
              ws.send(JSON.stringify({type: 'done'}));
              isCompleted = true;
              console.log(`Completed processing request ID: ${id}`);
              break;
            }

            // Handle errors
            if (data.error) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: data.error,
                })
              );
              isCompleted = true;
              break;
            }
          } catch (e) {
            console.warn(
              'JSON parsing error (likely incomplete chunk):',
              e.message
            );
          }
        }

        if (isCompleted) break;
      }
    } catch (streamError) {
      console.error('Stream reading error:', streamError);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Stream reading error occurred',
          })
        );
      }
    } finally {
      reader.releaseLock();
    }

    // Clean up remaining buffer
    if (buffer.trim() && !isCompleted) {
      try {
        const data = JSON.parse(buffer);
        if (data.done) {
          ws.send(JSON.stringify({type: 'done'}));
          console.log(`Completed processing request ID: ${id} (from buffer)`);
        }
      } catch (e) {
        console.warn('Failed to parse remaining buffer content:', e.message);
      }
    }
  } catch (err) {
    console.error('Error during streaming:', err);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Error occurred during streaming',
        })
      );
    }
  } finally {
    // Reset processing state
    isProcessingWs = false;
    processingId = null;
    broadcastQueuePositions();
    setTimeout(processWsQueue, 10);
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Ollama Chatbot Server running on 0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🤖 Ollama API: ${OLLAMA_API_URL}`);
  console.log(`🔒 Allowed origins: ${allowedOrigins.join(', ')}`);
});
