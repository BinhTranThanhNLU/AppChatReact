import React, {useRef, useState, useEffect} from "react";
import OptionsMenu from "./OptionsMenu";

import "../../../assets/css/messenger.css";
import {Search, MoreHorizontal, Edit, Image as ImageIcon} from "lucide-react";
import {ChatItem} from "../../../types/ChatType";
import {sendSocket, searchUser} from "../../../api/socket";

interface ListMessengerProps {
    chatList: ChatItem[];
    onSelected: (id: string, type: "people" | "room") => void;
}

const ListMessenger: React.FC<ListMessengerProps> = ({
                                                         chatList,
                                                         onSelected,
                                                     }) => {
    // menu create room và join room
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // tim kiem user
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        const value = keyword.trim();
        if (!value) return;

        searchUser(value);

        setKeyword("");
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [chatList.length]);

    return (
        <div className="sidebar-left">
            <div className="sidebar-header">
                <div className="header-top">
                    <h1 className="header-title">Đoạn chat</h1>
                    <div className="header-actions" ref={menuRef}>
                        <button
                            className="icon-btn"
                            onClick={() => setShowMenu((prev) => !prev)}
                        >
                            <MoreHorizontal size={20}/>
                        </button>

                        {showMenu && <OptionsMenu onClose={() => setShowMenu(false)}/>}

                        <button className="icon-btn">
                            <Edit size={20}/>
                        </button>
                    </div>
                </div>

                <div
                    className="search-container"
                    style={{display: "flex", alignItems: "center", gap: "8px"}}
                >
                    <div
                        style={{
                            flex: 1,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Search
                            className="search-icon"
                            size={18}
                            style={{position: "absolute", left: "10px"}}
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Nhập tên người dùng..."
                            value={keyword}
                            style={{paddingLeft: "35px", width: "100%"}}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
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
                        }}
                    >
                        +
                    </button>
                </div>

                <div className="filter-tabs">
                    <button className="filter-pill active">Tất cả</button>
                </div>
            </div>

            <div className="chat-list">
                {chatList.map((chat) => (
                    <div
                        key={`${chat.type}-${chat.id}`}
                        className={`chat-item ${chat.active ? "active" : ""}`}
                        onClick={() => onSelected(chat.id, chat.type as "people" | "room")}
                    >
                        <div className="avatar-container">
                            <img src={chat.avatar} alt="avt" className="avatar"/>
                            {chat.active && <div className="online-dot"></div>}
                        </div>
                        <div className="chat-info">
                            <h3 className="chat-name">{chat.name || "Unknown User"}</h3>
                            <div className="chat-preview">
                                <span className="preview-text">{chat.msg}</span>
                                <span style={{margin: "0 4px"}}>·</span>
                                <span>{chat.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef}/>
            </div>
        </div>
    );
};
export default ListMessenger;
