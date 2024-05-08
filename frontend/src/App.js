import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Home from "./components/Home";
import "./App.css";
import { CircularProgress, CssBaseline, Box } from "@mui/material";
import { QueryClientProvider, QueryClient } from "react-query";
import socket from "./socket";

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

    socket.connect();
    registerUser();
    socket.on("getUserInformation", saveUserInformation);
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
      socket.disconnect();
      socket.off("getUserInformation", saveUserInformation);
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
            </Routes>
          </BrowserRouter>
        )}
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;
