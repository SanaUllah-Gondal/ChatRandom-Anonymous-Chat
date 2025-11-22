const io = require('socket.io')(3000, {
  cors: { origin: "*" }
});

const waitingRoom = [];

io.on('connection', (socket) => {
  console.log('🔌 New user connected:', socket.id);

  socket.on('join', () => {
    // Clean up: remove stale IDs
    waitingRoom.forEach((id, i) => {
      if (!io.sockets.sockets.has(id)) waitingRoom.splice(i, 1);
    });

    if (waitingRoom.length > 0) {
      const partnerId = waitingRoom.pop();
      const partner = io.sockets.sockets.get(partnerId);
      
      if (partner) {
        // Pair
        socket.partner = partnerId;
        partner.partner = socket.id;

        socket.emit('paired', { partnerId });
        partner.emit('paired', { partnerId: socket.id });

        console.log(`🤝 Paired: ${socket.id} ↔ ${partnerId}`);
      } else {
        waitingRoom.push(socket.id);
      }
    } else {
      waitingRoom.push(socket.id);
      console.log(`⏳ ${socket.id} waiting... (${waitingRoom.length} in queue)`);
    }
  });

  socket.on('startTyping', () => {
    if (socket.partner) {
      io.to(socket.partner).emit('typing');
    }
  });

  socket.on('stopTyping', () => {
    if (socket.partner) {
      io.to(socket.partner).emit('stopTyping');
    }
  });

  socket.on('message', (data) => {
    if (socket.partner) {
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
      io.to(socket.partner).emit('message', { text: data.text, time });
    }
  });

  socket.on('leave', () => {
    disconnectPartner(socket);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    disconnectPartner(socket);
    const idx = waitingRoom.indexOf(socket.id);
    if (idx > -1) waitingRoom.splice(idx, 1);
  });

  function disconnectPartner(sock) {
    if (sock.partner) {
      const partner = io.sockets.sockets.get(sock.partner);
      partner?.emit('disconnected');
      delete partner?.partner;
      delete sock.partner;
    }
  }
});

console.log('🚀 Server running on http://localhost:3000');