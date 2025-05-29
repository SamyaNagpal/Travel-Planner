document.addEventListener("DOMContentLoaded", () => {
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const chatbot = document.getElementById("chatbot-container");

  // Toggle chatbot visibility
  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    chatbot.classList.toggle("hidden");
  });

  // Close chatbot if clicked outside
  document.addEventListener("click", (event) => {
    const clickedInside = chatbot.contains(event.target) || toggleBtn.contains(event.target);
    if (!clickedInside) {
      chatbot.classList.add("hidden");
    }
  });

  // Append a message to the chat area
  function appendMessage(content, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = type === "user" ? "user-message" : "bot-message";
    messageDiv.innerHTML = `<strong>${type === "user" ? "You" : "Bot"}:</strong> ${content}`;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Send the message to the bot
  async function sendMessage() {
    const userMessage = chatbotInput.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, "user");
    chatbotInput.value = "";

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      appendMessage(data.reply, "bot");
    } catch (error) {
      appendMessage("Bot error: Could not connect", "bot");
    }
  }

  // Send message on button click
  chatbotSend.addEventListener("click", sendMessage);

  // Send message on Enter key press
  chatbotInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
