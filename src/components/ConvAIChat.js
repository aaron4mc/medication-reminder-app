import React, { useState, useRef, useEffect } from 'react';
import './ConvAIChat.css';

const ConvAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const API_KEY = '5e7696c46c7551109551e80d2152dac4';
  const API_URL = 'https://api.convai.com/chat/completions';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMessage],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to ConvAI:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className="convai-chat-button"
        onClick={() => setIsOpen(true)}
      >
        💊 AI Assistant
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="convai-chat-modal">
          <div className="convai-chat-header">
            <h3>Medication Assistant</h3>
            <div className="convai-chat-actions">
              <button onClick={clearChat}>Clear</button>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </div>

          <div className="convai-chat-messages">
            {messages.length === 0 && (
              <div className="convai-welcome-message">
                <p>Hello! I'm your medication assistant. I can help you with:</p>
                <ul>
                  <li>Medication information</li>
                  <li>Reminder setup tips</li>
                  <li>Side effect guidance</li>
                  <li>General health questions</li>
                </ul>
                <p>How can I assist you today?</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`convai-message ${
                  message.role === 'user' ? 'user-message' : 'ai-message'
                }`}
              >
                {message.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="convai-message ai-message loading">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="convai-chat-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about medications, side effects, or health tips..."
              rows="2"
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ConvAIChat;
