import {configureStore} from "@reduxjs/toolkit";
import chatReducer from "../features/chat/ChatSlice";
import authReducer from "../features/chat/AuthSlice";

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        auth: authReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 