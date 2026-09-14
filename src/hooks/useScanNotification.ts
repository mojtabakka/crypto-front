import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const NOTIFICATION_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

export function useScanNotification() {
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  const showNotification = useCallback(
    (title: string, body: string) => {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/vite.svg' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/vite.svg' });
          }
        });
      }
    },
    [],
  );

  useEffect(() => {
    const socket = io(window.location.origin.replace(':5173', ':3000'), {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to notification server');
    });

    socket.on('scanComplete', (data: { totalCount: number; duration: number; message: string }) => {
      playSound();
      showNotification('Scan Complete', data.message);
      console.log('Scan complete:', data);
    });

    socket.on('scanError', (data: { message: string; error: string }) => {
      playSound();
      showNotification('Scan Error', data.message);
      console.error('Scan error:', data);
    });

    socket.on('pumpAlert', (data: { symbol: string; severity: string; message: string; priceChange1h: number }) => {
      playSound();
      showNotification(`🚨 ${data.severity} Pump: ${data.symbol}`, data.message);
      console.warn('Pump alert:', data);
    });

    socket.on('dumpAlert', (data: { symbol: string; severity: string; message: string; priceChange1h: number }) => {
      playSound();
      showNotification(`🔻 ${data.severity} Dump: ${data.symbol}`, data.message);
      console.warn('Dump alert:', data);
    });

    socket.on('preMoveAlert', (data: { symbol: string; type: 'PUMP' | 'DUMP'; strength: string; message: string; confidence: number }) => {
      playSound();
      const emoji = data.type === 'PUMP' ? '📈' : '📉';
      showNotification(`${emoji} ${data.strength} pre-${data.type}: ${data.symbol}`, data.message);
      console.warn('Pre-move alert:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [playSound, showNotification]);
}
