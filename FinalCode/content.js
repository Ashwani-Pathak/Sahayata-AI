const helpImageURL = chrome.runtime.getURL("assets/assistance.png");

window.addEventListener("load", addAIHelp);

function addAIHelp() {
  const AIhelpButton = document.createElement("img");
  AIhelpButton.id = "assistance-button";
  AIhelpButton.src = helpImageURL;
  AIhelpButton.alt = "AI HELP";
  Object.assign(AIhelpButton.style, {
    cursor: "pointer",
    marginLeft: "10px",
    height: "40px",
    width: "40px"
  });

  const askDoubtButton = document.getElementsByClassName("ant-row  d-flex gap-4 mt-1 css-19gw05y")[0];
  askDoubtButton.insertAdjacentElement("afterend", AIhelpButton);

  AIhelpButton.addEventListener("click", showChatbot);
}

// --- Global state for chat, bookmarks, settings, gamification ---
let chatHistory = JSON.parse(localStorage.getItem('sahayata_history') || '[]');
let bookmarks = JSON.parse(localStorage.getItem('sahayata_bookmarks') || '[]');
let userSettings = JSON.parse(localStorage.getItem('sahayata_settings') || '{}');
let gamification = JSON.parse(localStorage.getItem('sahayata_gamification') || '{"points":0,"streak":0,"achievements":[]}');
function saveState() {
  localStorage.setItem('sahayata_history', JSON.stringify(chatHistory));
  localStorage.setItem('sahayata_bookmarks', JSON.stringify(bookmarks));
  localStorage.setItem('sahayata_settings', JSON.stringify(userSettings));
  localStorage.setItem('sahayata_gamification', JSON.stringify(gamification));
}

