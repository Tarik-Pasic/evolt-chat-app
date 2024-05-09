const generateRoomId = (userId1, userId2) => {
  const sortedUserIds = [userId1, userId2].sort();

  return sortedUserIds.join(" - ");
};

export default generateRoomId;