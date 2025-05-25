let nav = document.querySelector('nav');

window.addEventListener('scroll', () =>{
    if(window.scrollY > 100){
        nav.classList.add('sticky_nav');
    }
    else{
        nav.classList.remove('sticky_nav');
    }
});

const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");
const chatbotMessages = document.getElementById("chatbot-messages");

chatbotSend.addEventListener("click", async () => {
  const userMessage = chatbotInput.value.trim();
  if (!userMessage) return;

  // Show user message
  chatbotMessages.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
  chatbotInput.value = "";

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    chatbotMessages.innerHTML += `<div><strong>Bot:</strong> ${data.reply}</div>`;
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  } catch (error) {
    chatbotMessages.innerHTML += `<div style="color:red;">Bot error: Could not connect</div>`;
  }
});
