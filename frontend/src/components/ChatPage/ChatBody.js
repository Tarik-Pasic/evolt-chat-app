import { Box } from "@mui/material";
import ChatMessage from "./ChatMessage";

const ChatBody = ({ messages }) => {
  return (
    <Box sx={{ overflowY: "scroll" }} width="100%" p="20px" flex="1 1 auto">
      {messages.map(({ message, isMe, username }, index) => (
        <ChatMessage
          key={index}
          text={message}
          isMe={isMe}
          username={username}
          previousMessage={messages?.[index - 1]}
        />
      ))}
    </Box>
  );
};

export default ChatBody;
