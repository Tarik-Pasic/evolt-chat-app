import { useEffect } from "react";
import ChatPage from "./ChatPage";
import socket from "../socket";
import { useSnackbar } from "notistack";

function Home() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    function notifyUserJoined(username) {
      enqueueSnackbar(`User-${username} joined global chat`, {
        variant: "info",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }

    socket.on("joinedGlobalChat", notifyUserJoined);

    return () => {
      socket.off("joinedGlobalChat", notifyUserJoined);
    };
  }, []);

  return (
    <>
      <ChatPage />
    </>
  );
}

export default Home;
