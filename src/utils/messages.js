const generateMessage = (username,text) => {
    return {username, text, createdAt: new Date().getTime()}
}
const generateLocationMessage = (username, cordinates) => {
  return { username, url: `https://google.com/maps?q=${cordinates.latitude},${cordinates.longitude}`, createdAt: new Date().getTime()}
}
module.exports = {
    generateMessage,
    generateLocationMessage
}