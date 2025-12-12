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

const InforMessenger = () => {
  return (
    <div className="sidebar-right">
      <div className="profile-section">
        <img
          src="https://i.pravatar.cc/150?img=11"
          alt="profile"
          className="profile-avatar-large"
        />
        <h2 className="profile-name">Gia Huy Truong</h2>
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
      </div>
    </div>
  );
};

export default InforMessenger;
