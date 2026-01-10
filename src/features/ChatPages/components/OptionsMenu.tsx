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
  const [mode, setMode] = useState<"default" | "create-group" | "join-group">(
    "default"
  );

  
  return (
    <div className="options-menu">
      {mode === "default" && (
        <>
          <div className="menu-item" onClick={() => setMode("create-group")}>
            <UserPlus size={18} />
            <span>Tạo nhóm</span>
          </div>

          <div className="menu-item" onClick={() => setMode("join-group")}>
            <Users size={18} />
            <span>Vào nhóm</span>
          </div>

          <div className="menu-divider" />

        </>
      )}

      {(mode === "create-group" || mode === "join-group") && (
        <div className="menu-input-row">
          <input
            className="menu-input"
            autoFocus
            placeholder={
              mode === "create-group" ? "Nhập tên nhóm..." : "nhập tên nhóm..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (!value) return;

                sendSocket({
                  action: "onchat",
                  data: {
                    event: mode === "create-group" ? "CREATE_ROOM" : "JOIN_ROOM",
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
};

export default OptionsMenu;
