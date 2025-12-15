import { store } from "../stores/Store";
import { addMessage, setUsers } from "../features/chat/ChatSlice";
import { loginSuccess, logout } from "../features/chat/AuthSlice";

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
    onOpen?.(); //call back
  };

  socket.onmessage = (e) => {
    const res = JSON.parse(e.data);
    console.log("📩 WS:", res);

    // LOGIN OK
    if (
      (res.event === "LOGIN" || res.event === "RE_LOGIN") &&
      res.status === "success"
    ) {
      const user = store.getState().auth.user!;

      store.dispatch(
        loginSuccess({
          user,
          reLoginCode: res.data.RE_LOGIN_CODE,
        })
      );

      //RE_LOGIN lưu vào local storage
      localStorage.setItem(
        "auth",
        JSON.stringify({ user, code: res.data.RE_LOGIN_CODE })
      );

      sendSocket({
        action: "onchat",
        data: { event: "GET_USER_LIST" },
      });

      return;
    }

    // USER LIST
    if (res.event === "GET_USER_LIST") {
      store.dispatch(setUsers(res.data));
      return;
    }

    // CHAT MESSAGE
    if (res.event === "SEND_CHAT") {
      store.dispatch(addMessage(res.data));
      return;
    }

    // log out
    if (res.event === "LOGOUT" && res.status === "success") {
      store.dispatch(logout());
      localStorage.removeItem("auth");
      return;
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error !!!", err);
  };

  socket.onclose = () => {
    console.warn("WebSocket disconnected");
    socket = null;
  };
};

export const sendSocket = (payload: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.error("WebSocket chưa kết nối");
  }
};

export const logoutSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "onchat",
        data: { event: "LOGOUT" },
      })
    );
  }

  socket?.close();
  socket = null;
};