function showChatbot() {
  if (document.getElementById("chatModal")) return;

  // --- Re-sync state from localStorage when opening modal ---
  chatHistory = JSON.parse(localStorage.getItem('sahayata_history') || '[]');
  bookmarks = JSON.parse(localStorage.getItem('sahayata_bookmarks') || '[]');
  userSettings = JSON.parse(localStorage.getItem('sahayata_settings') || '{}');
  gamification = JSON.parse(localStorage.getItem('sahayata_gamification') || '{"points":0,"streak":0,"achievements":[]}');
  let darkMode = userSettings.darkMode || false;

  // --- Helper to apply dark mode to all UI elements ---
  function applyTheme() {
    const isDark = userSettings.darkMode;
    chatModal.style.background = isDark ? "linear-gradient(145deg, #23272f, #181a20)" : "linear-gradient(145deg, #f4f6fa, #ffffff)";
    chatModal.style.backgroundColor = isDark ? "#23272f" : "#f7f9fc";
    chatHeader.style.backgroundColor = isDark ? "#181a20" : "#033042";
    chatBody.style.backgroundColor = isDark ? "#23272f" : "#eaf1fb";
    chatFooter.style.backgroundColor = isDark ? "#23272f" : "#ffffff";
    chatBody.style.color = isDark ? "#fff" : "#000";
    chatFooter.style.color = isDark ? "#fff" : "#000";
    // Fix input and button text color
    chatInput.style.background = isDark ? "#23272f" : "#fff";
    chatInput.style.color = isDark ? "#fff" : "#000";
    chatInput.style.border = isDark ? "1px solid #444" : "1px solid #ccc";
    sendButton.style.background = isDark ? "linear-gradient(135deg, #033042 0%, #23272f 100%)" : "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)";
    sendButton.style.color = isDark ? "#fff" : "#222";
    // Placeholder color
    chatInput.style.setProperty('caret-color', isDark ? '#fff' : '#222');
    chatInput.style.setProperty('::placeholder', isDark ? '#eee' : '#888');
    // Modal input/button text
    document.querySelectorAll('.sahayata-modal input, .sahayata-modal button, .sahayata-modal select').forEach(el => {
      el.style.background = isDark ? '#23272f' : '#fff';
      el.style.color = isDark ? '#fff' : '#033042';
      el.style.border = isDark ? '1px solid #444' : '1px solid #ccc';
    });
    // Update dark mode icon
    darkModeBtn.innerHTML = isDark
      ? `<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M6.76 4.84l-1.8-1.79-1.42 1.41 1.79 1.8 1.43-1.42zm10.45 10.45l1.79 1.8 1.42-1.41-1.8-1.79-1.41 1.4zM12 4V1h-1v3h1zm0 19v-3h-1v3h1zm8.66-13.66l-1.41-1.41-1.8 1.79 1.41 1.42 1.8-1.8zM4 12H1v1h3v-1zm19 0h-3v1h3v-1zm-4.24 7.76l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM12 20a8 8 0 100-16 8 8 0 000 16z\" stroke=\"#fff\" stroke-width=\"2\"/></svg>`
      : `<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    // Update modals if open
    document.querySelectorAll('.sahayata-modal-bg').forEach(bg => {
      const modal = bg.querySelector('.sahayata-modal');
      if (modal) {
        modal.style.background = isDark ? '#033042' : '#fff';
        modal.style.color = isDark ? '#fff' : '#033042';
      }
    });
  }

  // --- Chat Modal ---
  const chatModal = document.createElement("div");
  chatModal.id = "chatModal";
  Object.assign(chatModal.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    height: "500px",
    minWidth: "320px",
    minHeight: "320px",
    maxWidth: "98vw",
    maxHeight: "98vh",
    backgroundColor: darkMode ? "#23272f" : "#f7f9fc",
    border: "1px solid #ccc",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    zIndex: "1000",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', sans-serif",
    transition: "height 0.3s ease, background 0.3s",
    resize: "both",
    backdropFilter: "blur(12px)",
    border: "none",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    background: darkMode ? "linear-gradient(145deg, #23272f, #181a20)" : "linear-gradient(145deg, #f4f6fa, #ffffff)",
    pointerEvents: "auto"
  });

  // --- Custom resize handle for better UX ---
  if (!document.getElementById('sahayata-resize-style')) {
    const style = document.createElement('style');
    style.id = 'sahayata-resize-style';
    style.innerHTML = `
      #chatModal::-webkit-resizer { background: none; }
      .sahayata-resize-handle {
        position: absolute; right: 2px; bottom: 2px; width: 28px; height: 28px; cursor: se-resize; z-index: 10;
        background: linear-gradient(135deg, #03304222 60%, #fff0 100%);
        border-bottom-right-radius: 16px;
        display: flex; align-items: flex-end; justify-content: flex-end;
      }
      .sahayata-resize-handle svg { opacity: 0.7; }
      .sahayata-resize-handle:hover svg { opacity: 1; }
    `;
    document.head.appendChild(style);
  }
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'sahayata-resize-handle';
  resizeHandle.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 19h14M9 15h10M13 11h6" stroke="#033042" stroke-width="2"/></svg>`;
  chatModal.appendChild(resizeHandle);
  // Optional: keep modal within viewport on resize
  chatModal.addEventListener('mouseup', () => {
    const rect = chatModal.getBoundingClientRect();
    let changed = false;
    if (rect.right > window.innerWidth) { chatModal.style.left = (window.innerWidth - rect.width/2) + 'px'; changed = true; }
    if (rect.bottom > window.innerHeight) { chatModal.style.top = (window.innerHeight - rect.height/2) + 'px'; changed = true; }
    if (rect.left < 0) { chatModal.style.left = (rect.width/2) + 'px'; changed = true; }
    if (rect.top < 0) { chatModal.style.top = (rect.height/2) + 'px'; changed = true; }
    if (changed) chatModal.style.transform = 'none';
  });

  // --- Chat Header with compact, responsive layout ---
  const chatHeader = document.createElement("div");
  Object.assign(chatHeader.style, {
    backgroundColor: "#033042",
    color: "#ffffff",
    padding: "10px 12px 10px 16px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "move",
    userSelect: "none",
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px",
    boxShadow: "0 2px 8px rgba(3,48,66,0.08)",
    minHeight: "48px"
  });

  const title = document.createElement("span");
  title.innerText = "SAHAYTA AI";
  title.style.letterSpacing = "2px";
  title.style.fontWeight = "bold";
  title.style.fontSize = "16px";
  title.style.flex = "1";
  title.style.textAlign = "center";
  title.style.marginLeft = "-40px"; // visually center with icons on both sides

  // --- Main feature icons group ---
  const mainIcons = document.createElement("div");
  mainIcons.style.display = "flex";
  mainIcons.style.gap = "10px";
  mainIcons.style.alignItems = "center";
  mainIcons.style.flexShrink = "0";

  // --- Utility icons group (right) ---
  const utilIcons = document.createElement("div");
  utilIcons.style.display = "flex";
  utilIcons.style.gap = "6px";
  utilIcons.style.alignItems = "center";
  utilIcons.style.flexShrink = "0";

  // Helper for SVG icons (smaller, more compact)
  function makeIcon(svg, title) {
    const span = document.createElement("span");
    span.innerHTML = svg;
    span.title = title;
    span.style.display = "inline-flex";
    span.style.alignItems = "center";
    span.style.justifyContent = "center";
    span.style.width = "20px";
    span.style.height = "20px";
    span.style.borderRadius = "50%";
    span.style.transition = "background 0.18s, box-shadow 0.18s, transform 0.18s";
    span.style.cursor = "pointer";
    span.style.position = "relative";
    span.style.zIndex = "2";
    span.style.pointerEvents = "auto";
    span.onmouseover = () => {
      span.style.background = "rgba(255,255,255,0.10)";
      span.style.boxShadow = "0 2px 8px rgba(3,48,66,0.12)";
      span.style.transform = "scale(1.08)";
    };
    span.onmouseleave = () => {
      span.style.background = "none";
      span.style.boxShadow = "none";
      span.style.transform = "scale(1)";
    };
    return span;
  }

  // Modern SVGs (all #fff for consistency)
  const bookmarkBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 3a2 2 0 0 0-2 2v16l8-5.2 8 5.2V5a2 2 0 0 0-2-2H6z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  `, "Bookmarks");
  const historyBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  `, "History");
  const settingsBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15.4 9a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  `, "Settings");
  const darkModeBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  `, "Dark/Light Mode");
  const minimizeBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
  `, "Minimize");
  const closeBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
  `, "Close");

  // Add main feature icons (no gamification)
  mainIcons.appendChild(bookmarkBtn);
  mainIcons.appendChild(historyBtn);
  mainIcons.appendChild(settingsBtn);
  mainIcons.appendChild(darkModeBtn);

  // Add utility icons
  utilIcons.appendChild(minimizeBtn);
  utilIcons.appendChild(closeBtn);

  chatHeader.appendChild(mainIcons);
  chatHeader.appendChild(title);
  chatHeader.appendChild(utilIcons);

  const chatBody = document.createElement("div");
  chatBody.id = "chatBody";
  Object.assign(chatBody.style, {
    flex: "1",
    padding: "10px",
    overflowY: "auto",
    borderTop: "1px solid #ccc",
    borderBottom: "1px solid #ccc",
    backgroundColor: "#eaf1fb",
    whiteSpace: "pre-wrap",
  });

  const chatFooter = document.createElement("div");
  Object.assign(chatFooter.style, {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ccc",
    backgroundColor: "#ffffff",
    alignItems: "center",
  });

  const chatInput = document.createElement("input");
  chatInput.placeholder = "Type your message...";
  Object.assign(chatInput.style, {
    flex: "1",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    marginRight: "8px"
  });

  const voiceButton = document.createElement("button");
  voiceButton.title = "Voice Input";
  voiceButton.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="none"/>
      <path d="M12 16c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V23h2v-2.08c3.39-0.49 6-3.39 6-6.92h-2z" fill="#fff"/>
    </svg>
  `;
  Object.assign(voiceButton.style, {
    background: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
    border: "none",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(78,84,200,0.15)",
    transition: "box-shadow 0.2s, transform 0.2s",
    marginRight: "10px",
    cursor: "pointer",
    outline: "none",
    padding: "0"
  });
  voiceButton.onmouseover = () => {
    voiceButton.style.boxShadow = "0 6px 24px rgba(78,84,200,0.25)";
    voiceButton.style.transform = "scale(1.07)";
  };
  voiceButton.onmouseleave = () => {
    voiceButton.style.boxShadow = "0 4px 16px rgba(78,84,200,0.15)";
    voiceButton.style.transform = "scale(1)";
  };

  const sendButton = document.createElement("button");
  sendButton.innerText = "Send";
  sendButton.className = "sahayata-send-btn";
  Object.assign(sendButton.style, {
    background: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
    color: "#222",
    border: "2px solid red", // DEBUG: make border visible
    borderRadius: "18px",
    padding: "12px 28px",
    fontWeight: "bold",
    fontSize: "16px",
    boxShadow: "0 4px 16px rgba(67,233,123,0.12)",
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s",
    outline: "none"
  });
  sendButton.onmouseover = () => {
    sendButton.style.boxShadow = "0 6px 24px rgba(67,233,123,0.22)";
    sendButton.style.transform = "scale(1.05)";
  };
  sendButton.onmouseleave = () => {
    sendButton.style.boxShadow = "0 4px 16px rgba(67,233,123,0.12)";
    sendButton.style.transform = "scale(1)";
  };

  // Add listening animation CSS
  const styleId = 'sahayata-listening-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .listening-anim {
        box-shadow: 0 0 0 0 #4e54c8, 0 0 0 8px rgba(78,84,200,0.15), 0 0 0 16px rgba(143,148,251,0.10);
        animation: sahayata-pulse 1.2s infinite;
      }
      @keyframes sahayata-pulse {
        0% { box-shadow: 0 0 0 0 #4e54c8, 0 0 0 8px rgba(78,84,200,0.15), 0 0 0 16px rgba(143,148,251,0.10); }
        70% { box-shadow: 0 0 0 8px #4e54c8, 0 0 0 16px rgba(78,84,200,0.10), 0 0 0 24px rgba(143,148,251,0.05); }
        100% { box-shadow: 0 0 0 0 #4e54c8, 0 0 0 8px rgba(78,84,200,0.15), 0 0 0 16px rgba(143,148,251,0.10); }
      }
    `;
    document.head.appendChild(style);
  }

  voiceButton.addEventListener("click", () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Add listening animation
    voiceButton.classList.add('listening-anim');
    chatInput.placeholder = "Listening...";

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      chatInput.placeholder = "Type your message...";
      voiceButton.classList.remove('listening-anim');
    };

    recognition.onerror = (event) => {
      voiceButton.classList.remove('listening-anim');
      chatInput.placeholder = "Type your message...";
      let errorMsg = "";
      if (event.error === "no-speech") {
        errorMsg = "No speech detected. Please try again and speak clearly into your microphone.";
      } else if (event.error === "audio-capture") {
        errorMsg = "No microphone found. Please check your microphone settings.";
      } else if (event.error === "not-allowed") {
        errorMsg = "Microphone access denied. Please allow microphone access.";
      } else {
        errorMsg = "Speech recognition error: " + event.error;
      }
      appendMessage("ai", errorMsg);
    };

    recognition.onend = () => {
      voiceButton.classList.remove('listening-anim');
      chatInput.placeholder = "Type your message...";
    };
  });

  chatFooter.appendChild(chatInput);
  chatFooter.appendChild(voiceButton);
  chatFooter.appendChild(sendButton);

  chatModal.appendChild(chatHeader);
  chatModal.appendChild(chatBody);
  chatModal.appendChild(chatFooter);
  document.body.appendChild(chatModal);

  closeBtn.addEventListener("click", () => {
    document.body.removeChild(chatModal);
  });

  let isMinimized = false;
  minimizeBtn.addEventListener("click", () => {
    isMinimized = !isMinimized;
    chatBody.style.display = isMinimized ? "none" : "flex";
    chatFooter.style.display = isMinimized ? "none" : "flex";
    chatModal.style.height = isMinimized ? "50px" : "500px";
  });

  // Drag functionality
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  chatHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - chatModal.offsetLeft;
    dragOffsetY = e.clientY - chatModal.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      chatModal.style.left = (e.clientX - dragOffsetX) + "px";
      chatModal.style.top = (e.clientY - dragOffsetY) + "px";
      chatModal.style.transform = "none";
    }
  });

  // --- Modal helpers ---
  function createModal(titleText, contentElem) {
    const modalBg = document.createElement('div');
    modalBg.className = 'sahayata-modal-bg';
    Object.assign(modalBg.style, {
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 2000,
      background: 'rgba(3,48,66,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    const modal = document.createElement('div');
    modal.className = 'sahayata-modal';
    Object.assign(modal.style, {
      background: userSettings.darkMode ? '#033042' : '#fff', color: userSettings.darkMode ? '#fff' : '#033042', borderRadius: '16px', minWidth: '320px', maxWidth: '90vw',
      boxShadow: '0 8px 32px rgba(3,48,66,0.18)', padding: '24px 20px 18px 20px', position: 'relative',
      maxHeight: '80vh', overflowY: 'auto', fontFamily: "'Segoe UI',sans-serif"
    });
    const title = document.createElement('div');
    title.innerText = titleText;
    title.style.fontWeight = 'bold';
    title.style.fontSize = '18px';
    title.style.marginBottom = '12px';
    modal.appendChild(title);
    modal.appendChild(contentElem);
    const close = document.createElement('span');
    close.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    close.style.position = 'absolute';
    close.style.top = '12px';
    close.style.right = '16px';
    close.style.cursor = 'pointer';
    close.onclick = () => document.body.removeChild(modalBg);
    modal.appendChild(close);
    modalBg.appendChild(modal);
    return modalBg;
  }

  // --- Bookmarks Modal ---
  bookmarkBtn.onclick = () => {
    const content = document.createElement('div');
    if (bookmarks.length === 0) {
      content.innerText = 'No bookmarks yet.';
    } else {
      bookmarks.forEach((msg, i) => {
        const wrap = document.createElement('div');
        wrap.style.background = 'rgba(255,255,255,0.04)';
        wrap.style.borderRadius = '8px';
        wrap.style.marginBottom = '10px';
        wrap.style.padding = '10px';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'space-between';
        const txt = document.createElement('div');
        txt.innerText = msg.text.length > 120 ? msg.text.slice(0,120)+"..." : msg.text;
        txt.style.flex = '1';
        txt.style.fontSize = '14px';
        txt.style.marginRight = '10px';
        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '8px';
        // Restore
        const restore = document.createElement('button');
        restore.innerText = 'Restore';
        restore.style.cssText = 'background:#fff;color:#033042;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        restore.onclick = () => {
          appendMessage(msg.sender, msg.text);
          document.body.removeChild(modalBg);
        };
        // Copy
        const copy = document.createElement('button');
        copy.innerText = 'Copy';
        copy.style.cssText = 'background:#fff;color:#033042;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        copy.onclick = () => {
          navigator.clipboard.writeText(msg.text);
        };
        // Delete
        const del = document.createElement('button');
        del.innerText = 'Delete';
        del.style.cssText = 'background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        del.onclick = () => {
          bookmarks.splice(i,1); saveState(); document.body.removeChild(modalBg); bookmarkBtn.onclick();
        };
        btns.appendChild(restore); btns.appendChild(copy); btns.appendChild(del);
        wrap.appendChild(txt); wrap.appendChild(btns);
        content.appendChild(wrap);
      });
    }
    const modalBg = createModal('Bookmarks', content);
    document.body.appendChild(modalBg);
  };

  // --- History Modal ---
  historyBtn.onclick = () => {
    const content = document.createElement('div');
    if (chatHistory.length === 0) {
      content.innerText = 'No history yet.';
    } else {
      chatHistory.slice(-50).reverse().forEach((msg, i) => {
        const wrap = document.createElement('div');
        wrap.style.background = 'rgba(255,255,255,0.04)';
        wrap.style.borderRadius = '8px';
        wrap.style.marginBottom = '10px';
        wrap.style.padding = '10px';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'space-between';
        const txt = document.createElement('div');
        txt.innerText = msg.text.length > 120 ? msg.text.slice(0,120)+"..." : msg.text;
        txt.style.flex = '1';
        txt.style.fontSize = '14px';
        txt.style.marginRight = '10px';
        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '8px';
        // Restore
        const restore = document.createElement('button');
        restore.innerText = 'Restore';
        restore.style.cssText = 'background:#fff;color:#033042;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        restore.onclick = () => {
          appendMessage(msg.sender, msg.text);
          document.body.removeChild(modalBg);
        };
        // Copy
        const copy = document.createElement('button');
        copy.innerText = 'Copy';
        copy.style.cssText = 'background:#fff;color:#033042;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        copy.onclick = () => {
          navigator.clipboard.writeText(msg.text);
        };
        // Delete
        const del = document.createElement('button');
        del.innerText = 'Delete';
        del.style.cssText = 'background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;font-size:13px;';
        del.onclick = () => {
          chatHistory.splice(chatHistory.length-1-i,1); saveState(); document.body.removeChild(modalBg); historyBtn.onclick();
        };
        btns.appendChild(restore); btns.appendChild(copy); btns.appendChild(del);
        wrap.appendChild(txt); wrap.appendChild(btns);
        content.appendChild(wrap);
      });
    }
    const modalBg = createModal('History', content);
    document.body.appendChild(modalBg);
  };

  // --- Settings Modal ---
  settingsBtn.onclick = () => {
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '14px';
    // Tone
    const toneLabel = document.createElement('label');
    toneLabel.innerText = 'AI Tone:';
    const toneSelect = document.createElement('select');
    ["Default","Concise","Detailed","Beginner-friendly"].forEach(opt => {
      const o = document.createElement('option'); o.value = opt; o.innerText = opt; toneSelect.appendChild(o);
    });
    toneSelect.value = userSettings.tone || "Default";
    toneSelect.onchange = () => { userSettings.tone = toneSelect.value; saveState(); };
    toneLabel.appendChild(toneSelect);
    // Language
    const langLabel = document.createElement('label');
    langLabel.innerText = 'Default Language:';
    const langInput = document.createElement('input');
    langInput.type = 'text';
    langInput.value = userSettings.language || "";
    langInput.placeholder = "e.g. Python, JavaScript";
    langInput.oninput = () => { userSettings.language = langInput.value; saveState(); };
    langLabel.appendChild(langInput);
    // Font size
    const fontLabel = document.createElement('label');
    fontLabel.innerText = 'Font Size:';
    const fontInput = document.createElement('input');
    fontInput.type = 'number';
    fontInput.value = userSettings.fontSize || 14;
    fontInput.min = 10; fontInput.max = 24;
    fontInput.oninput = () => { userSettings.fontSize = fontInput.value; saveState(); };
    fontLabel.appendChild(fontInput);
    // Features
    const featuresLabel = document.createElement('label');
    featuresLabel.innerText = 'Features:';
    const features = ["Voice Input","Diagrams","Gamification"];
    features.forEach(f => {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = userSettings[f] !== false;
      cb.onchange = () => { userSettings[f] = cb.checked; saveState(); };
      featuresLabel.appendChild(cb);
      featuresLabel.appendChild(document.createTextNode(' '+f+' '));
    });
    content.appendChild(toneLabel);
    content.appendChild(langLabel);
    content.appendChild(fontLabel);
    content.appendChild(featuresLabel);
    const modalBg = createModal('Settings', content);
    document.body.appendChild(modalBg);
  };

  // Remove any previous onclicks to avoid duplicate handlers
  darkModeBtn.onclick = null;
  // --- Dark/Light Mode Toggle (set at the end to ensure correct reference) ---
  darkModeBtn.addEventListener('click', function handleDarkModeToggle(e) {
    userSettings.darkMode = !userSettings.darkMode;
    saveState();
    document.body.removeChild(chatModal);
    showChatbot();
    setTimeout(applyTheme, 50);
  });
  setTimeout(applyTheme, 10);

  // --- Gamification logic ---
  function addPoints(n, label) {
    gamification.points += n;
    if (label && !gamification.achievements.includes(label)) {
      gamification.achievements.push(label);
    }
    saveState();
  }
  function addStreak() {
    gamification.streak += 1;
    if (gamification.streak === 1) addPoints(1, 'First Streak!');
    if (gamification.streak === 5) addPoints(5, '5 Streak!');
    saveState();
  }
  // --- Patch appendMessage for gamification ---
  const oldAppendMessage = appendMessage;
  appendMessage = function(sender, text) {
    oldAppendMessage(sender, text);
    // Save to history
    chatHistory.push({sender, text});
    if (chatHistory.length > 200) chatHistory.shift();
    saveState();
    // Add bookmark star to last message
    const chatBody = document.getElementById("chatBody");
    const lastMsg = chatBody.lastChild;
    if (!lastMsg) return;
    const star = document.createElement('span');
    star.innerHTML = `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' stroke='#FFD700' stroke-width='2' fill='none'/></svg>`;
    star.title = 'Bookmark';
    star.style.marginLeft = '8px';
    star.style.cursor = 'pointer';
    star.onclick = () => {
      bookmarks.push({sender, text}); saveState(); star.style.opacity = 0.5; addPoints(2, 'First Bookmark!');
    };
    lastMsg.appendChild(star);
    // Gamification: add points/streak for user messages
    if (sender === 'user') { addPoints(1); addStreak(); }
    if (sender === 'ai') { addPoints(1); }
  };

  // --- Add global style for transitions, tooltips, and chat bubbles ---
  if (!document.getElementById('sahayata-polish-style')) {
    const style = document.createElement('style');
    style.id = 'sahayata-polish-style';
    style.innerHTML = `
      .sahayata-modal-bg { animation: sahayata-fadein 0.25s; }
      .sahayata-modal { transition: box-shadow 0.2s, background 0.2s, color 0.2s; }
      @keyframes sahayata-fadein { from { opacity: 0; } to { opacity: 1; } }
      .sahayata-bubble { animation: sahayata-bubblein 0.22s cubic-bezier(.4,1.4,.6,1); box-shadow: 0 4px 16px rgba(3,48,66,0.10); background: linear-gradient(120deg, #f7fafc 60%, #eaf1fb 100%); }
      .sahayata-bubble.user { background: linear-gradient(120deg, #033042 60%, #0a3c5e 100%); color: #fff; }
      .sahayata-bubble.ai { background: linear-gradient(120deg, #fff 60%, #eaf1fb 100%); color: #033042; }
      @keyframes sahayata-bubblein { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
      .sahayata-tooltip { position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #033042; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.18s; z-index: 100; }
      .sahayata-icon-tooltip:hover .sahayata-tooltip { opacity: 1; }
      ::-webkit-scrollbar { width: 8px; background: #eaf1fb; }
      ::-webkit-scrollbar-thumb { background: #b3c2d1; border-radius: 6px; }
    `;
    document.head.appendChild(style);
  }

  // --- Add tooltips to header icons ---
  function addTooltip(icon, text) {
    icon.classList.add('sahayata-icon-tooltip');
    const tip = document.createElement('span');
    tip.className = 'sahayata-tooltip';
    tip.innerText = text;
    icon.appendChild(tip);
  }
  addTooltip(bookmarkBtn, 'Bookmarks');
  addTooltip(historyBtn, 'History');
  addTooltip(settingsBtn, 'Settings');
  addTooltip(darkModeBtn, 'Dark/Light Mode');
  addTooltip(minimizeBtn, 'Minimize');
  addTooltip(closeBtn, 'Close');

  // --- Auto-focus input on open/send ---
  setTimeout(() => { chatInput.focus(); }, 200);

  // --- Multi-line input (Shift+Enter for newline, Enter to send) ---
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  // --- Auto-scroll to latest message after every append (including diagrams) ---
  const origAppendMessagePolish = appendMessage;
  appendMessage = function(sender, text) {
    origAppendMessagePolish(sender, text);
    setTimeout(() => {
      const chatBody = document.getElementById('chatBody');
      chatBody.scrollTop = chatBody.scrollHeight;
      chatInput.focus();
    }, 80);
  };

  // --- Accessibility: ARIA labels and tab navigation for header icons ---
  [bookmarkBtn, historyBtn, settingsBtn, darkModeBtn, minimizeBtn, closeBtn].forEach((btn, i) => {
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', btn.title);
    btn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') btn.click(); };
  });
  chatInput.setAttribute('aria-label', 'Type your message');
  voiceButton.setAttribute('aria-label', 'Voice input');

  // --- Keyboard shortcuts ---
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') { e.preventDefault(); bookmarkBtn.click(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'h') { e.preventDefault(); historyBtn.click(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); settingsBtn.click(); }
    // Esc to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.sahayata-modal-bg');
      if (modal) document.body.removeChild(modal);
    }
  });

  // --- Markdown support in AI responses ---
  function renderMarkdown(text) {
    // Simple replacements for bold, italics, lists, links
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<ul><li>$1</li></ul>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Merge adjacent <ul>
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    return html;
  }
  // Patch appendMessage for markdown in AI responses
  const origAppendMessageMarkdown = appendMessage;
  appendMessage = function(sender, text) {
    if (sender === 'ai' && !/```[\s\S]*?```/.test(text)) {
      const chatBody = document.getElementById('chatBody');
      const messageDiv = document.createElement('div');
      messageDiv.className = 'sahayata-bubble ai';
      messageDiv.style.margin = '10px 0';
      messageDiv.style.display = 'flex';
      messageDiv.style.justifyContent = 'flex-start';
      messageDiv.innerHTML = `<div style='max-width:90%;word-wrap:break-word;font-size:14px;line-height:1.4;border-radius:10px;padding:12px;'>${renderMarkdown(text)}</div>`;
      chatBody.appendChild(messageDiv);
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
        if (typeof chatInput !== 'undefined') chatInput.focus();
      }, 80);
      // Add bookmark star for gamification
      if (typeof bookmarks !== 'undefined' && typeof saveState === 'function') {
        setTimeout(() => {
          const lastMsg = chatBody.lastChild;
          if (!lastMsg) return;
          const star = document.createElement('span');
          star.innerHTML = `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' stroke='#FFD700' stroke-width='2' fill='none'/></svg>`;
          star.title = 'Bookmark';
          star.style.marginLeft = '8px';
          star.style.cursor = 'pointer';
          star.onclick = () => {
            bookmarks.push({sender, text}); saveState(); star.style.opacity = 0.5; if (typeof addPoints === 'function') addPoints(2, 'First Bookmark!');
          };
          lastMsg.appendChild(star);
        }, 120);
      }
      // Gamification points/streak
      if (typeof addPoints === 'function' && typeof addStreak === 'function') {
        if (sender === 'user') { addPoints(1); addStreak(); }
        if (sender === 'ai') { addPoints(1); }
      }
      return;
    }
    origAppendMessageMarkdown(sender, text);
  };

  // --- Onboarding/help modal for new users ---
  if (!localStorage.getItem('sahayata_onboarded')) {
    setTimeout(() => {
      const content = document.createElement('div');
      content.innerHTML = `<b>Welcome to SAHAYTA AI!</b><br><br>
        <ul style='padding-left:18px;'>
          <li>Ask coding questions, get code, diagrams, and explanations.</li>
          <li>Use <b>Ctrl+B</b> for bookmarks, <b>Ctrl+H</b> for history, <b>Ctrl+K</b> for settings.</li>
          <li>Toggle dark/light mode, resize, and drag the chat box.</li>
          <li>Bookmark, restore, or copy any message.</li>
        </ul>
        <br><i>Enjoy a premium, accessible, and beautiful coding assistant!</i>`;
      const dontShow = document.createElement('button');
      dontShow.innerText = "Don't show again";
      dontShow.style.cssText = 'margin-top:18px;background:#033042;color:#fff;border:none;border-radius:6px;padding:6px 18px;cursor:pointer;font-size:15px;';
      dontShow.onclick = () => {
        localStorage.setItem('sahayata_onboarded', '1');
        document.body.removeChild(modalBg);
      };
      content.appendChild(dontShow);
      const modalBg = createModal('Welcome!', content);
      document.body.appendChild(modalBg);
    }, 600);
  }

  // --- Help icon in header ---
  const helpBtn = makeIcon(`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/><path d="M12 16h.01M12 12a2 2 0 1 0-2-2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
  `, "Help");
  addTooltip(helpBtn, 'Help & Tips');
  helpBtn.onclick = () => {
    const content = document.createElement('div');
    content.innerHTML = `<b>SAHAYTA AI Tips</b><br><br>
      <ul style='padding-left:18px;'>
        <li>Use <b>Ctrl+B</b> for bookmarks, <b>Ctrl+H</b> for history, <b>Ctrl+K</b> for settings.</li>
        <li>Shift+Enter for new line, Enter to send.</li>
        <li>Click the star to bookmark any message.</li>
        <li>Ask for diagrams (e.g., "Show me a binary tree diagram").</li>
        <li>Resize, drag, and toggle dark mode for comfort.</li>
      </ul>`;
    const modalBg = createModal('Help & Tips', content);
    document.body.appendChild(modalBg);
  };
  mainIcons.appendChild(helpBtn);

  // --- Prune history/bookmarks if over 200 ---
  if (chatHistory.length > 200) { chatHistory = chatHistory.slice(-200); saveState(); }
  if (bookmarks.length > 200) { bookmarks = bookmarks.slice(-200); saveState(); }

  // --- ARIA live region for AI responses ---
  let ariaLive = document.getElementById('sahayata-aria-live');
  if (!ariaLive) {
    ariaLive = document.createElement('div');
    ariaLive.id = 'sahayata-aria-live';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-9999px';
    document.body.appendChild(ariaLive);
  }

  // --- Animated loading indicator in chat ---
  let loadingMsgDiv = null;
  async function showLoading() {
    const chatBody = document.getElementById('chatBody');
    loadingMsgDiv = document.createElement('div');
    loadingMsgDiv.className = 'sahayata-bubble ai';
    loadingMsgDiv.style.margin = '10px 0';
    loadingMsgDiv.style.display = 'flex';
    loadingMsgDiv.style.justifyContent = 'flex-start';
    loadingMsgDiv.innerHTML = `<div style='max-width:90%;word-wrap:break-word;font-size:14px;line-height:1.4;border-radius:10px;padding:12px;display:flex;align-items:center;'><span class='sahayata-loading-dots'></span> <span style='margin-left:10px;'>Thinking...</span></div>`;
    chatBody.appendChild(loadingMsgDiv);
    setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 80);
  }
  function hideLoading() {
    if (loadingMsgDiv && loadingMsgDiv.parentNode) loadingMsgDiv.parentNode.removeChild(loadingMsgDiv);
    loadingMsgDiv = null;
  }
  if (!document.getElementById('sahayata-loading-style')) {
    const style = document.createElement('style');
    style.id = 'sahayata-loading-style';
    style.innerHTML = `
      .sahayata-loading-dots { display:inline-block;width:32px;text-align:left; }
      .sahayata-loading-dots:after { content: '...'; animation: sahayata-dots 1.2s infinite steps(3); }
      @keyframes sahayata-dots { 0% { content: ''; } 33% { content: '.'; } 66% { content: '..'; } 100% { content: '...'; } }
    `;
    document.head.appendChild(style);
  }

  // --- Patch sendButton to show/hide loading and update ARIA live ---
  sendButton.addEventListener("click", async () => {
    console.log("Send button clicked"); // DEBUG
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    appendMessage("user", userMessage);
    chatInput.value = "";
    showLoading();
    try {
      const responseText = await sendToGemini(userMessage);
      hideLoading();
      appendMessage("ai", responseText);
      ariaLive.innerText = responseText;
    } catch (error) {
      hideLoading();
      appendMessage("ai", "Error fetching response.");
      ariaLive.innerText = "Error fetching response.";
      console.error("Gemini API error:", error);
    }
  });

  // Inject custom CSS for IDE-like code blocks and copy button if not already present
  if (!document.getElementById('sahayata-ide-style')) {
    const style = document.createElement('style');
    style.id = 'sahayata-ide-style';
    style.innerHTML = `
      .sahayata-code {
        background: #23272f;
        color: #e6e6e6;
        border-radius: 8px;
        padding: 16px 16px 16px 48px;
        font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
        font-size: 14px;
        margin: 12px 0;
        overflow-x: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        white-space: pre;
        position: relative;
      }
      .sahayata-inline-code {
        background: #23272f;
        color: #e6e6e6;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
        font-size: 13px;
      }
      .sahayata-copy-btn {
        position: absolute;
        left: 12px;
        top: 12px;
        background: #444;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        opacity: 0.85;
        transition: background 0.18s, opacity 0.18s;
        z-index: 2;
      }
      .sahayata-copy-btn:hover {
        background: #222;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

function appendMessage(sender, text) {
  // Save to history and bookmarks if needed
  if (typeof chatHistory !== 'undefined' && typeof bookmarks !== 'undefined' && typeof saveState === 'function') {
    chatHistory.push({sender, text});
    if (chatHistory.length > 200) chatHistory.shift();
    saveState();
  }
  const chatBody = document.getElementById("chatBody");

  // --- AI message: render code blocks and markdown ---
  if (sender === 'ai') {
    let html = text
      // Code blocks: ```lang\ncode\n```
      .replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        // Add a copy button before the code block
        return `<div class='sahayata-code'><button class='sahayata-copy-btn'>Copy</button><code>${escapeHtml(code)}</code></div>`;
      })
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code class="sahayata-inline-code">$1</code>')
      // Bold, italics, lists, links as before
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<ul><li>$1</li></ul>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    // Create message bubble
    const messageDiv = document.createElement('div');
    messageDiv.className = 'sahayata-bubble ai';
    messageDiv.style.margin = '10px 0';
    messageDiv.style.display = 'flex';
    messageDiv.style.justifyContent = 'flex-start';
    messageDiv.innerHTML = `<div style='max-width:90%;word-wrap:break-word;font-size:14px;line-height:1.4;border-radius:10px;padding:12px;'>${html}</div>`;
    chatBody.appendChild(messageDiv);
    // Add copy button logic for each code block
    messageDiv.querySelectorAll('.sahayata-code').forEach(codeDiv => {
      const btn = codeDiv.querySelector('.sahayata-copy-btn');
      const codeElem = codeDiv.querySelector('code');
      if (btn && codeElem) {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(codeElem.innerText).then(() => {
            const original = btn.innerText;
            btn.innerText = 'Copied!';
            setTimeout(() => { btn.innerText = original; }, 1200);
          });
        });
      }
    });
    setTimeout(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
      if (typeof chatInput !== 'undefined') chatInput.focus();
    }, 80);
    // Add bookmark star for gamification
    if (typeof bookmarks !== 'undefined' && typeof saveState === 'function') {
      setTimeout(() => {
        const lastMsg = chatBody.lastChild;
        if (!lastMsg) return;
        const star = document.createElement('span');
        star.innerHTML = `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' stroke='#FFD700' stroke-width='2' fill='none'/></svg>`;
        star.title = 'Bookmark';
        star.style.marginLeft = '8px';
        star.style.cursor = 'pointer';
        star.onclick = () => {
          bookmarks.push({sender, text}); saveState(); star.style.opacity = 0.5; if (typeof addPoints === 'function') addPoints(2, 'First Bookmark!');
        };
        lastMsg.appendChild(star);
      }, 120);
    }
    // Gamification points/streak
    if (typeof addPoints === 'function' && typeof addStreak === 'function') {
      if (sender === 'user') { addPoints(1); addStreak(); }
      if (sender === 'ai') { addPoints(1); }
    }
    return;
  }

  // --- User message: plain text bubble ---
  const messageDiv = document.createElement("div");
  messageDiv.style.margin = "10px 0";
  messageDiv.style.display = "flex";
  messageDiv.style.justifyContent = sender === "user" ? "flex-end" : "flex-start";
  const bubble = document.createElement("div");
  bubble.style.maxWidth = "90%";
  bubble.style.wordWrap = "break-word";
  bubble.style.fontSize = "14px";
  bubble.style.lineHeight = "1.4";
  bubble.style.borderRadius = "10px";
  bubble.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
  bubble.style.padding = "12px";
  bubble.style.backgroundColor = sender === "user" ? "#2b384e" : "#ffffff";
  bubble.style.color = sender === "user" ? "#ffffff" : "#000000";
  bubble.style.fontFamily = "'Segoe UI', sans-serif";
  bubble.innerText = text;
  messageDiv.appendChild(bubble);
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  if (typeof chatInput !== 'undefined') chatInput.focus();
  // Add bookmark star for gamification
  if (typeof bookmarks !== 'undefined' && typeof saveState === 'function') {
    setTimeout(() => {
      const lastMsg = chatBody.lastChild;
      if (!lastMsg) return;
      const star = document.createElement('span');
      star.innerHTML = `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' stroke='#FFD700' stroke-width='2' fill='none'/></svg>`;
      star.title = 'Bookmark';
      star.style.marginLeft = '8px';
      star.style.cursor = 'pointer';
      star.onclick = () => {
        bookmarks.push({sender, text}); saveState(); star.style.opacity = 0.5;
        if (typeof addPoints === 'function') addPoints(2, 'First Bookmark!');
      };
      lastMsg.appendChild(star);
    }, 120);
  }
  // Gamification points/streak
  if (typeof addPoints === 'function' && typeof addStreak === 'function') {
    if (sender === 'user') { addPoints(1); addStreak(); }
    if (sender === 'ai') { addPoints(1); }
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let problemContext = null;
let problemJsonData = null;

// Intercept fetch to capture problem JSON data dynamically loaded by the page
const originalFetch = window.fetch;
window.fetch = async function(resource, init) {
  const response = await originalFetch(resource, init);

  try {
    // Check if the request URL contains 'problem' and ends with '.json' or similar pattern
    if (typeof resource === "string" && resource.includes("problem") && resource.endsWith(".json")) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      problemJsonData = data;
      console.log("Captured problem JSON data:", problemJsonData);
    }
  } catch (e) {
    console.error("Error capturing problem JSON data:", e);
  }

  return response;
};

