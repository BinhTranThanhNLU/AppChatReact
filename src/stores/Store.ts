import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import chatReducer from "../features/chat/ChatSlice";
import authReducer from "../features/chat/AuthSlice";
import { transform } from "typescript";

const chatTransform = createTransform(
  // Transform khi lưu vào storage
  (inboundState:  any) => {
    return {
      users: inboundState.users,
      rooms: inboundState.rooms,
      activeChat: inboundState.activeChat, // ✅ LƯU activeChat
      // Không lưu messages để tiết kiệm dung lượng
    };
  },
  // Transform khi lấy ra từ storage
  (outboundState: any) => {
    return {
      ... outboundState,
      messages: [], // Reset messages khi reload
    };
  },
  { whitelist: ['chat'] }
);

// Config persist
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'chat'], // Persist cả chat và auth
    transform: [chatTransform],
};

// Combine reducers
const rootReducer = combineReducers({
    chat: chatReducer,
    auth: authReducer,
});

// Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Config store
export const store = configureStore({
    reducer: persistedReducer,
    middleware:  (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Bỏ qua các action của redux-persist
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/PAUSE',
                    'persist/PURGE',
                    'persist/REGISTER',
                    'persist/FLUSH',
                ],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;