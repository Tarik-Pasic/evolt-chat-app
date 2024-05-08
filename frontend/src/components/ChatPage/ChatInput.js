import { IconButton, Box, TextField, useTheme } from "@mui/material";
import { useState } from "react";
import { IoMdSend } from "react-icons/io";
import socket from "../../socket";

const ChatInput = ({ setMessages }) => {
  const [text, setText] = useState("");
  const theme = useTheme();

  const sendMessage = () => {
    setMessages((oldMessages) => {
      return [
        ...oldMessages,
        {
          message: text,
          isMe: true,
          username: localStorage.getItem("username"),
        },
      ];
    });
    socket.emit("send_message", {
      message: text,
      username: localStorage.getItem("username"),
    });
  };

  const cleanup = () => {
    setText("");
  };

  return (
    <Box display="flex" gap={2} p={2}>
      <TextField
        sx={{
          bgcolor: "white",
        }}
        autoComplete="off"
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && text) {
            sendMessage();
            cleanup();
          }
        }}
      />
      <IconButton
        disabled={text === ""}
        onClick={() => {
          sendMessage();
          cleanup();
        }}
      >
        <IoMdSend size={30} color={text && theme.palette.primary.main} />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
