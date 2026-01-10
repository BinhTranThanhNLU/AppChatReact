import React, { useState } from "react";
import "../../../assets/css/messenger.css";
import {
  Search,
  Image as ImageIcon,
  ChevronDown,
  Bell,
  FileText,
  Lock,
  X,
  UserPlus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../chat/AuthSlice";
import { logoutSocket, sendSocket } from "../../../api/socket";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/Store";

const InforMessenger = () => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");

  const activeChat = useSelector((state: RootState) => state.chat.activeChat);
  const users = useSelector((state: RootState) => state.chat.users);
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  let displayName = "Chưa chọn đoạn chat";
  let avatarUrl = "https://ui-avatars.com/api/?name=Chat";

  if (activeChat) {
    if (activeChat.type === "people") {
      const user = users.find((u) => u.name === activeChat.id);
      if (user) {
        displayName = user.name;
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=random`;
      }
    }

    if (activeChat.type === "room") {
      displayName = activeChat.id;
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        activeChat.id
      )}&background=random`;
    }
  }

  //xử lý thêm thành viên
  const handleInviteMember = () => {
    const username = memberName.trim();

    if (!username || !activeChat?.id || activeChat?.type !== "room") {
      alert("Nhập tên user cần thêm vào!");
      return;
    }

    sendSocket({
      action: "onchat",
      data: {
        event: "CHECK_USER_EXIST",
        data: { user: username },
      },
    });

    sessionStorage.setItem(
      "pendingInvite",
      JSON.stringify({
        username: username,
        roomName: activeChat.id,
      })
    );

    setMemberName("");
    setShowAddMember(false);
  };

  const handleLogout = () => {
    logoutSocket();
    dispatch(logout());
    localStorage.removeItem("auth");
    navigate("/login");
  };

  // KIỂM TRA XEM CÓ ĐANG Ở ROOM KHÔNG
  const isInRoom = activeChat?.type === "room";

  return (
    <div className="sidebar-right">
      <div className="profile-section">
        <img src={avatarUrl} alt="profile" className="profile-avatar-large" />
        <h2 className="profile-name">{displayName}</h2>

      </div>

      <div className="menu-list">
        {/* HIỂN THỊ "THÊM THÀNH VIÊN" CHỈ KHI ĐANG Ở ROOM */}
        {isInRoom && (
          <>
            <div
              className="menu-item"
              onClick={() => setShowAddMember(!showAddMember)}
              style={{ cursor: "pointer" }}
            >
              <UserPlus size={18} />
              <span>Thêm thành viên vào nhóm</span>
            </div>

            {showAddMember && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f0f2f5",
                  borderRadius: "8px",
                  margin: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nhập tên người dùng..."
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "20px",
                      border: "1px solid #ccc",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleInviteMember}
                    style={{
                      background: "#0084ff",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    style={{
                      background: "#e4e6eb",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div
          className="menu-item"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
};

export default InforMessenger;
