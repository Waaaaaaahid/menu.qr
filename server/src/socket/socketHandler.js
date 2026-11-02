import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Restaurant owner joins their private restaurant notifications room
    socket.on('join_restaurant', (restaurantId) => {
      if (restaurantId) {
        socket.join(`restaurant_${restaurantId}`);
      }
    });

    // Customer joins order tracking room for real-time kitchen progress
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  return io;
};