function extractProblemDetails() {
  const titleElem = document.querySelector("h4.problem_heading");

  // Extract all sections with headings having class "problem_heading"
  const headingElems = document.querySelectorAll(".problem_heading");
  let description = "";
  let inputFormat = "";
  let outputFormat = "";
  let constraints = "";
  let sampleInput = "";
  let sampleOutput = "";
  let note = "";
  let hints = [];
  let solutionApproach = "";
  let code = "";

  headingElems.forEach(heading => {
    const headingText = heading.innerText.trim();
    const contentElem = heading.nextElementSibling;
    if (!contentElem) return;

    switch (headingText) {
      case "Description":
        description = contentElem.innerText.trim();
        break;
      case "Input Format":
        inputFormat = contentElem.innerText.trim();
        break;
      case "Output Format":
        outputFormat = contentElem.innerText.trim();
        break;
      case "Constraints":
        constraints = contentElem.innerText.trim();
        break;
      case "Sample Input 1":
      case "Sample Input 2":
      case "Sample Input 3":
        sampleInput += headingText + ":\n" + contentElem.innerText.trim() + "\n\n";
        break;
      case "Sample Output 1":
      case "Sample Output 2":
      case "Sample Output 3":
        sampleOutput += headingText + ":\n" + contentElem.innerText.trim() + "\n\n";
        break;
      case "Note":
        note = contentElem.innerText.trim();
        break;
      case "Hint 1":
      case "Hint 2":
        hints.push(contentElem.innerText.trim());
        break;
      case "Solution Approach":
        solutionApproach = contentElem.innerText.trim();
        break;
      case "Code":
        const codeContainer = contentElem.querySelector("div.coding_editorial_code_container__yn7vI");
        if (codeContainer) {
          code = codeContainer.innerText.trim();
        } else {
          code = contentElem.innerText.trim();
        }
        break;
      default:
        break;
    }
  });

  // Combine all extracted text into a detailed description
  const fullDescription = [
    description,
    "Input Format:\n" + inputFormat,
    "Output Format:\n" + outputFormat,
    "Constraints:\n" + constraints,
    sampleInput ? "Sample Inputs:\n" + sampleInput : "",
    sampleOutput ? "Sample Outputs:\n" + sampleOutput : "",
    note ? "Note:\n" + note : ""
  ].filter(Boolean).join("\n\n");

  return {
    title: titleElem ? titleElem.innerText.trim() : "",
    description: fullDescription,
    hints: hints.join("\n\n"),
    solution: solutionApproach,
    code: code
  };
}

