// screens/messenger/MessengerScreen.tsx

import React, { useMemo, useState } from "react";
import "../../assets/css/messenger.css";
import ListMessenger from "./components/ListMessengers";
import InforMessenger from "./components/InforMessenger";
import Messenger from "./components/Messenger"; // Component hiển thị khung chat
import { ChatItem } from "../../types/ChatType";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/Store";
import { sendSocket } from "../../api/socket";

const MessengerScreen: React.FC = () => {
    // Lấy data từ Redux
    const users = useSelector((state: RootState) => state.chat.users);
    const messages = useSelector((state: RootState) => state.chat.messages);
    const currentUser = useSelector((state: RootState) => state.auth.user); // Lấy user hiện tại để so sánh

    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    // Map users -> ChatItem (như cũ)
    const chatList: ChatItem[] = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        return users.map((u: any) => {
            const name = u.userName || u.name || "User";
            return {
                id: name,
                name: name,
                msg: "...",
                time: "",
                active: activeUserId === name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            };
        });
    }, [users, activeUserId]);

    // Xử lý khi bấm vào user
    const handleSelectUser = (id: string) => {
        setActiveUserId(id);

        // Gọi API lấy tin nhắn
        sendSocket({
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: {
                    name: id,
                    page: 1
                }
            }
        });
    };

    return (
        <div className="messenger-container">
            <ListMessenger
                chatList={chatList}
                onSelectUser={handleSelectUser}
            />

            {/* Truyền messages và currentUser vào Messenger */}
            <Messenger
                messages={messages}
                currentUser={currentUser || ""}
                currentChatUser={activeUserId} // Người đang chat cùng (để gửi tin nhắn đi)
            />

            <InforMessenger />
        </div>
    );
};

export default MessengerScreen;