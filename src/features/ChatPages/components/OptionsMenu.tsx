// screens/messenger/components/OptionsMenu.tsx
import React, { useState } from "react";
import { sendSocket } from "../../../api/socket";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/Store";


import {
    MessageCircle,
    UserPlus,
    Users,
    Shield,
    HelpCircle,
} from "lucide-react";


interface OptionsMenuProps {
    onClose: () => void;
}



const OptionsMenu: React.FC<OptionsMenuProps> = ({ onClose }) => {
    const [mode, setMode] = useState<"default" | "create-group" | "join-group">("default");

     const users = useSelector((state: RootState) => state.chat.users);

    const hasJoinedGroup = (name: string) => {
    const target = name.toLowerCase();

    return users.some((u) => {
        const userName =
            typeof u?.userName === "string"
                ? u.userName
                : typeof (u as any)?.name === "string"
                ? (u as any).name
                : "";

        return userName.toLowerCase() === target;
    });
};

    return (
        <div className="options-menu">
            {mode === "default" && (
                <>
                    <div className="menu-item">
                        <MessageCircle size={18} />
                        <span>Tin nhắn đang chờ</span>
                    </div>

                    <div className="menu-item" onClick={() => setMode("create-group")}>
                        <UserPlus size={18} />
                        <span>Tạo nhóm</span>
                    </div>

                    <div className="menu-item" onClick={() => setMode("join-group")}>
                        <Users size={18} />
                        <span>Vào nhóm</span>
                    </div>


                    <div className="menu-divider" />

                    <div className="menu-item has-arrow">
                        <Shield size={18} />
                        <span>Quyền riêng tư và an toàn</span>
                    </div>

                    <div className="menu-item">
                        <HelpCircle size={18} />
                        <span>Trợ giúp</span>
                    </div>
                </>
            )}

            {(mode === "create-group" || mode === "join-group") && (
                <div className="menu-input-row">
                    <input
                        className="menu-input"
                        autoFocus
                        placeholder={
                            mode === "create-group"
                                ? "Nhập tên nhóm..."
                                : "nhập tên nhóm..."
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (!value) return;

                                // ĐÃ CÓ GROUP → KHÔNG JOIN
                                if (mode === "join-group" && hasJoinedGroup(value)) {
                                    alert("Bạn đã tham gia nhóm này rồi");
                                    return;
                                }

                                // PHÂN BIỆT CREATE vs JOIN
                                const eventName =
                                    mode === "create-group" ? "CREATE_ROOM" : "JOIN_ROOM";

                                sendSocket({
                                    action: "onchat",
                                    data: {
                                        event: eventName,
                                        data: {
                                            name: value,
                                        },
                                    },
                                });

                                onClose();
                            }

                            if (e.key === "Escape") {
                                setMode("default");
                            }
                        }}


                    />
                </div>
            )}

        </div>
    );
}

export default OptionsMenu;
