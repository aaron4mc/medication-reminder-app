import React, { useState, useEffect } from 'react';

const ConvAIIntegration = () => {
  const [isConvAILoaded, setIsConvAILoaded] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeConvAI = async () => {
      try {
        console.log('ConvAI SDK is available');
        setIsConvAILoaded(true);
      } catch (error) {
        console.error('ConvAI initialization error:', error);
      }
    };
    initializeConvAI();
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { type: 'user', text: userInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual ConvAI API call)
      setTimeout(() => {
        const responses = [
          "I can help with medication information. ConvAI API Key: 5e7696c46c7551109551e80d2152dac4 is configured.",
          "For medication safety, always take prescriptions as directed by your doctor.",
          "I can provide medication reminders and information when fully integrated.",
          "Remember to store medications properly and check expiration dates."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const aiMessage = { type: 'ai', text: randomResponse };
        setConversation(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { type: 'error', text: 'Error: ' + error.message };
      setConversation(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      borderRadius: '10px', 
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: '#007bff', marginTop: 0 }}>💊 Medication AI Assistant</h3>
      
      <div style={{ 
        height: '200px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '15px', 
        marginBottom: '15px',
        backgroundColor: 'white',
        borderRadius: '5px'
      }}>
        {conversation.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>
            Ask about medications, side effects, or reminders...
          </p>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} style={{ 
              margin: '10px 0',
              padding: '8px 12px',
              backgroundColor: msg.type === 'user' ? '#007bff' : 
                              msg.type === 'error' ? '#dc3545' : '#e9ecef',
              color: msg.type === 'user' ? 'white' : 
                    msg.type === 'error' ? 'white' : 'black',
              borderRadius: '8px',
              textAlign: msg.type === 'user' ? 'right' : 'left'
            }}>
              <strong>{msg.type === 'user' ? 'You' : 
                      msg.type === 'error' ? 'Error' : 'AI'}:</strong> {msg.text}
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            AI is thinking...
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your medication question..."
          disabled={isLoading}
          style={{ 
            flex: 1, 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '5px' 
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (userInput.trim() && !isLoading) ? '#007bff' : '#ccc',
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: (userInput.trim() && !isLoading) ? 'pointer' : 'not-allowed'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConvAIIntegration;
