import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/messenger.css";
import ListMessenger from "./components/ListMessengers";
import InforMessenger from "./components/InforMessenger";
import Messenger from "./components/Messenger";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/Store";
import { connectSocket, sendSocket } from "../../api/socket";
import { setMessages, setActiveChat } from "../chat/ChatSlice";
import { loginSuccess } from "../chat/AuthSlice";

const MessengerScreen: React.FC = () => {
  // Lấy data từ Redux
  const users = useSelector((state: RootState) => state.chat.users);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const currentUser = useSelector((state: RootState) => state.auth.user); // Lấy user hiện tại để so sánh
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"people" | "room">("people");
  const activeChatRedux = useSelector(
    (state: RootState) => state.chat.activeChat
  );

  const dispatch = useDispatch();

  // Map users -> ChatItem (như cũ)
  const chatList: any = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    const peopleChats = users.map((user) => ({
      id: user.name,
      name: user.name,
      msg: user.mes || "",
      time: user.createAt
        ? new Date(user.createAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      active: activeUserId === user.name && selectedType === "people",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=random`,
      type: "people" as const,
    }));

    const roomChats = rooms.map((room) => ({
      id: room.roomName,
      name: room.roomName,
      msg: "",
      time: "",
      active: activeUserId === room.roomName && selectedType === "room",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        room.roomName
      )}&background=random`,
      type: "room" as const,
    }));
    
    const allChats = [...roomChats, ...peopleChats];

    const uniqueChats = Array.from(
      new Map(allChats.map((item) => [item.id + item.type, item])).values()
    );

    return uniqueChats;

  }, [users, rooms, activeUserId, selectedType]);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");

    if (storedAuth) {
      try {
        const { user, code } = JSON.parse(storedAuth);

        // Dispatch vào Redux để restore state
        dispatch(loginSuccess({ user, reLoginCode: code }));

        // Connect socket và gửi RE_LOGIN
        connectSocket(() => {
          console.log("Socket Connected -> Sending RE_LOGIN...");
          sendSocket({
            action: "onchat",
            data: {
              event: "RE_LOGIN",
              data: {
                user: user,
                code: code,
              },
            },
          });
        });
      } catch (error) {
        console.error("Lỗi parse auth từ localStorage:", error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (activeChatRedux) {
      // 1. Cập nhật state nội bộ để UI highlight đúng item
      setActiveUserId(activeChatRedux.id);
      setSelectedType(activeChatRedux.type);

      // 2. Clear tin nhắn cũ
      dispatch(setMessages([]));

      // 3. Gọi API lấy tin nhắn của Room mới join
      if (activeChatRedux.type === "room") {
        sendSocket({
          action: "onchat",
          data: {
            event: "GET_ROOM_CHAT_MES",
            data: {
              name: activeChatRedux.id,
              page: 1,
            },
          },
        });
      }
    }
  }, [activeChatRedux, dispatch]);

  // Xử lý khi bấm vào user va room
  const handleSelectChat = (id: string, type: "people" | "room") => {

    // 1. Cập nhật state UI
    setActiveUserId(id);
    setSelectedType(type);

    dispatch(setActiveChat({ id, type }));

    dispatch(setMessages([]));

    if (type === "room") {
      console.log("Đang lấy tin nhắn cho phòng:", id);
      sendSocket({
        action: "onchat",
        data: {
          event: "GET_ROOM_CHAT_MES",
          data: {
            name: id,
            page: 1,
          },
        },
      });
    }

    if (type === "people") {
      // Gửi yêu cầu lấy tin nhắn
      sendSocket({
        action: "onchat",
        data: {
          event: "GET_PEOPLE_CHAT_MES",
          data: { name: id, page: 1 },
        },
      });

      sendSocket({
        action: "onchat",
        data: {
          event: "CHECK_USER_ONLINE",
          data: { user: id },
        },
      });
    }
  };

  return (
    <div className="messenger-container">
      <ListMessenger chatList={chatList} onSelected={handleSelectChat} />

      <Messenger
        messages={messages}
        currentUser={currentUser || ""}
        currentChatUser={activeUserId} // Người đang chat cùng (để gửi tin nhắn đi)
        chatType={selectedType}
      />

      <InforMessenger />
    </div>
  );
};

export default MessengerScreen;
