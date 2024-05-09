import ChatPage from "./ChatPage";
import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import socket from "../socket";

const PrivateChat = ({ id, targetUsername }) => {
  useEffect(() => {
    function userLeftPrivateChat(message) {
      enqueueSnackbar(message, {
        variant: "info",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }

    function leavePrivateChat() {
      socket.emit("leavePrivateChat", {
        roomId: id,
        currentUserId: localStorage.getItem("userId"),
        username: localStorage.getItem("username"),
      });
    }

    socket.on("leftPrivateChat", userLeftPrivateChat);
    window.addEventListener("beforeunload", leavePrivateChat);

    return () => {
      leavePrivateChat();
      window.removeEventListener("beforeunload", leavePrivateChat);
      socket.off("leftPrivateChat", userLeftPrivateChat);
    };
  }, [id]);

  return (
    <ChatPage
      title={`Private chat: User-${targetUsername} `}
      roomId={id}
      returnBack
    />
  );
};

export default PrivateChat;
