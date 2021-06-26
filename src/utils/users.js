const users = [];

// add user, remove user, get  user, get users in room

const addUser = ({id, username, room}) => {
    // clean data and validation
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!username || !room) {
        return {
            error: "Username and room required"
        }
    }
    // check for existing user
    const existingUser = users.find((user)=> {
        return user.room === room && user.username === username
    })
    // validate user 
    if (existingUser) {
        return {
            error: "Username is in use!"
        }
    }
    // store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}