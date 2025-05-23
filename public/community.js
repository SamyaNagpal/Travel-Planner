document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const destinationSelect = document.getElementById('destinationSelect');
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const onlineCount = document.getElementById('onlineCount');
  const emergencyBtn = document.querySelector('.emergency-btn');
  const emergencyModal = document.getElementById('emergencyModal');
  const closeModal = document.querySelector('.close-modal');

  // Sample data - Replace with real API calls
  const sampleMessages = {
    paris: [
      {
        sender: "TravelSafe_User123",
        message: "The Eiffel Tower area is generally safe, but watch out for pickpockets in crowded areas.",
        time: "10:30 AM",
        type: "received"
      },
      {
        sender: "LocalGuide_Paris",
        message: "Avoid taking the metro alone after midnight. Stick to well-lit areas.",
        time: "10:32 AM",
        type: "received"
      }
    ],
    tokyo: [
      {
        sender: "SoloTraveler_Emma",
        message: "Tokyo is very safe at all hours, but some bars in Roppongi can be sketchy.",
        time: "9:15 AM",
        type: "received"
      }
    ]
  };

  // Initialize
  let currentDestination = '';
  let onlineUsers = 42; // Sample data - replace with real-time updates

  // Event Listeners
  destinationSelect.addEventListener('change', function() {
    currentDestination = this.value;
    if (currentDestination) {
      loadDestinationData(currentDestination);
      onlineCount.textContent = Math.floor(Math.random() * 50) + 10; // Random online count for demo
    } else {
      clearChat();
    }
  });

  sendMessageBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  emergencyBtn.addEventListener('click', function() {
    emergencyModal.style.display = 'block';
  });

  closeModal.addEventListener('click', function() {
    emergencyModal.style.display = 'none';
  });

  window.addEventListener('click', function(e) {
    if (e.target === emergencyModal) {
      emergencyModal.style.display = 'none';
    }
  });

  // Functions
  function loadDestinationData(destination) {
    // In a real app, this would be an API call
    clearChat();
    
    // Simulate loading
    setTimeout(() => {
      if (sampleMessages[destination]) {
        sampleMessages[destination].forEach(msg => {
          addMessageToChat(msg.sender, msg.message, msg.time, msg.type);
        });
      } else {
        addSystemMessage(`Welcome to the ${destinationSelect.options[destinationSelect.selectedIndex].text} safety community!`);
      }
    }, 500);
  }

  function addMessageToChat(sender, message, time, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    messageDiv.innerHTML = `
      <div class="message-info">
        <span class="sender">${sender}</span>
        <span class="time">${time}</span>
      </div>
      <div class="message-text">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addSystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'message system';
    systemDiv.textContent = message;
    chatMessages.appendChild(systemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentDestination) {
      // In a real app, this would send to your backend
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      addMessageToChat("You", message, timestamp, "sent");
      
      // Simulate response after 1-3 seconds
      setTimeout(() => {
        const responses = [
          "Thanks for sharing that safety tip!",
          "I'll keep that in mind when I visit.",
          "Can you share more details about that area?",
          "That matches my experience too."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomUser = ["TravelBuddy_22", "Wanderlust_Girl", "SoloExplorer"][Math.floor(Math.random() * 3)];
        addMessageToChat(randomUser, randomResponse, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "received");
      }, 1000 + Math.random() * 2000);
      
      messageInput.value = '';
    }
  }

  function clearChat() {
    chatMessages.innerHTML = '';
  }

  // Initialize with first destination if available
  if (destinationSelect.options.length > 1) {
    destinationSelect.selectedIndex = 1;
    destinationSelect.dispatchEvent(new Event('change'));
  }
});