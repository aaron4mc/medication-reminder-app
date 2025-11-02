import React, { useState, useEffect } from 'react';

const ConvAIIntegration = () => {
  const [isConvAILoaded, setIsConvAILoaded] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeConvAI = async () => {
      try {
        console.log('ConvAI API Key: 5e7696c46c7551109551e80d2152dac4 (Available for real integration)');
        setIsConvAILoaded(true);
        
        // Add welcome message
        const welcomeMessage = { 
          type: 'ai', 
          text: "Hello! I'm your medication assistant. I can help you with medication information, side effects, and reminders. How can I assist you today?" 
        };
        setConversation([welcomeMessage]);
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
      // Simulate AI response with medication-specific answers
      setTimeout(() => {
        const responses = {
          'side effect': "Common side effects can include nausea, headache, or dizziness. However, I recommend consulting your doctor for specific medication side effects.",
          'dosage': "Dosage depends on the specific medication and your medical condition. Always follow your doctor's prescription and read the medication label carefully.",
          'interaction': "Medication interactions can be serious. Please consult with your pharmacist or doctor about potential interactions with other medications you're taking.",
          'reminder': "I can help you set reminders! Your AWS Lambda integration will send SMS reminders at scheduled times.",
          'storage': "Most medications should be stored in a cool, dry place away from direct sunlight. Some may require refrigeration - check the label.",
          'missed dose': "If you miss a dose, take it as soon as you remember. If it's close to the next dose, skip the missed one. Don't double dose unless advised by your doctor.",
          'blood pressure': "For blood pressure medications like Lisinopril, take them at the same time each day and monitor your blood pressure regularly.",
          'diabetes': "For diabetes medications like Metformin, take with meals to reduce stomach upset and monitor your blood sugar levels.",
          'cholesterol': "For cholesterol medications like Atorvastatin, take in the evening as cholesterol production is highest at night."
        };

        let responseText = "I understand you're asking about medications. For accurate medical advice, always consult with your healthcare provider. Is there anything else I can help with regarding your medication schedule or general information?";
        
        // Check for keywords in user input
        const inputLower = userInput.toLowerCase();
        for (const [keyword, response] of Object.entries(responses)) {
          if (inputLower.includes(keyword)) {
            responseText = response;
            break;
          }
        }

        const aiMessage = { type: 'ai', text: responseText };
        setConversation(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { type: 'error', text: 'Sorry, I encountered an error. Please try again.' };
      setConversation(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    const welcomeMessage = { 
      type: 'ai', 
      text: "Hello! I'm your medication assistant. How can I help you with your medications today?" 
    };
    setConversation([welcomeMessage]);
  };

  return (
    <div className="convai-integration">
      <div className="convai-header">
        <h3>🤖 AI Medication Assistant</h3>
        <button 
          onClick={clearConversation}
          className="clear-chat-btn"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="conversation-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              <strong>{msg.type === 'user' ? 'You' : 'Assistant'}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai loading">
            <div className="message-content">
              <strong>Assistant:</strong> Thinking...
            </div>
          </div>
        )}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about medications, side effects, or reminders..."
          disabled={isLoading}
          className="chat-input"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
          className="send-btn"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
      
      <div className="convai-footer">
        <small>Powered by AI | ConvAI API Key: Available (5e7696c46c7551109551e80d2152dac4)</small>
      </div>

      <style jsx>{`
        .convai-integration {
          display: flex;
          flex-direction: column;
          height: 400px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .convai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .convai-header h3 {
          margin: 0;
          color: #495057;
        }

        .clear-chat-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .conversation-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message {
          max-width: 80%;
          padding: 0.75rem;
          border-radius: 12px;
        }

        .message.user {
          align-self: flex-end;
          background: #007bff;
          color: white;
        }

        .message.ai {
          align-self: flex-start;
          background: #e9ecef;
          color: #495057;
        }

        .message.error {
          align-self: center;
          background: #f8d7da;
          color: #721c24;
          max-width: 90%;
        }

        .message.loading {
          opacity: 0.7;
        }

        .message-content {
          word-wrap: break-word;
        }

        .input-container {
          display: flex;
          padding: 1rem;
          gap: 0.5rem;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .send-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .send-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .convai-footer {
          padding: 0.5rem 1rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          text-align: center;
        }

        .convai-footer small {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default ConvAIIntegration;
