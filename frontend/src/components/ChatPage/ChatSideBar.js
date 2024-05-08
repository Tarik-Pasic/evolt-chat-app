import {
  Avatar,
  Badge,
  Box,
  CardHeader,
  CircularProgress,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getActiveUsers } from "../../api";
import socket from "../../socket";

const ChatSideBar = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const { isLoading } = useQuery("activeUsers", getActiveUsers, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setActiveUsers(() => {
        let users = [...(data || [])];
        const userNotInActiveUsers = !users.find(
          ({ userId }) => userId === localStorage.getItem("userId")
        );

        if (userNotInActiveUsers)
          users = [
            {
              username: localStorage.getItem("username"),
              userId: localStorage.getItem("userId"),
            },
          ].concat(users);

        return users;
      });
    },
  });

  useEffect(() => {
    function appendActiveUser(activeUser) {
      setActiveUsers((oldActiveUsers) => {
        const newActiveUsers = [...(oldActiveUsers || [])];
        newActiveUsers.push(activeUser);
        return newActiveUsers;
      });
    }

    function deleteActiveUser(disconnectedUser) {
      setActiveUsers((oldActiveUsers) => {
        const newActiveUsers = [...(oldActiveUsers || [])];
        const disconnectedUserIndex = newActiveUsers.findIndex(
          (row) => row.userId === disconnectedUser
        );
        newActiveUsers.splice(disconnectedUserIndex, 1);

        return newActiveUsers;
      });
    }

    socket.on("activeUsers", appendActiveUser);
    socket.on("disconnectedUser", deleteActiveUser);

    return () => {
      socket.off("activeUsers", appendActiveUser);
      socket.off("disconnectedUser", deleteActiveUser);
    };
  }, []);

  return (
    <Box
      height="100%"
      flex="0.2"
      p="20px"
      borderRight="0.5px dotted rgba(0, 0, 0, 0.2)"
    >
      <Typography variant="h4" fontWeight="400" mt="30px" mb="20px">
        Active users
      </Typography>
      <Box>
        {isLoading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          activeUsers.map(({ username, userId }, index) => (
            <CardHeader
              key={index}
              avatar={
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar />
                </StyledBadge>
              }
              title={`User-${username} ${
                userId === localStorage.getItem("userId") ? "(You)" : ""
              }`}
              sx={{
                pl: "0",
                pt: "0",
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      border: "1px solid currentColor",
      content: '""',
    },
  },
}));

export default ChatSideBar;
