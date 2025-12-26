import React from "react";
import "../../../assets/css/messenger.css";
import {
  Search,
  Image as ImageIcon,
  ChevronDown,
  Bell,
  FileText,
  Lock,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../chat/AuthSlice";
import { logoutSocket } from "../../../api/socket";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/Store";

const InforMessenger = () => {

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

  const handleLogout = () => {
    logoutSocket();
    dispatch(logout());
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="sidebar-right">
      <div className="profile-section">
        <img
          src={avatarUrl}
          alt="profile"
          className="profile-avatar-large"
        />
        <h2 className="profile-name">{displayName}</h2>
        <div className="encryption-tag">
          <Lock size={12} /> Được mã hóa đầu cuối
        </div>

        <div className="profile-actions">
          <div className="action-item">
            <div className="action-circle">👤</div>
            <span className="action-label">Trang cá nhân</span>
          </div>
          <div className="action-item">
            <div className="action-circle">
              <Bell size={18} />
            </div>
            <span className="action-label">Tắt thông báo</span>
          </div>
          <div className="action-item">
            <div className="action-circle">
              <Search size={18} />
            </div>
            <span className="action-label">Tìm kiếm</span>
          </div>
        </div>
      </div>

      <div className="menu-list">
        <div className="menu-item">
          <span>Thông tin về đoạn chat</span>
          <ChevronDown size={20} />
        </div>
        <div className="menu-item">
          <span>Tùy chỉnh đoạn chat</span>
          <ChevronDown size={20} />
        </div>
        <div className="menu-item">
          <span>File phương tiện & file</span>
          <ChevronDown size={20} style={{ transform: "rotate(180deg)" }} />
        </div>

        <div className="submenu">
          <div className="submenu-item">
            <ImageIcon size={18} /> File phương tiện
          </div>
          <div className="submenu-item">
            <FileText size={18} /> File
          </div>
        </div>

        <div className="menu-item">
          <span>Quyền riêng tư và hỗ trợ</span>
          <ChevronDown size={20} />
        </div>

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
