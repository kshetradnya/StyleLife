/* ============================================================
   StyleScroll — Messaging Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initMessages();
});

function initMessages() {
    const conversationList = document.getElementById("conversation-list");
    const chatMessages = document.getElementById("chat-messages");
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("message-input");
    const sidebar = document.getElementById("messages-sidebar");
    const backBtn = document.getElementById("back-to-list");
    const headerName = document.getElementById("chat-header-name");
    const headerAvatar = document.getElementById("chat-header-avatar");

    // --- User Data ---
    const users = [
        { id: "u1", name: "StyleGuru_24", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=StyleGuru", unread: 2, online: true },
        { id: "u2", name: "NeonVibes", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NeonVibes", unread: 0, online: true },
        { id: "u3", name: "FashionForward", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=FashionForward", unread: 1, online: false },
        { id: "u4", name: "ModernStylist", avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=ModernStylist", unread: 0, online: true }
    ];

    let currentUserId = users[0].id;

    // --- Render Conversations ---
    function renderConversations() {
        if (!conversationList) return;
        conversationList.innerHTML = users.map(user => `
            <div class="conversation-item ${user.id === currentUserId ? 'active' : ''}" data-id="${user.id}">
                <div class="conversation-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                    ${user.online ? '<span class="online-status"></span>' : ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${user.name}</span>
                        <span class="conversation-time">2:30 PM</span>
                    </div>
                    <span class="conversation-snippet">Check out that new look I posted! 🤩</span>
                </div>
                ${user.unread > 0 ? `<div class="unread-badge">${user.unread}</div>` : ''}
            </div>
        `).join("");

        conversationList.querySelectorAll(".conversation-item").forEach(item => {
            item.addEventListener("click", () => {
                currentUserId = item.dataset.id;
                const user = users.find(u => u.id === currentUserId);
                if (user) {
                    headerName.textContent = user.name;
                    headerAvatar.src = user.avatar;
                    StyleScroll.showToast(`Loading chat with ${user.name}...`, "info");
                    renderMessages();
                    
                    // Mobile navigation
                    if (window.innerWidth <= 800) {
                        sidebar.classList.remove("open");
                        if (backBtn) backBtn.style.display = "flex";
                    }
                }
                renderConversations();
            });
        });
    }
    renderConversations();

    // --- Render Messages ---
    function renderMessages() {
        if (!chatMessages) return;
        
        // Initial set of messages
        chatMessages.innerHTML = `
            <div class="message-bubble message-received">
                Hey! Your latest look with the neon varsity jacket is absolute fire.
                <span class="message-time">2:15 PM</span>
            </div>
            <div class="message-bubble message-sent">
                Thanks so much! The AI suggested those cyan accents, and they really worked.
                <span class="message-time">2:18 PM</span>
            </div>
            <div class="message-bubble message-received">
                Definitely. We should do a collaboration session in the AR mirror soon.
                <span class="message-time">2:20 PM</span>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    renderMessages();

    // --- Send Message Logic ---
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const sentMsg = document.createElement("div");
        sentMsg.className = "message-bubble message-sent";
        sentMsg.innerHTML = `${text}<span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
        chatMessages.appendChild(sentMsg);
        
        messageInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulated Automatic Reply
        setTimeout(() => {
            const receivedMsg = document.createElement("div");
            receivedMsg.className = "message-bubble message-received";
            receivedMsg.innerHTML = `Let's make it happen! 🚀<span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
            chatMessages.appendChild(receivedMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            StyleScroll.showToast("New message received!", "info");
        }, 1500);
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

    // --- Mobile Back Button ---
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            sidebar.classList.add("open");
            backBtn.style.display = "none";
        });
    }
}
