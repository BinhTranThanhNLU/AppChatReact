import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  userId: string; // Người gửi
  to?: string;    // Người nhận
  content: string;
  time: string;
}

export interface User {
  name: string;
}

export interface Room {
  roomName: string;
}

interface ChatState {
  messages: Message[];
  users: User[];
  rooms: Room[];
  currentChatType?: "people" | "room";
}

const initialState: ChatState = {
  messages: [],
  users: [],
  rooms: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    // Nhận 1 tin nhắn mới (real-time)
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },

    // Nhận danh sách tin nhắn cũ (history)
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },

    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },

    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },

    addRoom(state, action: PayloadAction<Room>) {
        const exitst = state.rooms.find(room => room.roomName === action.payload.roomName);
        if(!exitst) {
            state.rooms.push(action.payload);
        }
    },
  },
});

export const { addMessage, setUsers, setMessages, addUser, addRoom } = chatSlice.actions;

export default chatSlice.reducer;
