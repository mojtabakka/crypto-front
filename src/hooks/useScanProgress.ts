import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ScanProgress {
  current: number;
  total: number;
  symbol: string;
  scanType: string;
}

export function useScanProgress() {
  const socketRef = useRef<Socket | null>(null);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(window.location.origin.replace(':5173', ':3000'), {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('scanProgress', (data: ScanProgress) => {
      setProgress(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return { progress, isConnected, resetProgress };
}
