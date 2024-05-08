import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Home from "./components/Home";
import "./App.css";
import { randomStringGenerator } from "./utils";
import { CircularProgress, CssBaseline, Box } from "@mui/material";
import { QueryClientProvider, QueryClient } from "react-query";
import socket from "./socket";

const queryClient = new QueryClient();

function App() {
  const [ready, setReady] = useState(!!localStorage.getItem("username"));

  useEffect(() => {
    if (!localStorage.getItem("username")) {
      localStorage.setItem("username", randomStringGenerator(10));
      setReady(true);
    }

    socket.connect();

    return () => {
      socket.disconnect();
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
