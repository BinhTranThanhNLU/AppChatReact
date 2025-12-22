import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  userId: string; // Người gửi
  to?: string;    // Người nhận
  content: string;
  time: string;
}

export interface User {
  name: string;
  mes?: string;      // Thêm dòng này: chứa nội dung tin nhắn cuối
  createAt?: string; // Thêm dòng này: chứa thời gian
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
    // addMessage(state, action: PayloadAction<Message>) {
    //   state.messages.push(action.payload);
    // },

    addMessage(state, action: PayloadAction<Message>) {
      const { userId, content, time, to } = action.payload;
      
      // 1. Thêm vào danh sách tin nhắn chi tiết (như cũ)
      state.messages.push(action.payload);

      // 2. CẬP NHẬT "PREVIEW" Ở SIDEBAR (Logic mới thêm)
      // Tìm user trong danh sách users để cập nhật tin nhắn cuối cùng
      const targetUserName = userId === "me" ? to : userId; // Logic xác định user cần update
      
      const userIndex = state.users.findIndex(u => u.name === targetUserName || u.name === userId || u.name === to);
      
      if (userIndex !== -1) {
        // Cập nhật nội dung và thời gian cho user đó trong sidebar
        state.users[userIndex].mes = content;
        state.users[userIndex].createAt = time;
        
        // (Tùy chọn) Đưa user này lên đầu danh sách
        const user = state.users.splice(userIndex, 1)[0];
        state.users.unshift(user);
      }
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
