import { store } from "../stores/Store";
import { loginSuccess, logout } from "../features/chat/AuthSlice";
import {
  addMessage,
  setUsers,
  setMessages,
  addUser,
  addRoom,
} from "../features/chat/ChatSlice";

let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let pendingUserSearch: string | null = null;

export const connectSocket = (onOpen?: () => void) => {
  // Nếu đã có socket đang mở, không tạo mới
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("Socket đã kết nối, không cần tạo mới");
    onOpen?.();
    return;
  }

  // Nếu socket đang connecting, đợi nó kết nối xong
  if (socket && socket.readyState === WebSocket.CONNECTING) {
    console.log("Socket đang kết nối.. .");
    return;
  }

  socket = new WebSocket("wss://chat.longapp.site/chat/chat");

  socket.onopen = () => {
    console.log("WebSocket connected successfully!!!");
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    onOpen?.();
  };

  socket.onmessage = (e) => {
    const res = JSON.parse(e.data);
    // 1. LOGIN OK hoặc RE_LOGIN OK
    if ((res.event === "LOGIN" || res.event === "RE_LOGIN") && res.status === "success") {
        // ✅ FIX:  Lấy username từ state Redux (đã lưu trước đó)
        let username = store.getState().auth.user;
        
        // Nếu không có trong Redux, thử lấy từ localStorage (trường hợp RE_LOGIN)
        if (!username) {
            const storedAuth = localStorage.getItem("auth");
            if (storedAuth) {
                try {
                    const parsed = JSON.parse(storedAuth);
                    username = parsed. user;
                } catch (error) {
                    console.error("❌ Lỗi parse auth từ localStorage", error);
                }
            }
        }

        // ✅ Kiểm tra username
        if (! username) {
            console.error("❌ Không tìm thấy username để lưu RE_LOGIN_CODE");
            return;
        }

        console.log("✅ LOGIN/RE_LOGIN thành công cho user:", username);

        // Dispatch loginSuccess với reLoginCode mới
        store.dispatch(
            loginSuccess({ 
                user: username, 
                reLoginCode: res.data.RE_LOGIN_CODE 
            })
        );

        // Lưu vào localStorage
        localStorage.setItem(
            "auth",
            JSON.stringify({ user: username, code: res.data.RE_LOGIN_CODE })
        );

        // Lấy danh sách user
        console.log("📡 Requesting GET_USER_LIST.. .");
        sendSocket({ action: "onchat", data: { event: "GET_USER_LIST" } });
        return;
    }

    // 2. GET USER LIST
    if (res.event === "GET_USER_LIST") {
        console.log("Dữ liệu User List từ Server:", res.data);
        
        if (!res.data || !Array.isArray(res.data)) {
            console.error("GET_USER_LIST trả về data không hợp lệ:", res.data);
            return;
        }
        
        store.dispatch(setUsers(res.data));
        console.log("Đã cập nhật user list vào Redux, total:", res.data.length);
        return;
    }

    // 3. GET_PEOPLE_CHAT_MES (Lịch sử tin nhắn)
    if (res.event === "GET_PEOPLE_CHAT_MES") {
      console.log("Dữ liệu GET_PEOPLE_CHAT_MES từ Server:", res.data);
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
      console.log("Socket receive:", res.data);

      const state = store.getState();
      const currentUser = state.auth.user;

      if (currentUser && res.data.name === currentUser) {
        return;
      }

      const newMessage = {
        userId: res.data.name, // Đây là người gửi tin nhắn này
        content: res.data.mes,
        time: new Date().toISOString(),
        to: store.getState().auth.user || undefined, // <--- THÊM DÒNG NÀY: Xác định tin này gửi cho mình
      };

      store.dispatch(addMessage(newMessage));
      return;
    }

    //5. CREATE ROOM
    if (res.event === "CREATE_ROOM" && res.status === "success") {
      const roomName = res.data.name;

      store.dispatch(addRoom({ roomName }));

      //JOIN ROOM, auto join luôn
      sendSocket({
        action: "onchat",
        data: {
          event: "JOIN_ROOM",
          data: { name: roomName },
        },
      });
      return;
    }

    //6. JOIN ROOM
    if (res.event === "JOIN_ROOM" && res.status === "success") {
      const roomName = res.data.name;

      store.dispatch(addRoom({ roomName }));
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
      console.log("🔍 CHECK_USER_EXIST Response:", res);

      if (res.status === "success" && res.data?.status === true) {
        const userName = pendingUserSearch;

        if (!userName || typeof userName !== "string") {
          console.error("❌ User name không hợp lệ:", userName);
          return;
        }

        const userFound = { name: userName };

        const users = store.getState().chat.users;
        const exists = users.find((u) => u.name === userFound.name);

        if (!exists) {
          store.dispatch(addUser(userFound));
          console.log(
            "✅ Đã thêm user tìm thấy vào danh sách:",
            userFound.name
          );
        } else {
          console.log("ℹ️ User đã có trong danh sách:", userFound.name);
        }

        pendingUserSearch = null;
      } else {
        alert("Người dùng không tồn tại!");
        pendingUserSearch = null;
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

    // ✅ FIX: Auto reconnect sau 3 giây
    reconnectTimeout = setTimeout(() => {
      console.log("🔄 Attempting to reconnect...");
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        connectSocket();
      }
    }, 3000);
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

export const searchUser = (username: string) => {
  pendingUserSearch = username;

  sendSocket({
    action: "onchat",
    data: {
      event: "CHECK_USER_EXIST",
      data: {
        user: username,
      },
    },
  });
};
