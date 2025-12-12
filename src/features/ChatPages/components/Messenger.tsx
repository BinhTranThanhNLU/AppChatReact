import React from "react";
import "../../../assets/css/messenger.css";
import {
  Video,
  Phone,
  Info,
  Image as ImageIcon,
  Sticker,
  Gift,
  ThumbsUp,
  Smile,
  Lock,
} from "lucide-react";
import { MessageItem } from "../../../types/ChatType";

interface MessengerProps {
    messages: MessageItem[];
}

const Messenger:React.FC<MessengerProps> = ({messages}) => {
  return (
    <div className="main-chat">
      <div className="chat-header">
        <div className="user-header-info">
          <img
            src="https://i.pravatar.cc/150?img=11"
            alt="avt"
            className="header-avatar"
          />
          <div className="header-details">
            <h3>Gia Huy Truong</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="header-icons">
          <Phone className="header-icon" />
          <Video className="header-icon" />
          <Info className="header-icon" />
        </div>
      </div>

      <div className="messages-area">
        <div className="timestamp-divider">13:21 13/12/22</div>

        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender}`}>
            {msg.sender === "other" && (
              <img src={msg.avatar} alt="avt" className="message-avatar" />
            )}

            <div className="message-content">
              {msg.sender === "other" && msg.time && (
                <span className="message-time-tooltip">{msg.time}</span>
              )}

              <div className="bubble-container">
                <div className="message-bubble">{msg.text}</div>
                {msg.reaction && (
                  <div className="reaction-badge">{msg.reaction}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="encryption-note">
          <Lock size={12} style={{ display: "inline", marginBottom: "2px" }} />
          <p>
            Tin nhắn và cuộc gọi mới được bảo mật bằng tính năng mã hóa đầu
            cuối.
          </p>
          <span className="link">Tìm hiểu thêm</span>
        </div>
      </div>

      <div className="chat-footer">
        <div className="footer-actions">
          <ImageIcon className="header-icon" size={22} />
          <Sticker className="header-icon" size={22} />
          <Gift className="header-icon" size={22} />
        </div>
        <div className="input-wrapper">
          <input type="text" className="chat-input" placeholder="Aa" />
          <Smile className="smile-icon" size={24} />
        </div>
        <div className="like-btn">
          <ThumbsUp size={24} />
        </div>
      </div>
    </div>
  );
};

export default Messenger;
