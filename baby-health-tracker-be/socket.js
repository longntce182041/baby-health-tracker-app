const { Server } = require("socket.io");

let ioInstance = null;

const initSocket = (httpServer) => {
    ioInstance = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    ioInstance.on("connection", (socket) => {
        socket.on("join:consultation", (consultationId) => {
            if (!consultationId) return;
            socket.join(`consultation:${consultationId}`);
        });

        socket.on("leave:consultation", (consultationId) => {
            if (!consultationId) return;
            socket.leave(`consultation:${consultationId}`);
        });
    });

    return ioInstance;
};

const getSocketIO = () => ioInstance;

module.exports = {
    initSocket,
    getSocketIO,
};
