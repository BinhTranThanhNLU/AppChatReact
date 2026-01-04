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
import { RootState } from "../../../stores/Store";
import { VideoCallModal } from "../../../features/ChatPages/components/VideoCallModal";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  // VIDEO CALL STATE
  const [isCalling, setIsCalling] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // --- LOGIC WEBRTC ---

  const createPeerConnection = (targetUser: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(iceServers);

    // Đưa các track (video/audio) vào connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Khi nhận được track từ đối phương
    pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        setRemoteStream(e.streams[0]);
      }
    };

    // Khi tìm thấy đường truyền (ICE Candidate)
    pc.onicecandidate = (e) => {
      if (e.candidate && targetUser) {
        sendSocket({
          action: "onchat",
          data: {
            event: "VIDEO_CALL_SIGNAL",
            data: {
              to: targetUser,
              signalData: { candidate: e.candidate },
            },
          },
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const startVideoCall = async () => {
    if (!currentChatUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCalling(true);

      const pc = createPeerConnection(currentChatUser, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSocket({
        action: "onchat",
        data: {
          event: "VIDEO_CALL_SIGNAL",
          data: { to: currentChatUser, signalData: offer },
        },
      });
    } catch (err) {
      console.error("Lỗi khởi động video:", err);
      alert("Không thể truy cập Camera/Microphone!");
    }
  };

  const handleReceiveCall = async (from: string, offer: any) => {
    const confirmCall = window.confirm(
      `Cuộc gọi đến từ ${from}. Bạn có muốn nghe không?`
    );
    if (!confirmCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCalling(true);

      const pc = createPeerConnection(from, stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSocket({
        action: "onchat",
        data: {
          event: "VIDEO_CALL_SIGNAL",
          data: { to: from, signalData: answer },
        },
      });
    } catch (err) {
      console.error("Lỗi chấp nhận cuộc gọi:", err);
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
  };

  useEffect(() => {
    const handleSignal = (e: any) => {
      const { from, signalData } = e.detail;

      if (signalData.type === "offer") {
        handleReceiveCall(from, signalData);
      } else if (signalData.type === "answer") {
        peerConnection.current?.setRemoteDescription(
          new RTCSessionDescription(signalData)
        );
      } else if (signalData.candidate) {
        peerConnection.current?.addIceCandidate(
          new RTCIceCandidate(signalData.candidate)
        );
      }
    };

    window.addEventListener("webrtc-signal", handleSignal);
    return () => window.removeEventListener("webrtc-signal", handleSignal);
  }, []);

  // --- LOGIC NHẮN TIN (GIỮ NGUYÊN) ---

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    const filtered = messages.filter((msg) => {
      const sender = String(msg.userId || "").trim();
      const receiver = String(msg.to || "").trim();
      const me = String(currentUser || "").trim();
      const other = String(currentChatUser || "").trim();
      if (chatType === "room") return true;
      return (
        sender === other ||
        (sender === me && receiver === other) ||
        (sender === me && !msg.to)
      );
    });

    // Sort theo thời gian
    return filtered.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  }, [messages, currentUser, currentChatUser, chatType]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  const handleSend = () => {
    const trimmedMsg = inputMsg.trim();
    if (!trimmedMsg || !currentChatUser) return;
    const messageData: Message = {
      userId: currentUser,
      to: currentChatUser,
      content: trimmedMsg,
      time: new Date().toISOString(),
    };
    sendSocket({
      action: "onchat",
      data: {
        event: "SEND_CHAT",
        data: { type: chatType, to: currentChatUser, mes: trimmedMsg },
      },
    });
    dispatch(addMessage(messageData));
    setInputMsg("");
  };

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatUser) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sendSocket({
        action: "onchat",
        data: {
          event: "SEND_CHAT",
          data: { type: chatType, to: currentChatUser, mes: base64 },
        },
      });
      dispatch(
        addMessage({
          userId: currentUser,
          content: base64,
          msgType: "image",
          time: new Date().toISOString(),
        })
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const users = useSelector((state: RootState) => state.chat.users);
  const isOnline = useMemo(() => {
    if (chatType !== "people") return false;
    const user = users.find((u) => u.name === currentChatUser);
    return user?.isOnline === true;
  }, [users, currentChatUser, chatType]);

  return (
    <div className="main-chat">
      {isCalling && (
        <VideoCallModal
          stream={localStream}
          remoteStream={remoteStream}
          onClose={endCall}
        />
      )}

      <div className="chat-header">
        <div className="user-header-info">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              currentChatUser || ""
            )}&background=random`}
            className="header-avatar"
            alt="avatar"
          />
          <div className="header-details">
            <h3>{currentChatUser}</h3>
            {chatType === "people" && (
              <p style={{ color: isOnline ? "#31a24c" : "#65676b" }}>
                {isOnline ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            )}
          </div>
        </div>
        <div className="header-icons">
          <Phone className="header-icon" size={20} />
          <Video
            className="header-icon"
            size={20}
            onClick={startVideoCall}
            style={{ cursor: "pointer", color: "#0084ff" }}
          />
          <Info className="header-icon" size={20} />
        </div>
      </div>

      <div className="messages-area">
        {sortedMessages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${
              msg.userId === currentUser ? "me" : "other"
            }`}
          >
            {msg.userId !== currentUser && (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  msg.userId
                )}&background=random`}
                className="message-avatar"
                alt="sender"
              />
            )}
            <div className="message-content">
              <div className="message-bubble">
                {msg.msgType === "image" ? (
                  <img
                    src={msg.content}
                    alt="chat-img"
                    style={{ maxWidth: "220px", borderRadius: "12px" }}
                  />
                ) : (
                  msg.content
                )}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#aaa",
                  textAlign: msg.userId === currentUser ? "right" : "left",
                }}
              >
                {new Date(msg.time).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-footer">
        <div className="footer-actions">
          <MoreHorizontal size={20} />
          <ImageIcon
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleSelectImage}
          />
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
