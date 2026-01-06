import { useState } from "react";
import { Message } from "../../chat/ChatSlice";
import { Smile } from "lucide-react";

const MessageItem = ({
  msg,
  currentUser,
  onReact,
}: {
  msg: Message;
  currentUser: string;
  onReact: (msg: Message, icon: string) => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const reactionsList = ["👍", "❤️", "😂", "😮", "😢", "😠"];
  const isMe = msg.userId === currentUser;

  return (
    <div className={`message-row ${isMe ? "me" : "other"}`}>
      {!isMe && (
        <img
          src={`https://ui-avatars.com/api/?name=${msg.userId}`}
          className="message-avatar"
          alt="sender"
        />
      )}

      <div className="message-content">
        <div
          className="message-bubble-container"
          style={{ flexDirection: isMe ? "row-reverse" : "row" }}
        >
          {/* 1. NỘI DUNG TIN NHẮN (BUBBLE) */}
          <div className="message-bubble relative">
            {msg.msgType === "image" ? (
              <img
                src={msg.content}
                alt="img"
                style={{ maxWidth: "220px", borderRadius: "12px" }}
              />
            ) : (
              msg.content
            )}

            {/* 3. HIỂN THỊ ICON ĐÃ THẢ (BADGE) */}
            {msg.myReaction && (
              <div className="my-reaction-badge">{msg.myReaction}</div>
            )}
          </div>

          {/* 2. NÚT TRIGGER & POPUP (Nằm cạnh bong bóng chat) */}
          <div style={{ position: "relative" }}>
            {/* Nút mặt cười (Hiện khi hover dòng message-row) */}
            <div
              className="reaction-trigger-btn"
              onClick={() => setShowPicker(!showPicker)}
            >
              <Smile size={16} />
            </div>

            {/* Popup chọn icon */}
            {showPicker && (
              <div
                className="reaction-popup"
                style={isMe ? { right: 0 } : { left: 0 }}
              >
                {reactionsList.map((emoji) => (
                  <span
                    key={emoji}
                    className="emoji-option"
                    onClick={() => {
                      onReact(msg, emoji);
                      setShowPicker(false); // Chọn xong ẩn luôn
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="message-time">
          {new Date(msg.time).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
