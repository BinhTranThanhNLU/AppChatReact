import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface Message {
    userId: string; // Người gửi
    to?: string; // Người nhận
    content: string;
    time: string;
    msgType?: "text" | "image";
}

export interface User {
    name: string;
    mes?: string;
    createAt?: string;
    // kiểm tra xem có đang onl không
    isOnline?: boolean;
}

export interface Room {
    roomName: string;
}

interface ChatState {
    messages: Message[];
    users: User[];
    rooms: Room[];
    currentChatType?: "people" | "room";
    activeChat?: {
        id: string;
        type: "people" | "room";
    };
}

const initialState: ChatState = {
    messages: [],
    users: [],
    rooms: [],
    activeChat: undefined,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<Message>) {
            const {userId, content, time, to} = action.payload;

            // 1. Thêm vào danh sách tin nhắn chi tiết
            state.messages.push(action.payload);

            // 2. CẬP NHẬT "PREVIEW" Ở SIDEBAR
            const currentUser = userId; // Người gửi
            const targetUser = to; // Người nhận

            // Xác định user nào cần update trong sidebar
            let userToUpdate: string | undefined;

            // Nếu mình gửi (userId === current logged user), update người nhận
            // Nếu người khác gửi cho mình, update người gửi
            const myUsername = state.users[0]?.name; // Hoặc lấy từ auth state

            if (currentUser === myUsername) {
                userToUpdate = targetUser; // Mình gửi -> update người nhận
            } else {
                userToUpdate = currentUser; // Người khác gửi -> update người gửi
            }

            if (!userToUpdate) return;

            const userIndex = state.users.findIndex((u) => u.name === userToUpdate);

            if (userIndex !== -1) {
                // Cập nhật nội dung và thời gian
                state.users[userIndex].mes = content;
                state.users[userIndex].createAt = time;

                // Đưa user này lên đầu danh sách
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
            const exitst = state.rooms.find(
                (room) => room.roomName === action.payload.roomName
            );
            if (!exitst) {
                state.rooms.push(action.payload);
            }
        },

        setActiveChat(state, action: PayloadAction<{ id: string; type: "people" | "room" }>) {
            console.log(`setActiveChat reducer received:`, action.payload);
            state.activeChat = action.payload;
        },
        // kiểm tra xem có đang hoạt động hay không
        updateUserStatus(state, action: PayloadAction<{ name: string; isOnline: boolean }>) {
            const user = state.users.find((u) => u.name === action.payload.name);
            if (user) {
                user.isOnline = action.payload.isOnline;
            }
        },
    },

});

export const {addMessage, setUsers, setMessages, addUser, addRoom, setActiveChat, updateUserStatus} =
    chatSlice.actions;

export default chatSlice.reducer;
