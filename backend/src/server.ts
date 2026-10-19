import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { setIO } from './services/socketService';
import { setupSocketHandlers } from './sockets/socketHandler';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Express app
    const app = createApp();
    const server = http.createServer(app);

    // 3. Attach Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    setIO(io);
    setupSocketHandlers(io);

    // 4. Start listening
    server.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(` TaskFlow Backend Server running on port ${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Socket.IO: initialized & ready for WebSocket`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
