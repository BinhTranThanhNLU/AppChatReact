import { useState } from "react";
import { Message } from "../../chat/ChatSlice";
import { Smile, Share2 } from "lucide-react"; // Thêm Share2

const MessageItem = ({
                         msg,
                         currentUser,
                         onReact,
                         onForward, // Thêm prop xử lý chuyển tiếp
                     }: {
    msg: Message;
    currentUser: string;
    onReact: (msg: Message, icon: string) => void;
    onForward: (msg: Message) => void; // Định nghĩa kiểu hàm
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
                    {/* 1. NỘI DUNG TIN NHẮN */}
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

                        {msg.myReaction && (
                            <div className="my-reaction-badge">{msg.myReaction}</div>
                        )}
                    </div>

                    {/* 2. CỤM NÚT ĐIỀU KHIỂN (SMILE & FORWARD) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                        <div
                            className="reaction-trigger-btn"
                            onClick={() => setShowPicker(!showPicker)}
                            title="Bày tỏ cảm xúc"
                        >
                            <Smile size={16} />
                        </div>

                        {/* Nút Chuyển Tiếp */}
                        <div
                            className="reaction-trigger-btn"
                            onClick={() => onForward(msg)}
                            title="Chuyển tiếp tin nhắn"
                        >
                            <Share2 size={16} />
                        </div>

                        {showPicker && (
                            <div
                                className="reaction-popup"
                                style={isMe ? { right: 40 } : { left: 0 }}
                            >
                                {reactionsList.map((emoji) => (
                                    <span
                                        key={emoji}
                                        className="emoji-option"
                                        onClick={() => {
                                            onReact(msg, emoji);
                                            setShowPicker(false);
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