import { Box, Typography } from "@mui/material";

const ChatMessage = ({ text, username, isMe = true, previousMessage }) => {
  return (
    <Box display="flex" justifyContent={isMe ? "flex-end" : "flex-start"}>
      <Box>
        {!isMe && username !== previousMessage?.username && (
          <Typography
            mt="10px"
            variant="body2"
            fontSize="0.75rem"
            color="#65676B"
            textAlign="left"
          >
            User-{username}
          </Typography>
        )}
        <Typography
          display="inline-block"
          backgroundColor={isMe ? "#1998e6" : "#ddd"}
          p="7px 13px"
          lineHeight="1.4"
          marginBottom="2px"
          borderRadius="15px"
          color={isMe && "#fff"}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
