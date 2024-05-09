import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  CardHeader,
  CircularProgress,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getActiveUsers } from "../../api";
import socket from "../../socket";
import { useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const ChatSideBar = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [open, setOpen] = useState(false);
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
    <>
      <Box
        height="100%"
        flex="0.2"
        p="20px"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <SideBarContent
          activeUsers={activeUsers}
          isLoading={isLoading}
          setOpen={setOpen}
        />
      </Box>
      <Box
        height="100%"
        p="10px"
        pt="20px"
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        <IconButton onClick={() => setOpen(true)}>
          <GiHamburgerMenu />
        </IconButton>
        <Box
          height="100%"
          width="280px"
          bgcolor="#fff"
          position="fixed"
          zIndex="1"
          overflow="none"
          display={open ? "block" : "none"}
          top="0"
          left="0"
          p="10px"
          borderRight="0.5px dotted rgba(0, 0, 0, 0.2)"
        >
          <IconButton onClick={() => setOpen(false)}>
            <IoMdClose size={25} />
          </IconButton>
          <SideBarContent
            activeUsers={activeUsers}
            isLoading={isLoading}
            setOpen={setOpen}
          />
        </Box>
      </Box>
    </>
  );
};

const SideBarContent = ({ activeUsers, isLoading, setOpen }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" fontWeight="400" mt="30px" mb="20px">
        Active users
      </Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        activeUsers.map(({ username, userId }, index) => (
          <ButtonBase
            key={index}
            sx={{
              border: "0.5px solid rgba(0, 0, 0, 0.2)",
              pt: 1.5,
              pl: 2,
              borderRadius: "45px",
              mb: 2,
            }}
            disabled={userId === localStorage.getItem("userId")}
            onClick={() => {
              socket.emit(
                "initiatePrivateChat",
                {
                  currentUserId: localStorage.getItem("userId"),
                  targetUserId: userId,
                },
                ({ roomId, targetUsername }) => {
                  setOpen(false);
                  navigate(`/private-chat/${roomId}`, {
                    state: { targetUsername },
                  });
                }
              );
            }}
          >
            <CardHeader
              avatar={
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar />
                </StyledBadge>
              }
              titleTypographyProps={{
                ...(userId === localStorage.getItem("userId") && {
                  fontWeight: "bold",
                }),
              }}
              title={`User-${username} ${
                userId === localStorage.getItem("userId") ? "(You)" : ""
              }`}
              sx={{
                pl: "0",
                pt: "0",
              }}
            />
          </ButtonBase>
        ))
      )}
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
