import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  channelId: string;
}

export const sendMessage = async (
  message: Omit<Message, "id" | "timestamp">
) => {
  try {
    console.log("Attempting to send message:", message);
    const messagesRef = collection(db, "messages");
    const docRef = await addDoc(messagesRef, {
      ...message,
      timestamp: Timestamp.now(),
    });
    console.log("Message sent successfully with ID:", docRef.id);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const subscribeToChannelMessages = (
  channelId: string,
  callback: (messages: Message[]) => void
) => {
  console.log("Subscribing to messages for channel:", channelId);
  const messagesRef = collection(db, "messages");

  // First, get all messages for the channel
  const channelQuery = query(messagesRef, where("channelId", "==", channelId));

  // Then set up real-time listener
  return onSnapshot(
    channelQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        }))
        .sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        ) as Message[];

      console.log("New messages received:", messages.length);
      callback(messages);
    },
    (error) => {
      console.error("Error in message subscription:", error);
    }
  );
};
