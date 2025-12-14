import { store } from "../stores/Store";
import { addMessage, setUsers } from "../features/chat/ChatSlice";

let socket: WebSocket | null = null;

export const connectSocket = () => {
  socket = new WebSocket("wss://chat.longapp.site/chat/chat");

  socket.onopen = () => {
    console.log("WebSocket connected successfully!!!");
  };

  socket.onmessage = (e) => {
    const res = JSON.parse(e.data);
    console.log("WebSocket message:", res);

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
