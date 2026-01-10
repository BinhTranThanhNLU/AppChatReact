import React, {useState, useEffect, useRef, useMemo} from "react";
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
    X, // Thêm icon X để đóng modal
} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {addMessage, Message, toggleReaction} from "../../../features/chat/ChatSlice";
import {sendSocket} from "../../../api/socket";
import {RootState} from "../../../stores/Store";
import {VideoCallModal} from "../../../features/ChatPages/components/VideoCallModal";
import MessageItem from "./MessageItem";


interface MessengerProps {
    messages: Message[];
    currentUser: string;
    currentChatUser: string | null;
    chatType: "people" | "room";
}

const STICKER_LIST = [
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.gif",
];

const Messenger: React.FC<MessengerProps> = ({
                                                 messages,
                                                 currentUser,
                                                 currentChatUser,
                                                 chatType,
                                             }) => {
    const [inputMsg, setInputMsg] = useState("");
    const [showStickers, setShowStickers] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => state.chat.users);
    const rooms = useSelector((state: RootState) => state.chat.rooms);

    // STATE CHO CHUYỂN TIẾP
    const [forwardData, setForwardData] = useState<{ show: boolean; msg: Message | null }>({
        show: false,
        msg: null,
    });

    // VIDEO CALL STATE & LOGIC (GIỮ NGUYÊN TỪ FILE GỐC CỦA BẠN)
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const iceServers = {iceServers: [{urls: "stun:stun.l.google.com:19302"}]};

    const createPeerConnection = (targetUser: string, stream: MediaStream) => {
        const pc = new RTCPeerConnection(iceServers);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.ontrack = (e) => {
            if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
        };
        pc.onicecandidate = (e) => {
            if (e.candidate && targetUser) {
                sendSocket({
                    action: "onchat",
                    data: {event: "VIDEO_CALL_SIGNAL", data: {to: targetUser, signalData: {candidate: e.candidate}}},
                });
            }
        };
        peerConnection.current = pc;
        return pc;
    };

    const startVideoCall = async () => {
        if (!currentChatUser) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setLocalStream(stream);
            setIsCalling(true);
            const pc = createPeerConnection(currentChatUser, stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSocket({
                action: "onchat",
                data: {event: "VIDEO_CALL_SIGNAL", data: {to: currentChatUser, signalData: offer}}
            });
        } catch (err) {
            alert("Không thể truy cập Camera/Microphone!");
        }
    };

    const handleReceiveCall = async (from: string, offer: any) => {
        const confirmCall = window.confirm(`Cuộc gọi đến từ ${from}. Bạn có muốn nghe không?`);
        if (!confirmCall) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setLocalStream(stream);
            setIsCalling(true);
            const pc = createPeerConnection(from, stream);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSocket({action: "onchat", data: {event: "VIDEO_CALL_SIGNAL", data: {to: from, signalData: answer}}});
        } catch (err) {
            console.error(err);
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
        const handleClickOutside = (event: MouseEvent) => {
            // Nếu click không nằm trong stickerRef thì đóng bảng
            if (stickerRef.current && !stickerRef.current.contains(event.target as Node)) {
                setShowStickers(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleSignal = (e: any) => {
            const {from, signalData} = e.detail;
            if (signalData.type === "offer") handleReceiveCall(from, signalData);
            else if (signalData.type === "answer") peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signalData));
            else if (signalData.candidate) peerConnection.current?.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        };
        window.addEventListener("webrtc-signal", handleSignal);
        return () => window.removeEventListener("webrtc-signal", handleSignal);
    }, []);

    // LOGIC NHẮN TIN (GIỮ NGUYÊN)
    const sortedMessages = useMemo(() => {
        if (!messages) return [];
        const filtered = messages.filter((msg) => {
            const sender = String(msg.userId || "").trim();
            const receiver = String(msg.to || "").trim();
            const me = String(currentUser || "").trim();
            const other = String(currentChatUser || "").trim();
            if (chatType === "room") return true;
            return (sender === other || (sender === me && receiver === other) || (sender === me && !msg.to));
        });
        return filtered.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [messages, currentUser, currentChatUser, chatType]);

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    }, [sortedMessages]);

    const handleSend = () => {
        const trimmedMsg = inputMsg.trim();
        if (!trimmedMsg || !currentChatUser) return;
        const messageData: Message = {
            userId: currentUser,
            to: currentChatUser,
            content: trimmedMsg,
            time: new Date().toISOString()
        };
        sendSocket({
            action: "onchat",
            data: {event: "SEND_CHAT", data: {type: chatType, to: currentChatUser, mes: trimmedMsg}}
        });
        dispatch(addMessage(messageData));
        setInputMsg("");
    };
    const handleSendSticker = (url: string) => {
        if (!currentChatUser) return;
        const messageData: Message = {
            userId: currentUser,
            to: currentChatUser,
            content: url,
            msgType: "sticker", // Loại tin nhắn mới
            time: new Date().toISOString()
        };
        // Gửi qua socket giống như chat text
        sendSocket({
            action: "onchat",
            data: {event: "SEND_CHAT", data: {type: chatType, to: currentChatUser, mes: url}}
        });
        dispatch(addMessage(messageData));
        setShowStickers(false); // Gửi xong thì đóng bảng
    };

    const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentChatUser) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            sendSocket({
                action: "onchat",
                data: {event: "SEND_CHAT", data: {type: chatType, to: currentChatUser, mes: base64}}
            });
            dispatch(addMessage({
                userId: currentUser,
                content: base64,
                msgType: "image",
                time: new Date().toISOString()
            }));
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const isOnline = useMemo(() => {
        if (chatType !== "people") return false;
        const user = users.find((u) => u.name === currentChatUser);
        return user?.isOnline === true;
    }, [users, currentChatUser, chatType]);

    const handleLocalReaction = (targetMsg: Message, icon: string) => {
        dispatch(toggleReaction({msgTime: targetMsg.time, msgUser: targetMsg.userId, icon: icon}));
    };

    // --- LOGIC XỬ LÝ CHUYỂN TIẾP ---
    const executeForward = (targetId: string, type: "people" | "room") => {
        if (!forwardData.msg) return;

        const contentToForward = forwardData.msg.content;
        const msgType = forwardData.msg.msgType || "text";

        // Gửi qua Socket
        sendSocket({
            action: "onchat",
            data: {
                event: "SEND_CHAT",
                data: {type: type, to: targetId, mes: contentToForward},
            },
        });

        // Nếu người nhận trùng với người đang mở chat hiện tại, thêm vào UI luôn
        if (targetId === currentChatUser && type === chatType) {
            dispatch(
                addMessage({
                    userId: currentUser,
                    to: targetId,
                    content: contentToForward,
                    msgType: msgType,
                    time: new Date().toISOString(),
                })
            );
        }

        alert(`Đã chuyển tiếp đến ${targetId}`);
        setForwardData({show: false, msg: null});
    };

    return (
        <div className="main-chat">
            {isCalling && <VideoCallModal stream={localStream} remoteStream={remoteStream} onClose={endCall}/>}

            {/* MODAL CHUYỂN TIẾP */}
            {forwardData.show && (
                <div className="forward-overlay">
                    <div className="forward-modal">
                        <div className="forward-header">
                            <h3>Chuyển tiếp tin nhắn</h3>
                            <X className="close-btn" onClick={() => setForwardData({show: false, msg: null})}/>
                        </div>
                        <div className="forward-body">
                            <p className="forward-preview">Nội
                                dung: <i>{forwardData.msg?.content.substring(0, 30)}...</i></p>

                            <div className="forward-section">
                                <h4>Người dùng</h4>
                                {users.map(u => (
                                    <div key={u.name} className="forward-item">
                                        <span>{u.name}</span>
                                        <button onClick={() => executeForward(u.name, "people")}>Gửi</button>
                                    </div>
                                ))}
                            </div>

                            <div className="forward-section">
                                <h4>Nhóm</h4>
                                {rooms.map(r => (
                                    <div key={r.roomName} className="forward-item">
                                        <span>{r.roomName}</span>
                                        <button onClick={() => executeForward(r.roomName, "room")}>Gửi</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="chat-header">
                <div className="user-header-info">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentChatUser || "")}&background=random`}
                        className="header-avatar"
                        alt="avatar"
                    />
                    <div className="header-details">
                        <h3>{currentChatUser}</h3>
                        {chatType === "people" &&
                            <p style={{color: isOnline ? "#31a24c" : "#65676b"}}>{isOnline ? "Đang hoạt động" : "Không hoạt động"}</p>}
                    </div>
                </div>
                <div className="header-icons">
                    <Phone className="header-icon" size={20}/>
                    <Video className="header-icon" size={20} onClick={startVideoCall}
                           style={{cursor: "pointer", color: "#0084ff"}}/>
                    <Info className="header-icon" size={20}/>
                </div>
            </div>

            <div className="messages-area">
                {sortedMessages.map((msg, index) => (
                    <MessageItem
                        key={index}
                        msg={msg}
                        currentUser={currentUser}
                        onReact={handleLocalReaction}
                        onForward={(m) => setForwardData({show: true, msg: m})} // Truyền hàm mở modal
                    />
                ))}
                <div ref={endRef}/>
            </div>

            <div className="chat-footer">
                <div className="footer-actions">
                    <MoreHorizontal size={20}/>
                    <ImageIcon size={20} style={{cursor: "pointer"}} onClick={() => fileInputRef.current?.click()}/>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleSelectImage}/>
                    <Mic size={20}/>
                </div>
                <div className="input-wrapper" style={{position: 'relative'}} ref={stickerRef}>
                    <input
                        className="chat-input"
                        placeholder="Aa"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />

                    <Smile
                        className="smile-icon"
                        size={20}
                        onClick={() => setShowStickers(!showStickers)}
                        style={{cursor: "pointer", color: showStickers ? "#0084ff" : "inherit"}}
                    />

                    {/* STICKER PICKER POPUP */}
                    {showStickers && (
                        <div style={{
                            position: 'absolute', bottom: '100%', right: 0, marginBottom: '10px',
                            background: 'white', border: '1px solid #ddd', borderRadius: '12px',
                            padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 1000,
                            width: '220px'
                        }}>
                            {STICKER_LIST.map((url, idx) => (
                                <img
                                    key={idx} src={url} alt="sticker"
                                    style={{width: '60px', height: '60px', cursor: 'pointer', borderRadius: '8px'}}
                                    onClick={() => handleSendSticker(url)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div onClick={handleSend} className="like-btn">
                    {inputMsg.trim() ? <Send size={20}/> : <ThumbsUp size={20}/>}
                </div>
            </div>
        </div>
    );
};

export default Messenger;