// screens/messenger/components/OptionsMenu.tsx
import React, { useState } from "react";
import { sendSocket } from "../../../api/socket";
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

                                // HIỆN TẠI: create & join đều dùng CREATE_ROOM
                                sendSocket({
                                    action: "onchat",
                                    data: {
                                        event: "CREATE_ROOM",
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
