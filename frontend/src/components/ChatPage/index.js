import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ChatSideBar from "./ChatSideBar";
import ChatInput from "./ChatInput";
import ChatBody from "./ChatBody";
import socket from "../../socket";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    function appendReceivedMessage({ message, username }) {
      setMessages((oldMessages) => [
        ...oldMessages,
        { isMe: false, message, username },
      ]);
    }

    socket.on("receive_message", appendReceivedMessage);

    return () => {
      socket.off("receive_message", appendReceivedMessage);
    };
  }, []);

  return (
    <Box display="flex" alignItems="center" width="100%" height="100vh">
      <ChatSideBar />
      <Box flex="0.8" height="100%" display="flex" flexDirection="column">
        <Box
          px="20px"
          pt="20px"
          pb="10px"
          borderBottom="0.5px dotted rgba(0, 0, 0, 0.2)"
        >
          <Typography variant="h4" fontWeight="400">
            Global chat
          </Typography>
        </Box>
        <ChatBody messages={messages} />
        <ChatInput setMessages={setMessages} />
      </Box>
    </Box>
  );
};

export default ChatPage;
