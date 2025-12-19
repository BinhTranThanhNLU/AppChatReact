export interface ChatItem {
  id: string;
  name: string;
  msg: string;
  type: "people" | "room";
  time: string;
  active: boolean;
  avatar: string;
}

export interface MessageItem {
  id: number;
  sender: "me" | "other";
  text: string;
  time?: string | null;
  avatar?: string;
  reaction?: string | null;
}