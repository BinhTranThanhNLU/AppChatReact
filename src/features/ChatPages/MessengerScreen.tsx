import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/messenger.css";
import ListMessenger from "./components/ListMessengers";
import InforMessenger from "./components/InforMessenger";
import Messenger from "./components/Messenger";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/Store";
import { connectSocket, sendSocket } from "../../api/socket";
import { setMessages } from "../chat/ChatSlice";

const MessengerScreen: React.FC = () => {
  // Lấy data từ Redux
  const users = useSelector((state: RootState) => state.chat.users);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const currentUser = useSelector((state: RootState) => state.auth.user); // Lấy user hiện tại để so sánh
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"people" | "room">("people");

  const dispatch = useDispatch();

  // Map users -> ChatItem (như cũ)
  const chatList: any = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    const peopleChats = users.map((user) => ({
      id: user.name,
      name: user.name,
      msg: user.mes || "",
      time: user.createAt ? new Date(user.createAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  : "",
      active: activeUserId === user.name,
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
      active: activeUserId === room.roomName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        room.roomName
      )}&background=random`,
      type: "room" as const,
    }));

    return [...roomChats, ...peopleChats];
  }, [users, rooms, activeUserId]);

    useEffect(() => {
        // Truyền callback vào connectSocket
        connectSocket(() => {
            console.log("Socket Connected -> Sending RE_LOGIN...");
            const str = localStorage.getItem("auth");
            if (str) {
                const auth = JSON.parse(str);
                // Gửi thông tin đăng nhập lại để Server biết socket này của ai
                sendSocket({
                    action: "onchat",
                    data: {
                        event: "RE_LOGIN",
                        data: {
                            user: auth.user,
                            code: auth.code, // Đảm bảo server cần code này để xác thực
                        },
                    },
                });
            }
        });
    }, []);

  // Xử lý khi bấm vào user va room
  const handleSelectChat = (id: string, type: "people" | "room") => {
    setActiveUserId(id);
    setSelectedType(type);

    dispatch(setMessages([]));

    if (type === "room") {
      // Gọi API lấy tin nhắn
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
      // Gọi API lấy tin nhắn
      sendSocket({
        action: "onchat",
        data: {
          event: "GET_PEOPLE_CHAT_MES",
          data: {
            name: id,
            page: 1,
          },
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
