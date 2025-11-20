import express from "express";
import { createServer } from "http";
import ChatServer from "./ChatServer.js";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.CHAT_SERVER_PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST || "0.0.0.0";

app.get("/health", (_, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

new ChatServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
    },
});

httpServer.listen(PORT, HOST, () => {
    console.log(`Chat server listening on http://${HOST}:${PORT}`);
});