async function sendToGemini(userText) {
  const apiKey = "AIzaSyDsizjvA9PTbfWRs0aApaRe1oDKGTBFcrY";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  if (!problemContext) {
    problemContext = extractProblemDetails();
  }

  // Build user preferences instructions
  let preferences = [];
  if (userSettings.language && userSettings.language.trim()) {
    preferences.push(`Preferred Programming Language: ${userSettings.language.trim()}`);
  }
  if (userSettings.tone && userSettings.tone !== 'Default') {
    preferences.push(`Preferred Tone: ${userSettings.tone}`);
  }
  if (userSettings.fontSize) {
    preferences.push(`Preferred Font Size: ${userSettings.fontSize}`);
  }
  // Features (Voice Input, Diagrams, Gamification)
  if (userSettings['Voice Input'] === false) {
    preferences.push('Do not offer or mention voice input features.');
  }
  if (userSettings['Diagrams'] === false) {
    preferences.push('Do not offer or mention diagrams or visual explanations.');
  }
  if (userSettings['Gamification'] === false) {
    preferences.push('Do not mention points, streaks, or gamification.');
  }
  let preferencesText = preferences.length > 0
    ? `\n\nUser Preferences:\n${preferences.map(p => '- ' + p).join('\n')}`
    : '';

  // Build comprehensive context text including all problem details and preferences
  let contextText = `Problem Title: ${problemContext?.title || ""}\n\n`;
  contextText += `Description:\n${problemContext?.description || ""}\n\n`;
  contextText += `Hints:\n${problemContext?.hints || ""}\n\n`;
  contextText += `Solution Approach:\n${problemContext?.solution || ""}\n\n`;
  contextText += `Code:\n${problemContext?.code || ""}\n\n`;
  contextText += preferencesText;
  contextText += `\nUser Question:\n${userText}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: contextText }] }]
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  return text;
}
