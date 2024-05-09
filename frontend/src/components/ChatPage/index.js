import { Box, IconButton, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import socket from "../../socket";
import ChatBody from "./ChatBody";
import ChatInput from "./ChatInput";
import ChatSideBar from "./ChatSideBar";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ChatPage = ({ title, roomId, returnBack, initialData }) => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    function appendReceivedMessage({ message, username }) {
      setMessages((oldMessages) => [
        ...oldMessages,
        { isMe: false, message, username },
      ]);
    }

    function privateChatInitiated(username) {
      enqueueSnackbar(
        `User-${username} wants to start a private chat with you.`,
        {
          variant: "info",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        }
      );
    }

    socket.on("receiveMessage", appendReceivedMessage);
    socket.on("privateChatInitiated", privateChatInitiated);

    return () => {
      socket.off("receiveMessage", appendReceivedMessage);
      socket.off("privateChatInitiated", privateChatInitiated);
    };
  }, []);

  useEffect(() => {
    if (initialData) setMessages(() => [...initialData]);
  }, [initialData]);

  return (
    <Box display="flex" alignItems="center" width="100%" height="100vh">
      <ChatSideBar />
      <Box
        flex={{ xs: "1.0", md: "0.8" }}
        height="100%"
        display="flex"
        flexDirection="column"
        borderLeft="0.5px dotted rgba(0, 0, 0, 0.2)"
      >
        <Box
          px="20px"
          pt="20px"
          pb="10px"
          borderBottom="0.5px dotted rgba(0, 0, 0, 0.2)"
          display="flex"
          gap={3}
        >
          {returnBack && (
            <IconButton onClick={() => navigate("/")}>
              <IoMdArrowRoundBack />
            </IconButton>
          )}
          <Typography variant="h4" fontWeight="400">
            {title ?? "Global chat"}
          </Typography>
        </Box>
        <ChatBody messages={messages} />
        <ChatInput setMessages={setMessages} roomId={roomId} />
      </Box>
    </Box>
  );
};

export default ChatPage;
