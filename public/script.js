const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');

// Maintain conversation history for context-aware responses
let conversation = [];

// Logika Perpindahan Tema (Theme Toggle)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user's message to UI and history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // 2. Show temporary "Thinking..." message
  const thinkingId = 'thinking-' + Date.now();
  appendMessage('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>', thinkingId, true);

  try {
    // 3. Send request to the backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    const botMessageElement = document.getElementById(thinkingId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.result || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Handle the response and replace the "Thinking..." text
    if (data && data.result) {
      // Render Markdown from Gemini using Marked.js
      botMessageElement.innerHTML = marked.parse(data.result);
      conversation.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    const botMessageElement = document.getElementById(thinkingId);
    if (botMessageElement) {
      botMessageElement.textContent = "Maaf, gagal menghubungi server. Pastikan server sudah jalan.";
    }
  }
});

function appendMessage(sender, content, id = null, isHtml = false) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (id) msg.id = id;
  if (isHtml) {
    msg.innerHTML = content;
  } else {
    msg.textContent = content;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
