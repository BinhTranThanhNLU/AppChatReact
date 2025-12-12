import React from 'react';
import '../../assets/css/messenger.css';
import ListMessenger from './components/ListMessengers';
import InforMessenger from './components/InforMessenger';
import Messenger from './components/Messenger';
import { ChatItem, MessageItem } from "../../types/ChatType";

const MessengerScreen:React.FC = () => {
  
  // Data giả lập
  const chatList: ChatItem[] = [
    {
      id: 1,
      name: "Tobac_o 🚬",
      msg: "Tin: https://www.youtube.c...",
      time: "34 phút",
      active: false,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "Gia Huy Truong",
      msg: "Đã bày tỏ cảm xúc ❤️ về tin nh...",
      time: "17 giờ",
      active: true,
      avatar: "https://i.pravatar.cc/150?img=11",
    },
  ];

  const messages: MessageItem[] = [
    {
      id: 1,
      sender: "me",
      text: "10k phát sinh nha Huy ơi",
      time: "13:21 13/12/22",
      reaction: null,
    },
    {
      id: 2,
      sender: "other",
      text: "Okieeeee",
      time: "22:41 4/2/24",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
      id: 3,
      sender: "other",
      text: "Chúc ông sn vui vẻ nhé ❤️",
      time: "23:08 4/2/24",
      avatar: "https://i.pravatar.cc/150?img=11",
      reaction: "❤️",
    },
    { id: 4, sender: "me", text: "Cảm ơn ô nhiều nhoa", reaction: "❤️" },
  ];

  return (
    <div className="messenger-container">

      <ListMessenger chatList={chatList}/>
      <Messenger messages={messages}/>
      <InforMessenger />

    </div>
  );
};

export default MessengerScreen;