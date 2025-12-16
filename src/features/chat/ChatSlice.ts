// features/chat/ChatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
    userId: string; // Tên người gửi (Sender)
    content: string;
    time: string;
}

export interface User {
    userName: string;
}

interface ChatState {
    messages: Message[];
    users: User[];
    currentRoom?: string;
}

const initialState: ChatState = {
    messages: [],
    users: [],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // Nhận 1 tin nhắn mới (real-time)
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        setUsers(state, action: PayloadAction<User[]>) {
            state.users = action.payload;
        },
        // Nhận danh sách tin nhắn cũ (history)
        setMessages(state, action: PayloadAction<Message[]>) {
            state.messages = action.payload;
        },
    },
});

export const { addMessage, setUsers, setMessages } = chatSlice.actions;
export default chatSlice.reducer;