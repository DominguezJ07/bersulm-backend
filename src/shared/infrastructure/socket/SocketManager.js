import { Server } from 'socket.io';

let io = null;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    socket.join('global');

    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      socket.leave('global');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const notifyNewAppointment = (appointment) => {
  if (io) {
    io.to('global').emit('appointment:created', appointment);
    io.to(`user:${appointment.userId}`).emit('appointment:created', appointment);
  }
};

export const notifyCancelledAppointment = (appointment) => {
  if (io) {
    io.to('global').emit('appointment:cancelled', appointment);
    io.to(`user:${appointment.userId}`).emit('appointment:cancelled', appointment);
  }
};

export const notifyRaffleUpdate = (raffle) => {
  if (io) {
    io.to('global').emit('raffle:updated', raffle);
  }
};

export const notifyRaffleWinner = (raffle) => {
  if (io) {
    io.to('global').emit('raffle:winner', raffle);
    if (raffle.winnerId) {
      io.to(`user:${raffle.winnerId}`).emit('raffle:you-won', raffle);
    }
  }
};

export const notifyVotingEnded = (data) => {
  if (io) {
    io.to('global').emit('raffle:voting-ended', data);
  }
};

export const notifyLoyaltyUpdate = (card) => {
  if (io) {
    io.to(`user:${card.userId}`).emit('loyalty:updated', card);
  }
};

export const notifyAppointmentConfirmed = (appointment) => {
  if (!io) return;
  const userId = appointment.userId?._id?.toString() || appointment.userId?.toString() || appointment.userId;
  if (!userId) return;
  io.to(`user:${userId}`).emit('appointment:confirmed', {
    appointmentId: appointment._id?.toString(),
    date: appointment.date,
    time: appointment.time,
    serviceName: appointment.serviceId?.name || 'tu servicio',
    status: 'confirmed'
  });
};

export const notifyAppointmentCompleted = (appointment) => {
  if (!io) return;
  const userId = appointment.userId?._id?.toString() || appointment.userId?.toString() || appointment.userId;
  if (!userId) return;
  io.to(`user:${userId}`).emit('appointment:completed', {
    appointmentId: appointment._id?.toString(),
    date: appointment.date,
    time: appointment.time,
    serviceName: appointment.serviceId?.name || 'tu servicio',
    status: 'completed'
  });
};

export const notifyAppointmentCancelledByAdmin = (appointment) => {
  if (!io) return;
  const userId = appointment.userId?._id?.toString() || appointment.userId?.toString() || appointment.userId;
  if (!userId) return;
  io.to(`user:${userId}`).emit('appointment:cancelled-by-admin', {
    appointmentId: appointment._id?.toString(),
    date: appointment.date,
    time: appointment.time,
    serviceName: appointment.serviceId?.name || 'tu servicio',
    status: 'cancelled'
  });
};
