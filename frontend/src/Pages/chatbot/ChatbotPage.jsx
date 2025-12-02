import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { chatbotAPI } from '../../services/api'; // Import the chatbot API function
import '../../styles/chatbot/ChatbotPage.css';

const ChatbotPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm PsyPlex AI, your emotion-aware companion. How are you feeling today? 😊", sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // State for typing indicator
  const chatAreaRef = useRef(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to send message to backend
  const sendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInputValue('');
      setIsTyping(true); // Show typing indicator

      try {
        // Send POST request to /api/chat with { message: inputValue }
        const response = await chatbotAPI.sendMessage(inputValue);
        const botReply = response.data.reply; // Assuming backend returns { reply: "..." }

        // Add bot response after a short delay for realism
        setTimeout(() => {
          const botResponse = { id: messages.length + 2, text: botReply, sender: 'bot' };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 500); // Simulate processing time
      } catch (error) {
        console.error('Error sending message:', error);
        // Handle server error gracefully
        setTimeout(() => {
          const errorMessage = { id: messages.length + 2, text: 'Server not responding. Please try again later.', sender: 'bot' };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
        }, 500);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Handle suggestion clicks - now dynamic, sends to backend
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion); // Set input to suggestion
    // Optionally, auto-send or let user press enter
    // For now, just set the input
  };

  return (
    <div className="chatbot-page">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="chatbot-main">
        <div className="chatbot-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="chatbot-info">
            <h1>PsyPlex AI 🤖</h1>
            <div className="status-indicator">
              <span className="status-dot"></span>
              Active · Emotion-Aware
            </div>
          </div>
          <div className="mood-badge">
            😊 Calm
          </div>
        </div>
        <div className="chat-area" ref={chatAreaRef}>
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender} fade-in`}>
              <div className="message-bubble">
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot fade-in">
              <div className="message-bubble typing">
                Bot is typing...
              </div>
            </div>
          )}
        </div>
        <div className="suggestions-bar">
          <div className="suggestion-chips">
            <button className="chip" onClick={() => handleSuggestionClick('Breathing Exercise')}>Breathing Exercise</button>
            <button className="chip" onClick={() => handleSuggestionClick('Mindfulness')}>Mindfulness</button>
            <button className="chip" onClick={() => handleSuggestionClick('Relaxation Guide')}>Relaxation Guide</button>
          </div>
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="message-input"
          />
          <button className="voice-button">🎤</button>
          <button className="send-button" onClick={sendMessage} disabled={isTyping}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
