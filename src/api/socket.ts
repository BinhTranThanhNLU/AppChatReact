import { store } from "../stores/Store";
import { addMessage, setUsers } from "../features/chat/ChatSlice";
import { loginSuccess } from "../features/chat/AuthSlice";

let socket: WebSocket | null = null;

export const connectSocket = () => {
  socket = new WebSocket("wss://chat.longapp.site/chat/chat");

  socket.onopen = () => {
    console.log("WebSocket connected successfully!!!");
  };

  socket.onmessage = (e) => {
    const res = JSON.parse(e.data);
    console.log("WebSocket message:", res);

    //1.LOGIN
    if (res.event === "RE_LOGIN" && res.status === "success") {
      store.dispatch(
        loginSuccess({
          user: store.getState().auth.user!,
          reLoginCode: res.data.RE_LOGIN_CODE,
        })
      );

      //1.2.Get User List
      sendSocket({
        action: "onchat",
        data: {
          event: "GET_USER_LIST",
          data: {},
        },
      });
      return;
    }

    //CHAT EVENT

    const event = res.data?.event;
    const data = res.data?.data;

    switch (event) {
      case "SEND_CHAT":
        store.dispatch(addMessage(data));
        break;

      case "GET_USER_LIST":
        store.dispatch(setUsers(data));
        break;
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error !!!", err);
  };

  socket.onclose = () => {
    console.warn("WebSocket disconnected");
  };
};

export const sendSocket = (payload: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.error("WebSocket chưa kết nối");
  }
};
