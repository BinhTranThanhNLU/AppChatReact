// socket.ts
import { store } from "../stores/Store";
import { loginSuccess, logout } from "../features/chat/AuthSlice";
import { addMessage, setUsers, setMessages, addUser, setCurrentRoom, addRoom, } from "../features/chat/ChatSlice";


let socket: WebSocket | null = null;

export const connectSocket = (onOpen?: () => void) => {
    if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
            onOpen?.();
        }
        return;
    }

    socket = new WebSocket("wss://chat.longapp.site/chat/chat");

    socket.onopen = () => {
        console.log("WebSocket connected successfully!!!");
        onOpen?.();
    };

    socket.onmessage = (e) => {
        const res = JSON.parse(e.data);
        // 1. LOGIN OK
        if ((res.event === "LOGIN" || res.event === "RE_LOGIN") && res.status === "success") {
            const user = store.getState().auth.user!;
            store.dispatch(loginSuccess({ user, reLoginCode: res.data.RE_LOGIN_CODE }));
            localStorage.setItem("auth", JSON.stringify({ user, code: res.data.RE_LOGIN_CODE }));

            // Lấy danh sách user ngay khi login xong
            sendSocket({ action: "onchat", data: { event: "GET_USER_LIST" } });
            return;
        }

        // 2. GET USER LIST
        if (res.event === "GET_USER_LIST") {
            store.dispatch(setUsers(res.data));
            return;
        }

        // 3. GET_PEOPLE_CHAT_MES (Lịch sử tin nhắn)
        if (res.event === "GET_PEOPLE_CHAT_MES") {
            const rawMessages = Array.isArray(res.data) ? res.data : [];
            // mới đổi , cho thằng thêm ảnh 

            const mappedMessages = rawMessages.map((msg: any) => {
                const isImage =
                    typeof msg.mes === "string" &&
                    msg.mes.startsWith("data:image");

                return {
                    userId: msg.name,
                    content: msg.mes,
                    msgType: isImage ? "image" : "text",
                    time: msg.createAt || new Date().toISOString(),
                };
            });


            store.dispatch(setMessages(mappedMessages));
            return;
        }

        // 4. SEND_CHAT (Nhận tin nhắn Real-time từ người khác hoặc Server confirm)
        if (res.event === "SEND_CHAT") {
            const isImage =
                typeof res.data.mes === "string" &&
                res.data.mes.startsWith("data:image");

            const msgType: "image" | "text" = isImage ? "image" : "text";

            const newMessage = {
                userId: res.data.name,
                content: res.data.mes,
                msgType,
                time: new Date().toISOString(),
            };

            store.dispatch(addMessage(newMessage));
            return;
        }

        if (res.event === "JOIN_ROOM") {
            if (res.status !== "success") {
                alert(res.message || "Không thể vào nhóm");
                return;
            }

            const roomName = res.data.name;

            const existed = store
                .getState()
                .chat.users
                .some((u) => u.userName === roomName);

            if (!existed) {
                store.dispatch(
                    addUser({
                        userName: roomName,
                    })
                );
            }

            store.dispatch(setCurrentRoom(roomName));
            return;
        }

        if (res.event === "CREATE_ROOM" && res.status === "success") {
            const roomName = res.data.name;

            store.dispatch(
                addUser({
                    userName: roomName,
                })
            );

            store.dispatch(setCurrentRoom(roomName));

            return;
        }

        // LOGOUT
        if (res.event === "LOGOUT" && res.status === "success") {
            store.dispatch(logout());
            localStorage.removeItem("auth");
            return;
        }
    };


    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => {
        console.warn("WebSocket disconnected");
        socket = null;
    };
};

export const sendSocket = (payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    } else {
        console.error("WebSocket chưa kết nối, không thể gửi:", payload);
    }
};

export const logoutSocket = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendSocket({ action: "onchat", data: { event: "LOGOUT" } });
    }
    socket?.close();
    socket = null;
};
