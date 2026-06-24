import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket

export const useSocket = (userId, { onNotification, onConnect, onDisconnect } = {}) => {
  const onNotificationRef = useRef(onNotification)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)

  // Always keep refs up to date with the latest callbacks
  useEffect(() => {
    onNotificationRef.current = onNotification
    onConnectRef.current = onConnect
    onDisconnectRef.current = onDisconnect
  })

  useEffect(() => {
    if (!userId) return

    fetch('/api/socket').finally(() => {
      socket = io({ path: '/api/socket', addTrailingSlash: false })

      socket.on('connect', () => {
        socket.emit('join', userId)
        onConnectRef.current?.()
      })

      socket.on('new_notification', (data) => {
        onNotificationRef.current?.(data)
      })

      socket.on('disconnect', () => {
        onDisconnectRef.current?.()
      })
    })

    return () => {
      if (socket) socket.disconnect()
    }
  }, [userId])
}