const users = [];

const addUser = ({ id, profile, chat }) => {
  const existingUser = users.find((user) => {
    user.chat === chat && user.profile === profile
  });

  if (existingUser) {
    return { error: 'User already in room' }
  }

  const user = { id, profile, chat }
  users.push(user);
  console.log(users)
  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (chat) => {
  users.filter((user) => {
    user.chat === chat;
  });
}

module.exports = { addUser, getUser, removeUser, getUsersInRoom };