import {store} from "../stores/Store";
import {loginSuccess, logout} from "../features/chat/AuthSlice";
import {
    addMessage,
    setUsers,
    setMessages,
    addUser,
    addRoom,
} from "../features/chat/ChatSlice";

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
        if (
            (res.event === "LOGIN" || res.event === "RE_LOGIN") &&
            res.status === "success"
        ) {
            const user = store.getState().auth.user!;
            store.dispatch(
                loginSuccess({user, reLoginCode: res.data.RE_LOGIN_CODE})
            );
            localStorage.setItem(
                "auth",
                JSON.stringify({user, code: res.data.RE_LOGIN_CODE})
            );

            // Lấy danh sách user ngay khi login xong
            sendSocket({action: "onchat", data: {event: "GET_USER_LIST"}});
            return;
        }

        // 2. GET USER LIST
        if (res.event === "GET_USER_LIST") {
            console.log("🔥 Dữ liệu User List từ Server:", res.data);
            store.dispatch(setUsers(res.data));
            return;
        }

        // 3. GET_PEOPLE_CHAT_MES (Lịch sử tin nhắn)
        if (res.event === "GET_PEOPLE_CHAT_MES") {
            console.log("🔥 Dữ liệu GET_PEOPLE_CHAT_MES từ Server:", res.data);
            const rawMessages = Array.isArray(res.data) ? res.data : [];

            const mappedMessages = rawMessages.map((msg: any) => ({
                // Ưu tiên lấy 'name', nếu không có thì fallback cẩn thận
                userId: msg.name,
                to: msg.to,
                content: msg.mes,
                time: msg.createAt || new Date().toISOString(),
            }));

            store.dispatch(setMessages(mappedMessages));
            return;
        }

        // 4. SEND_CHAT (Nhận tin nhắn Real-time từ người khác hoặc Server confirm)
        if (res.event === "SEND_CHAT") {

            console.log("🔥 Socket receive:", res.data);

            const state = store.getState();
            const currentUser = state.auth.user;

            if (currentUser && res.data.name === currentUser) {
                return;
            }

            const newMessage = {
                userId: res.data.name, // Đây là người gửi tin nhắn này
                content: res.data.mes,
                time: new Date().toISOString(),
                to: store.getState().auth.user || undefined // <--- THÊM DÒNG NÀY: Xác định tin này gửi cho mình
            };

            store.dispatch(addMessage(newMessage));
            return;
        }

        //5. CREATE ROOM
        if (res.event === "CREATE_ROOM" && res.status === "success") {
            const roomName = res.data.name;

            store.dispatch(addRoom({roomName}));

            //JOIN ROOM, auto join luôn
            sendSocket({
                action: "onchat",
                data: {
                    event: "JOIN_ROOM",
                    data: {name: roomName},
                },
            });
            return;
        }

        //6. JOIN ROOM
        if (res.event === "JOIN_ROOM" && res.status === "success") {
            const roomName = res.data.name;

            store.dispatch(addRoom({roomName}));
            return;
        }

        //7. GET ROOM CHAT MES: nhận lịch sử tin nhắn của room
        if (res.event === "GET_ROOM_CHAT_MES") {
            const rawMessages = Array.isArray(res.data) ? res.data : [];
            const mappedMessages = rawMessages.map((message: any) => ({
                userId: message.name,
                content: message.mes,
                time: message.createAt || new Date().toISOString(),
            }));
            store.dispatch(setMessages(mappedMessages));
            return;
        }

        //8. LOGOUT
        if (res.event === "LOGOUT" && res.status === "success") {
            store.dispatch(logout());
            localStorage.removeItem("auth");
            return;
        }

        // 9. CHECK_USER (Tìm user để chat)
        if (res.event === "CHECK_USER" && res.status === "success") {
            const user = res.data; // { name: "ti" }

            // Tránh add trùng user
            const users = store.getState().chat.users;
            const exists = users.find((u) => u.name === user.name);

            if (!exists) {
                store.dispatch(addUser(user));
            }
            return;
        }
        // 10. CHECK_USER_EXIST (Kết quả tìm kiếm user)
        if (res.event === "CHECK_USER_EXIST") {
            if (res.status === "success") {
                // Server trả về user tồn tại, ta thêm vào danh sách hiển thị
                // Lưu ý: Tùy vào cấu trúc data server trả về, thường là { name: "ti" }
                const userFound = { name: res.data.name || res.data.user };

                // Kiểm tra xem đã có trong list chưa để tránh duplicate
                const users = store.getState().chat.users;
                const exists = users.find((u) => u.name === userFound.name);

                if (!exists) {
                    store.dispatch(addUser(userFound));
                    console.log("Đã thêm user tìm thấy vào danh sách:", userFound.name);
                }
            } else {
                alert("Người dùng không tồn tại!");
            }
            return;
        }
        // AUTH ERROR
        if (res.event === "AUTH" && res.status === "error") {
            console.warn("⚠️ AUTH ERROR:", res.mes);

            // toast.warning("Người dùng chưa online");
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
        sendSocket({action: "onchat", data: {event: "LOGOUT"}});
    }
    socket?.close();
    socket = null;
};
