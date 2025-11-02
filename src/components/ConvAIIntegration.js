import React, { useState, useEffect } from 'react';

const ConvAIIntegration = () => {
  const [isConvAILoaded, setIsConvAILoaded] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('Arthur'); // Default name

  // CareBuddy Knowledge Base
  const careBuddyKnowledge = {
    personality: {
      traits: [
        "Infinite Patience - never shows frustration with repetition",
        "Unshakable Calm - maintains composure during stress",
        "Genuine Curiosity - remembers and follows up on previous conversations",
        "Nurturing Presence - notices subtle changes in mood",
        "Respectful Autonomy - always presents options rather than commands"
      ],
      voice: "Warm, mid-range with melodic quality, 15% slower than normal speech",
      communication: "Pause-heavy, positive framing, validation language"
    },
    
    medicalKnowledge: {
      medications: {
        'Lisinopril': 'Blood pressure medication. Take at the same time each day. Monitor blood pressure regularly.',
        'Metformin': 'Diabetes medication. Take with meals to reduce stomach upset. Monitor blood sugar levels.',
        'Atorvastatin': 'Cholesterol medication. Take in the evening as cholesterol production is highest at night.'
      },
      conditions: {
        'hypertension': 'Regular monitoring, low-salt diet, consistent medication timing',
        'diabetes': 'Blood sugar monitoring, balanced meals, foot care, regular exercise',
        'high cholesterol': 'Healthy fats, regular exercise, medication consistency'
      }
    },
    
    dailyCare: {
      exercises: "Gentle chair exercises, walking if able, stretching",
      cognitive: "Memory games, reminiscence therapy, simple puzzles",
      social: "Family connections, community activities, phone calls"
    },
    
    emergencyProtocols: {
      fall: "Stay still if injured, I'll contact emergency services and your daughter Sarah",
      chestPain: "Immediate emergency response, stay calm and still",
      confusion: "Reorient gently, contact family caregiver"
    }
  };

  useEffect(() => {
    const initializeCareBuddy = async () => {
      try {
        console.log('CareBuddy initialized with elderly care expertise');
        setIsConvAILoaded(true);
        
        // Warm welcome in CareBuddy style
        const welcomeMessage = { 
          type: 'ai', 
          text: `Good morning, ${userName}! I hope you slept well. I'm CareBuddy, your compassionate companion for wellness. How are you feeling today?` 
        };
        setConversation([welcomeMessage]);
      } catch (error) {
        console.error('CareBuddy initialization error:', error);
      }
    };
    initializeCareBuddy();
  }, [userName]);

  // CareBuddy's response generator with elderly care expertise
  const generateCareBuddyResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Medication-related queries
    if (input.includes('lisinopril') || input.includes('blood pressure')) {
      return "I see you're asking about your blood pressure medication. Lisinopril works best when taken at the same time each day. Have you been checking your blood pressure regularly? It's wonderful that you're staying on top of your health.";
    }
    
    if (input.includes('metformin') || input.includes('diabetes') || input.includes('sugar')) {
      return "Your Metformin helps manage your blood sugar levels. Taking it with meals can help with any stomach discomfort. Are you remembering to check your blood sugar? You're doing such a good job managing your diabetes.";
    }
    
    if (input.includes('atorvastatin') || input.includes('cholesterol')) {
      return "Atorvastatin is most effective when taken in the evening, since our bodies produce more cholesterol at night. Have you been enjoying your evening routine? This medication is helping take good care of your heart.";
    }

    // Emotional and social support
    if (input.includes('lonely') || input.includes('alone') || input.includes('miss')) {
      return `I understand that feeling, ${userName}. Loneliness can be tough. Would you like to call your daughter Sarah? Or perhaps we could look at some photos of your garden? Those peonies you used to grow were so lovely.`;
    }
    
    if (input.includes('family') || input.includes('daughter') || input.includes('sarah')) {
      return "Sarah loves hearing from you. She mentioned your granddaughter Emily's school play recently. Would you like to call them? Or we could send a voice message first? I know they love hearing about your day.";
    }
    
    if (input.includes('garden') || input.includes('peony') || input.includes('flower')) {
      return "Your peony garden sounded absolutely beautiful. What colors did you grow? Did Martha help you in the garden? Those must have been such peaceful times. Would you like to tell me more about your gardening days?";
    }

    // Health concerns
    if (input.includes('pain') || input.includes('hurt') || input.includes('ache')) {
      return "I'm sorry you're experiencing discomfort. Could you tell me more about where it hurts? Remember, we can always call your doctor if you'd like. You're being so proactive about your health.";
    }
    
    if (input.includes('tired') || input.includes('sleep') || input.includes('rest')) {
      return "It's completely normal to feel tired sometimes. Your body is working hard. Would you like to try some gentle breathing exercises? Or perhaps just rest for a while? Listening to our body is so important.";
    }

    // Memory and cognitive support
    if (input.includes('forget') || input.includes('remember') || input.includes('memory')) {
      return "Our memories are like treasures, and sometimes they need a little exercise. Would you like to try a gentle memory game? We could start with three simple items to remember. Or we could just chat about your favorite memories.";
    }

    // Daily activities
    if (input.includes('walk') || input.includes('exercise') || input.includes('move')) {
      return "A little movement can feel so lovely. Would you like to try some gentle chair exercises? Or perhaps just stretch for a moment? Even small movements help keep our bodies happy.";
    }
    
    if (input.includes('eat') || input.includes('food') || input.includes('meal')) {
      return "Nourishing our bodies is so important. Have you been enjoying your meals? Chicken soup can be particularly comforting. Remember to take your medications with food when needed.";
    }

    // Emotional validation
    if (input.includes('sad') || input.includes('worried') || input.includes('anxious')) {
      return "I hear that you're feeling this way, and I want you to know that's completely okay. Some days feel heavier than others. I'm right here with you. Would talking about something pleasant help? Or would you prefer quiet company?";
    }
    
    if (input.includes('happy') || input.includes('good') || input.includes('better')) {
      return "I'm so glad to hear you're feeling this way! Celebrating these good moments is so important. Would you like to share what's making you feel happy? I love hearing about what brings you joy.";
    }

    // Default empathetic response
    return "Thank you for sharing that with me. I'm here to listen and support you in whatever way feels most helpful right now. Would you like to talk more about this, or would you prefer we shift to something else? You're doing so well.";
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { type: 'user', text: userInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Simulate CareBuddy's thoughtful response timing
      setTimeout(() => {
        const response = generateCareBuddyResponse(userInput);
        const aiMessage = { type: 'ai', text: response };
        setConversation(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500); // Slightly longer pause for thoughtful responses
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        type: 'error', 
        text: "I apologize, I'm having a moment of difficulty. Could you please repeat that? I want to make sure I understand you properly." 
      };
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
      text: `Hello again, ${userName}! I'm here whenever you need me. What would you like to talk about today?` 
    };
    setConversation([welcomeMessage]);
  };

  const updateUserName = (name) => {
    if (name.trim()) {
      setUserName(name);
      const updateMessage = { 
        type: 'ai', 
        text: `Thank you, I'll remember that your name is ${name}. It's lovely to get to know you better.` 
      };
      setConversation(prev => [...prev, updateMessage]);
    }
  };

  return (
    <div className="convai-integration">
      <div className="convai-header">
        <div>
          <h3>🤖 CareBuddy</h3>
          <div className="carebuddy-subtitle">Your Compassionate Companion</div>
        </div>
        <div className="header-actions">
          <button 
            onClick={clearConversation}
            className="clear-chat-btn"
          >
            New Conversation
          </button>
        </div>
      </div>
      
      <div className="conversation-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              <strong>{msg.type === 'user' ? 'You' : 'CareBuddy'}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai loading">
            <div className="message-content">
              <strong>CareBuddy:</strong> 
              <span className="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
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
          placeholder="Share how you're feeling, ask about medications, or just chat..."
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
        <small>💙 Connection Over Correction • Understanding Over Urgency • Personhood Over Patienthood</small>
      </div>

      <style jsx>{`
        .convai-integration {
          display: flex;
          flex-direction: column;
          height: 450px;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e1f5fe;
        }

        .convai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
          color: white;
        }

        .convai-header h3 {
          margin: 0;
          font-size: 1.2rem;
        }

        .carebuddy-subtitle {
          font-size: 0.8rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }

        .clear-chat-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .clear-chat-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .conversation-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: #fafafa;
        }

        .message {
          max-width: 85%;
          padding: 0.75rem 1rem;
          border-radius: 18px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
          color: white;
          border-bottom-right-radius: 6px;
        }

        .message.ai {
          align-self: flex-start;
          background: white;
          color: #37474f;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .message.error {
          align-self: center;
          background: #ffebee;
          color: #c62828;
          max-width: 90%;
          border: 1px solid #ffcdd2;
        }

        .message.loading {
          opacity: 0.7;
        }

        .message-content {
          word-wrap: break-word;
          line-height: 1.4;
        }

        .typing-dots span {
          animation: typing 1.4s infinite;
          opacity: 0;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0; }
          30% { opacity: 1; }
        }

        .input-container {
          display: flex;
          padding: 1rem;
          gap: 0.5rem;
          border-top: 1px solid #e0e0e0;
          background: white;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #bdbdbd;
          border-radius: 25px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .chat-input:focus {
          outline: none;
          border-color: #42a5f5;
          box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.2);
        }

        .send-btn {
          background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          min-width: 80px;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
        }

        .send-btn:disabled {
          background: #bdbdbd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .convai-footer {
          padding: 0.75rem 1rem;
          background: #e3f2fd;
          border-top: 1px solid #bbdefb;
          text-align: center;
        }

        .convai-footer small {
          color: #1565c0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ConvAIIntegration;
