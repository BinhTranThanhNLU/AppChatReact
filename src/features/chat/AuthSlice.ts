import { createSlice, PayloadAction} from "@reduxjs/toolkit"

interface AuthState {
    isLogin: boolean;
    reLoginCode?: string;
    user?: string;
}

const initialState: AuthState = {
    isLogin: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action:PayloadAction<{user:string; reLoginCode:string}>) {
            state.isLogin = true;
            state.user = action.payload.user;
            state.reLoginCode = action.payload.reLoginCode;
        },
        logout(state) {
            state.isLogin = false;
            state.user = undefined;
            state.reLoginCode = undefined;
        },
        setUser(state, action:  PayloadAction<string>) {
            state.user = action.payload;
        },
    }
});

export const { setUser, loginSuccess, logout } = authSlice. actions;
export default authSlice.reducer;