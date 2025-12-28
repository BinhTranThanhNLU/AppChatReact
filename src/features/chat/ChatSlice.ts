// features/chat/ChatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface Message {
    userId: string;
    content: string;
    time: string;
    msgType?: "text" | "image";
}



export interface User {
    userName: string;
}

export interface Room {
    id: string;
    name: string;
    lastMessage?: string;
    lastTime?: string;
}

interface ChatState {
    rooms: Room[];
    messages: Message[];
    users: User[];
    currentRoom?: string;
}


const initialState: ChatState = {
    rooms: [],
    messages: [],
    users: [],
    currentRoom: undefined,
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
        addUser(state, action: PayloadAction<User>) {
            state.users.unshift(action.payload);
        },
        addRoom(state, action: PayloadAction<Room>) {
            state.rooms.unshift(action.payload);
        },

        setRooms(state, action: PayloadAction<Room[]>) {
            state.rooms = action.payload;
        },

        setCurrentRoom(state, action: PayloadAction<string>) {
            state.currentRoom = action.payload;
        },
    },
});
export const { addMessage, setUsers, setMessages, addUser, setCurrentRoom, addRoom,setRooms, } = chatSlice.actions;
export default chatSlice.reducer;
