import { useEffect } from "react";
import ChatPage from "./ChatPage";
import socket from "../socket";
import { useSnackbar } from "notistack";
import { useQuery } from "react-query";
import { getGlobalMessages } from "../api";
import { CircularProgress, Box } from "@mui/material";

function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useQuery(["globalMessage"], getGlobalMessages, {
    refetchOnWindowFocus: false,
  });

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

    socket.emit("joinGlobalChat", localStorage.getItem("username"));

    socket.on("joinedGlobalChat", notifyUserJoined);

    return () => {
      socket.off("joinedGlobalChat", notifyUserJoined);
    };
  }, []);

  return isLoading ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress size={80} />
    </Box>
  ) : (
    <ChatPage roomId="globalChat" isLoading={isLoading} initialData={data} />
  );
}

export default Home;
