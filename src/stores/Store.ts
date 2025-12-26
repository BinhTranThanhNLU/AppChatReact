import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import chatReducer from "../features/chat/ChatSlice";
import authReducer from "../features/chat/AuthSlice";

// ✅ Config persist
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['chat', 'auth'], // Persist cả chat và auth
};

// ✅ Combine reducers
const rootReducer = combineReducers({
    chat: chatReducer,
    auth: authReducer,
});

// ✅ Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Config store
export const store = configureStore({
    reducer: persistedReducer,
    middleware:  (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // ✅ Bỏ qua các action của redux-persist
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