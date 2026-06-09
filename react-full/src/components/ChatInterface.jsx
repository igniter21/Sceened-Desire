// react-full/src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect, Fragment } from 'react';
import axios from 'axios';
import './ChatInterface.css'; // Make sure CSS is imported

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/movie-chat/', {
        message: inputMessage
      });

      if (response.data.success) {
        const botMessage = { 
          role: 'assistant', 
          content: response.data.message 
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  const toggleModal = () => {
    if (!isModalOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: '🎬 Ask Your DESIRE!!' },
        { role: 'assistant', content: 'Ask me anything about movies: recommendations, actors, genres, plots, etc.' }
      ]);
    }
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close modal if user clicks outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      {/* Floating Button at Bottom Right */}
      <button 
        onClick={toggleModal} 
        className="floating-chat-btn"
        aria-label="Open Movie Chat"
      >
        💬
      </button>

      {/* Modal Overlay (only when open) */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={handleOverlayClick}
        >
          <div className="chat-modal">
            <div className="chat-header">
              <h2>🎬DESIRE</h2>
              <div className="header-actions">
                <button onClick={clearChat} className="clear-btn">
                  Clear Chat
                </button>
                <button onClick={closeModal} className="close-btn">
                  ×
                </button>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h3>Ask Your DESIRE!!</h3>
                  <p>Ask me anything about movies: recommendations, actors, genres, plots, etc.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                   <div className="message-content">
  {msg.content.split('\n').map((line, index, arr) => (
    <Fragment key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </Fragment>
  ))}
</div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about movies..."
                disabled={isLoading}
                rows="1"
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;