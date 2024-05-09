import { Box, CircularProgress, CssBaseline } from "@mui/material";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import socket from "./socket";
import PageReload from "./components/PageReload";

const queryClient = new QueryClient();

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function registerUser() {
      const userInformation = {
        username: localStorage.getItem("username"),
        userId: localStorage.getItem("userId"),
      };

      socket.emit("registerUser", userInformation);
    }

    function saveUserInformation(userInformation) {
      localStorage.setItem("username", userInformation.username);
      localStorage.setItem("userId", userInformation.userId);
      setReady(true);
    }

    function cleanup() {
      socket.emit("deleteActiveUser", localStorage.getItem("userId"));
    }

    function privateChatJoined(message) {
      enqueueSnackbar(message, {
        variant: "info",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }

    socket.connect();
    registerUser();
    socket.on("getUserInformation", saveUserInformation);
    socket.on("privateChatJoined", privateChatJoined);
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
      socket.disconnect();
      socket.off("getUserInformation", saveUserInformation);
      socket.off("privateChatJoined", privateChatJoined);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <CssBaseline />
        {!ready ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <CircularProgress size={90} />
          </Box>
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/private-chat/:id" element={<PageReload />} />
            </Routes>
          </BrowserRouter>
        )}
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;
