import React from "react";
import "../../../assets/css/messenger.css";
import {
  Search,
  MoreHorizontal,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import { ChatItem } from "../../../types/ChatType";

interface ListMessengerProps {
  chatList: ChatItem[];
}

const ListMessenger:React.FC<ListMessengerProps> = ({ chatList }) => {
  return (
    <div className="sidebar-left">
      <div className="sidebar-header">
        <div className="header-top">
          <h1 className="header-title">Đoạn chat</h1>
          <div className="header-actions">
            <button className="icon-btn">
              <MoreHorizontal size={20} />
            </button>
            <button className="icon-btn">
              <Edit size={20} />
            </button>
          </div>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm trên Messenger"
          />
        </div>

        <div className="filter-tabs">
          <button className="filter-pill active">Tất cả</button>
          <button className="filter-pill inactive">Chưa đọc</button>
          <button className="filter-pill inactive">Nhóm</button>
        </div>
      </div>

      <div className="chat-list">
        {chatList.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chat.active ? "active" : ""}`}
          >
            <div className="avatar-container">
              <img src={chat.avatar} alt="avt" className="avatar" />
              {chat.active && <div className="online-dot"></div>}
            </div>
            <div className="chat-info">
              <h3 className="chat-name">{chat.name}</h3>
              <div className="chat-preview">
                <span className="preview-text">{chat.msg}</span>
                <span style={{ margin: "0 4px" }}>·</span>
                <span>{chat.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListMessenger;
