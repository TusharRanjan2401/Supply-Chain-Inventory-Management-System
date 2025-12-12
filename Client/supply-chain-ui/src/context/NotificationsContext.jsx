import React, { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const NotificationsContext = createContext({
  notifications: [],
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8084/ws-notifications");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {
      },
    });

    client.onConnect = () => {
      client.subscribe("/topic/notifications", (message) => {
        try {
          const body = JSON.parse(message.body);
          setNotifications((prev) => [body, ...prev]);
        } catch (err) {
          console.error("Failed to parse notification", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error", frame.headers["message"], frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};
