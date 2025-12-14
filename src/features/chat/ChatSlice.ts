import {createSlice, PayloadAction} from "@reduxjs/toolkit"

interface Message {
    userId: string;
    content: string;
    time: string;
}

interface ChatState {
    messages: Message[];
    users: any[];
    currentRoom?: string;
}

const initialState: ChatState = {
    messages: [],
    users: []
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        setUsers(state, action) {
            state.users = action.payload;
        }
    }
});

export const {addMessage, setUsers} = chatSlice.actions;
export default chatSlice.reducer;