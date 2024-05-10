import ChatPage from "./ChatPage";
import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

const PrivateChat = ({ id, targetUsername }) => {
  const navigate = useNavigate();

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

    socket.emit(
      "joinPrivateChat",
      {
        roomId: id,
        currentUserId: localStorage.getItem("userId"),
      },
      (response) => {
        if (response === "not_exist") navigate("/");
      }
    );

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
