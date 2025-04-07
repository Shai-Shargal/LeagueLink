import { useState, useEffect, useCallback } from "react";
import { socketService } from "../services/socket.service";

interface Message {
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

export const useChat = (channelId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await socketService.connect();
        await socketService.joinChannel(channelId);
        if (mounted) {
          setIsConnected(true);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to connect to chat"
          );
          setIsConnected(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    socketService.onNewMessage((newMessage) => {
      if (mounted) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    initializeChat();

    return () => {
      mounted = false;
      socketService.leaveChannel(channelId);
      socketService.removeMessageListener();
      socketService.disconnect();
    };
  }, [channelId]);

  const sendMessage = useCallback(
    async (message: string) => {
      try {
        setError(null);
        await socketService.sendMessage(channelId, message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        setIsConnected(false);
      }
    },
    [channelId]
  );

  const reconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await socketService.connect();
      await socketService.joinChannel(channelId);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reconnect");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    reconnect,
  };
};
