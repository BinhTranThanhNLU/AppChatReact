export interface ChatItem {
  id: number;
  name: string;
  msg: string;
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
