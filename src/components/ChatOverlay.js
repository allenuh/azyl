export default class ChatOverlay {
    constructor({ mountNode = document.body, chatClient, onFocusChange = () => {} }) {
        if (!chatClient) {
            throw new Error("ChatOverlay requires a chatClient instance.");
        }

        this.mountNode = mountNode;
        this.chatClient = chatClient;
        this.onFocusChange = onFocusChange;
        this.elements = this.createElements();
        this.messageLimit = 120;
        this.currentStatusLabel = "Offline";

        this.bindUIEvents();
        this.registerClientEvents();
    }

    createElements() {
        const wrapper = document.createElement("section");
        wrapper.className = "chat-overlay";

        const header = document.createElement("header");
        header.className = "chat-header";
        header.innerHTML = `
            <span class="chat-title">Public Chat</span>
            <span class="chat-status" data-status="offline">Offline</span>
        `;

        const body = document.createElement("div");
        body.className = "chat-body";

        const list = document.createElement("ul");
        list.className = "chat-messages";
        body.appendChild(list);

        const form = document.createElement("form");
        form.className = "chat-form";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Say something nice…";
        input.autocomplete = "off";

        const button = document.createElement("button");
        button.type = "submit";
        button.textContent = "Send";

        form.append(input, button);

        wrapper.append(header, body, form);
        this.mountNode.appendChild(wrapper);

        return { wrapper, header, body, list, form, input, button, status: header.querySelector(".chat-status") };
    }

    bindUIEvents() {
        this.elements.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const value = this.elements.input.value.trim();
            if (!value) return;

            const originalValue = value;
            this.elements.input.value = "";

            this.chatClient
                .sendMessage(value)
                .catch((error) => {
                    this.elements.input.value = originalValue;
                    this.elements.input.focus();
                    this.pushSystemMessage(`Message failed: ${error.message}`);
                });
        });

        this.elements.input.addEventListener("focus", () => {
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
            this.onFocusChange(true);
        });

        this.elements.input.addEventListener("blur", () => {
            this.onFocusChange(false);
        });
    }

    registerClientEvents() {
        this.chatClient.on("connected", () => {
            this.setStatus("online");
            this.pushSystemMessage("Connected to chat.");
        });

        this.chatClient.on("disconnected", ({ reason }) => {
            this.setStatus("offline");
            this.pushSystemMessage(`Disconnected (${reason}).`);
        });

        this.chatClient.on("message", (message) => {
            this.pushMessage(message);
        });

        this.chatClient.on("system", ({ type, payload }) => {
            if (type === "welcome") {
                this.pushSystemMessage("Welcome to the public chat.");
                this.updatePopulation(payload?.participants?.length ?? 0);
                return;
            }

            if (type === "joined" || type === "left") {
                const name = payload?.participant?.nickname || "Guest";
                this.pushSystemMessage(`${name} ${type}.`);
                this.updatePopulation(payload?.participants?.length ?? 0);
            }
        });

        this.chatClient.on("error", (error) => {
            this.pushSystemMessage(`Connection error: ${error.message}`);
            this.setStatus("error");
        });
    }

    pushMessage({ author, message, timestamp }) {
        const item = document.createElement("li");
        item.className = "chat-message";

        const time = new Date(timestamp || Date.now()).toLocaleTimeString();
        const name = author?.nickname || "Anon";

        item.innerHTML = `
            <span class="chat-message__meta">[${time}] ${name}</span>
            <span class="chat-message__content">${this.escapeHtml(message)}</span>
        `;

        this.elements.list.appendChild(item);
        this.trimMessages();
        this.scrollToBottom();
    }

    pushSystemMessage(text) {
        const item = document.createElement("li");
        item.className = "chat-message chat-message--system";
        item.textContent = text;
        this.elements.list.appendChild(item);
        this.trimMessages();
        this.scrollToBottom();
    }

    setStatus(state) {
        this.elements.status.dataset.status = state;
        const labels = {
            online: "Online",
            offline: "Offline",
            error: "Error",
        };
        this.currentStatusLabel = labels[state] ?? state;
        this.elements.status.textContent = this.currentStatusLabel;
    }

    updatePopulation(count) {
        const base = this.currentStatusLabel || this.elements.status.textContent;
        this.elements.status.textContent = `${base} · ${count} online`;
    }

    trimMessages() {
        while (this.elements.list.children.length > this.messageLimit) {
            this.elements.list.removeChild(this.elements.list.firstChild);
        }
    }

    scrollToBottom() {
        this.elements.body.scrollTop = this.elements.body.scrollHeight;
    }

    escapeHtml(value) {
        const div = document.createElement("div");
        div.innerText = value;
        return div.innerHTML;
    }
}
