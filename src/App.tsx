import "./assets/css/AuthStyles.css";
import {Routes, Route, Navigate} from "react-router-dom";

import AuthContainer from "./features/AuthPages/AuthContainer";
import MessengerScreen from "./features/ChatPages/MessengerScreen";

import {connectSocket, sendSocket} from "./api/socket";
import {useDispatch} from "react-redux";
import {loginSuccess} from "./features/chat/AuthSlice";
import {useEffect} from "react";

function App() {

    const dispatch = useDispatch();

    useEffect(() => {
        const saved = localStorage.getItem("auth");
        if (!saved) return;

        const {user, code} = JSON.parse(saved);

        dispatch(loginSuccess({user, reLoginCode: code}));
        connectSocket();

        sendSocket({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: {user, code},
            },
        });
    }, []);

    return (
        <Routes>
            <Route path="/login" element={<AuthContainer/>}/>
            <Route path="/messenger" element={<MessengerScreen/>}/>

            {/* Mặc định vào login */}
            <Route path="*" element={<Navigate to="/login"/>}/>
        </Routes>
    );
}

export default App;
