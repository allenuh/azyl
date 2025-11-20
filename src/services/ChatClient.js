import { io } from "socket.io-client";
import { EventEmitter } from "events";

const MESSAGE_EVENT = "chat:message";
const SYSTEM_EVENT = "chat:system";

const DEFAULT_PORT =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_CHAT_SERVER_PORT
        ? import.meta.env.VITE_CHAT_SERVER_PORT
        : "3001";

function resolveDefaultEndpoint() {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_CHAT_SERVER_URL) {
        return import.meta.env.VITE_CHAT_SERVER_URL;
    }

    if (typeof window === "undefined") {
        return `http://localhost:${DEFAULT_PORT}`;
    }

    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_PORT}`;
}

export default class ChatClient extends EventEmitter {
    constructor({ endpoint = resolveDefaultEndpoint(), nickname } = {}) {
        super();
        this.endpoint = endpoint;
        this.identity = this.createIdentity(nickname);
        this.socket = null;
    }

    connect() {
        if (this.socket) return;

        this.socket = io(this.endpoint, {
            autoConnect: false,
            transports: ["websocket", "polling"],
            auth: { nickname: this.identity.nickname },
        });

        this.registerSocketEvents();
        this.socket.connect();
    }

    disconnect() {
        if (!this.socket) return;
        this.socket.disconnect();
        this.socket.removeAllListeners();
        this.socket = null;
    }

    sendMessage(message) {
        if (!this.socket || !this.socket.connected) {
            return Promise.reject(new Error("Chat is disconnected."));
        }

        return new Promise((resolve, reject) => {
            this.socket.timeout(3000).emit(
                MESSAGE_EVENT,
                { message },
                (response = { ok: false, error: "Unknown error" }) => {
                    if (response.ok) {
                        resolve(response);
                    } else {
                        reject(new Error(response.error));
                    }
                }
            );
        });
    }

    registerSocketEvents() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            this.emit("connected", { id: this.socket.id });
        });

        this.socket.on("disconnect", (reason) => {
            this.emit("disconnected", { reason });
        });

        this.socket.on(MESSAGE_EVENT, (message) => {
            this.emit("message", message);
        });

        this.socket.on(SYSTEM_EVENT, (payload) => {
            this.emit("system", payload);
        });

        this.socket.on("connect_error", (error) => {
            this.emit("error", error);
        });
    }

    createIdentity(nickname) {
        return {
            nickname: nickname || `Wanderer-${Math.floor(Math.random() * 9999)}`,
        };
    }
}
