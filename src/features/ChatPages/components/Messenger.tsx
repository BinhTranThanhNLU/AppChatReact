// screens/messenger/components/Messenger.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Send,
  Smile,
  Phone,
  Video,
  Info,
  MoreHorizontal,
  ThumbsUp,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, Message } from "../../../features/chat/ChatSlice";
import { sendSocket } from "../../../api/socket";
import { loginSuccess } from "../../chat/AuthSlice";

interface MessengerProps {
  messages: Message[];
  currentUser: string;
  currentChatUser: string | null;
  chatType: "people" | "room";
}

const Messenger: React.FC<MessengerProps> = ({
  messages,
  currentUser,
  currentChatUser,
  chatType,
}) => {
  const [inputMsg, setInputMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // 1. SẮP XẾP TIN NHẮN (Cũ trên - Mới dưới)
  const sortedMessages = useMemo(() => {
    if (!messages) return [];

    const filtered = messages.filter((msg) => {
      const sender = String(msg.userId || "").trim();
      const receiver = String(msg.to || "").trim(); // Lấy người nhận

      const me = String(currentUser || "").trim();
      const other = String(currentChatUser || "").trim();

      if (chatType === "room") {
        return true;
      }

      const isFromOther = sender === other;
      const isMeToOther = sender === me && receiver === other;

      return isFromOther || (msg.to ? isMeToOther : sender === me);
    });

    return filtered.sort((a, b) => {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  }, [messages, currentUser, currentChatUser, chatType]);

  useEffect(() => {
    if (!currentUser) {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const { user, code } = JSON.parse(storedAuth);
          dispatch(loginSuccess({ user: user, reLoginCode: code }));
        } catch (error) {
          console.error("Lỗi parse auth từ localStorage", error);
        }
      }
    }
  }, [currentUser, dispatch]);

  // 2. TỰ ĐỘNG CUỘN XUỐNG DƯỚI
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  // 3. GỬI TIN NHẮN
  const handleSend = () => {
    const trimmedMsg = inputMsg.trim();

    // Check điều kiện
    if (!trimmedMsg || !currentChatUser) return;

    const messageData: Message = {
      userId: currentUser,
      to: currentChatUser, // Lưu lại gửi cho ai
      content: trimmedMsg,
      time: new Date().toISOString(),
    };

    // Gửi qua Socket
    sendSocket({
      action: "onchat",
      data: {
        event: "SEND_CHAT",
        data: {
          type: chatType,
          to: currentChatUser,
          mes: trimmedMsg, // Gửi chuỗi đã clean
        },
      },
    });

    dispatch(addMessage(messageData));

    setInputMsg("");
  };

  if (!currentChatUser) {
    return (
      <div
        className="main-chat"
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <p style={{ color: "#65676b", fontSize: "18px" }}>
          Chọn người để bắt đầu trò chuyện
        </p>
      </div>
    );
  }

  return (
    <div className="main-chat">
      {/* HEADER */}
      <div className="chat-header">
        <div className="user-header-info">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              currentChatUser
            )}&background=random`}
            className="header-avatar"
            alt="avatar"
          />
          <div className="header-details">
            <h3>{currentChatUser}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="header-icons">
          <Phone className="header-icon" size={20} />
          <Video className="header-icon" size={20} />
          <Info className="header-icon" size={20} />
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="messages-area">
        {sortedMessages.map((msg, index) => {
          const senderName = String(msg.userId || "").trim();
          const myName = String(currentUser || "").trim();

          const isMe = senderName === myName;

          return (
            <div key={index} className={`message-row ${isMe ? "me" : "other"}`}>
              {!isMe && (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    msg.userId
                  )}&background=random`}
                  className="message-avatar"
                  alt="sender"
                />
              )}
              <div className="message-content">
                <div className="bubble-container">
                  <div className="message-bubble">{msg.content}</div>
                </div>
                {/* Hiển thị thời gian nhỏ bên dưới nếu muốn */}
                <div
                  style={{
                    fontSize: "10px",
                    color: "#aaa",
                    textAlign: isMe ? "right" : "left",
                  }}
                >
                  {new Date(msg.time).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* FOOTER */}
      <div className="chat-footer">
        <div className="footer-actions">
          <MoreHorizontal size={20} />
          <ImageIcon size={20} />
          <Mic size={20} />
        </div>
        <div className="input-wrapper">
          <input
            className="chat-input"
            placeholder="Aa"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Smile className="smile-icon" size={20} />
        </div>
        <div onClick={handleSend} className="like-btn">
          {inputMsg.trim() ? <Send size={20} /> : <ThumbsUp size={20} />}
        </div>
      </div>
    </div>
  );
};

export default Messenger;
