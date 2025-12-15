import React from "react";
import "../../assets/css/messenger.css";
import ListMessenger from "./components/ListMessengers";
import InforMessenger from "./components/InforMessenger";
import Messenger from "./components/Messenger";
import { ChatItem, MessageItem } from "../../types/ChatType";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/Store";
import { useMemo, useState } from "react";

const MessengerScreen: React.FC = () => {
  const users = useSelector((state: RootState) => state.chat.users);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Map user → ChatItem cho UI
  const chatList: ChatItem[] = useMemo(() => {
    return users.map((u: any) => ({
      id: u.id || u.user || u.userName,
      name: u.userName || u.user,
      msg: "Bắt đầu cuộc trò chuyện",
      time: "",
      active: activeUserId === (u.id || u.user),
      avatar: `https://i.pravatar.cc/150?u=${u.userName}`,
    }));
  }, [users, activeUserId]);

  return (
    <div className="messenger-container">
      <ListMessenger chatList={chatList} onSelectUser={setActiveUserId} />
      <Messenger messages={[]} />
      <InforMessenger />
    </div>
  );
};

export default MessengerScreen;
