import { Server } from "socket.io";

const MESSAGE_EVENT = "chat:message";
const SYSTEM_EVENT = "chat:system";

export default class ChatServer {
    constructor(httpServer, { cors = { origin: "*" } } = {}) {
        this.io = new Server(httpServer, {
            cors,
        });

        this.connections = new Map();

        this.register();
    }

    register() {
        this.io.on("connection", (socket) => {
            const participant = {
                id: socket.id,
                nickname: socket.handshake.auth?.nickname ?? "Guest",
                joinedAt: Date.now(),
            };

            this.connections.set(socket.id, participant);

            socket.emit(SYSTEM_EVENT, {
                type: "welcome",
                payload: {
                    participant,
                    participants: Array.from(this.connections.values()),
                },
            });

            this.broadcastSystemMessage("joined", participant);

            socket.on(MESSAGE_EVENT, (payload, ack) =>
                this.handleMessage(socket, payload, ack)
            );

            socket.on("disconnect", () => {
                this.connections.delete(socket.id);
                this.broadcastSystemMessage("left", participant);
            });
        });
    }

    handleMessage(socket, payload = {}, ack) {
        const sanitized = this.normalizeMessage(payload.message);

        if (!sanitized) {
            if (typeof ack === "function") {
                ack({ ok: false, error: "Message is empty." });
            }
            return;
        }

        const message = {
            id: `${socket.id}-${Date.now()}`,
            author: this.connections.get(socket.id),
            message: sanitized,
            timestamp: Date.now(),
        };

        this.io.emit(MESSAGE_EVENT, message);

        if (typeof ack === "function") {
            ack({ ok: true });
        }
    }

    broadcastSystemMessage(type, participant) {
        this.io.emit(SYSTEM_EVENT, {
            type,
            payload: {
                participant,
                participants: Array.from(this.connections.values()),
            },
        });
    }

    normalizeMessage(value) {
        if (typeof value !== "string") return "";
        return value.trim().slice(0, 500);
    }
}
