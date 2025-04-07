import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
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
    const messagesRef = collection(db, "messages");
    await addDoc(messagesRef, {
      ...message,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const subscribeToChannelMessages = (
  channelId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("channelId", "==", channelId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Message[];
    callback(messages);
  });
};
