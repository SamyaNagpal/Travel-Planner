const apiKey = 'AIzaSyCM1lB_hmfK0dr59Zk1SKcQu8_038kSa08'; // NOTE: Don't expose API keys publicly

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const destinationSelect = document.getElementById('destinationSelect');
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const onlineCount = document.getElementById('onlineCount');
  const emergencyBtn = document.querySelector('.emergency-btn');
  const emergencyModal = document.getElementById('emergencyModal');
  const closeModal = document.querySelector('.close-modal');

  // Sample data for chat messages
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

  // Initial values
  let currentDestination = '';
  let onlineUsers = 42;

  // Destination selection
  destinationSelect.addEventListener('change', function () {
    currentDestination = this.value;
    if (currentDestination) {
      loadDestinationData(currentDestination);
      onlineCount.textContent = Math.floor(Math.random() * 50) + 10; // Demo random online count
    } else {
      clearChat();
    }
  });

  // Send message button click
  sendMessageBtn.addEventListener('click', sendMessage);

  // Send on Enter key
  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Emergency button toggle
  emergencyBtn.addEventListener('click', function () {
    emergencyModal.style.display = 'block';
  });

  closeModal.addEventListener('click', function () {
    emergencyModal.style.display = 'none';
  });

  window.addEventListener('click', function (e) {
    if (e.target === emergencyModal) {
      emergencyModal.style.display = 'none';
    }
  });

  // Load messages for selected destination
  function loadDestinationData(destination) {
    clearChat();

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

  // Add message to chat
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

  // Add system message
  function addSystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'message system';
    systemDiv.textContent = message;
    chatMessages.appendChild(systemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Clear the chat messages
  function clearChat() {
    chatMessages.innerHTML = '';
  }

  // Send message from user
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentDestination) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      addMessageToChat("You", message, timestamp, "sent");
      messageInput.value = "";

      // Simulate bot response
      setTimeout(() => {
        const botReply = "Thanks for your message. We'll alert others in this area.";
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addMessageToChat("TravelSafe_Bot", botReply, botTime, "received");
      }, 1500);
    }
  }
});


  // Show form when button is clicked
  document.getElementById("addContactBtn").addEventListener("click", function () {
    document.getElementById("contactForm").style.display = "block";
  });

  // Handle form submission
  document.getElementById("submitContact").addEventListener("click", async function () {
    const name = document.getElementById("contactName").value.trim();
    const number = document.getElementById("contactNumber").value.trim();
    const relationship = document.getElementById("contactRelation").value.trim();

    if (!name || !number || !relationship) {
      alert("Please fill all fields.");
      return;
    }

    const response = await fetch("/add-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, number, relationship })
    });

    const data = await response.json();
    if (data.success) {
      alert("Contact added successfully!");
      document.getElementById("contactForm").reset();
      document.getElementById("contactForm").style.display = "none";
    } else {
      alert("Failed to add contact.");
    }
  });


document.getElementById("shareLocationBtn").addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        document.getElementById("locationDisplay").innerText = 
          `Latitude: ${latitude}\nLongitude: ${longitude}`;
      },
      (error) => {
        alert("Error getting location: " + error.message);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
document.getElementById("shareLocationBtn").addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Show coordinates on screen
        document.getElementById("locationDisplay").innerText = 
          `Latitude: ${latitude}\nLongitude: ${longitude}`;

        // Send location to backend
        fetch("http://127.0.0.1:3000/api/share-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ latitude, longitude }),
        })
        .then(response => response.json())
        .then(data => {
          alert(data.message); // e.g., "Location sent to emergency contacts"
        })
        .catch(error => {
          console.error("Error:", error);
        });
      },
      (error) => {
        alert("Error getting location: " + error.message);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

