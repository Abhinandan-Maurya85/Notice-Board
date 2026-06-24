import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket already running')
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
  })

  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Student joins their own room by userId
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`)
      console.log(`User ${userId} joined room`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  res.end()
}

export default SocketHandler