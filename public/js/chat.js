const $messageForm = document.querySelector('#message-form') 
const $messageFormInput = document.querySelector('input') 
const $messageFormButton = document.querySelector('button') 
const $sendLocationButton = document.querySelector('#send-location') 
const $messages = document.querySelector('#messages') 
// const $messageBox1 = document.querySelector('#messageBox1') 
// const $messageBox2 = document.querySelector('#messageBox2') 

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const socket = io()
let currentUser;
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // new mssage element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('messageLocation', (details)=> {
    const html = Mustache.render(locationMessageTemplate, {
        currentUser: currentUser === details.username? true : false,
        username: details.username,
        locationLink: details.url,
        createdAt: moment(details.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    console.log(details.url);
})
socket.on('message', (data) => {
    console.log(data);
    const html = Mustache.render(messageTemplate, {
        username: data.username,
        message: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // if (currentUser === data.username) {
    //     console.log($messageBox1);
    //     $messageBox1.classList.add('messageInner')
    // }
    autoscroll()
})
$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')

 const message = e.target.elements.message.value
 socket.emit('sendMessage', message, (error)=> {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
        return console.log(error);
     }
     console.log('Message was delivered');
 })
})

$sendLocationButton.addEventListener('click', ()=> {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by ur browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=> {
        const details = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', details, ()=> {
            console.log('Location shared');
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate, {room, users})
    document.querySelector('#sidebar').innerHTML = html
})
socket.emit('join', {username, room}, (error) => {
    // currentUser = username.trim().toLowerCase();
    if (error) {
        alert(error)
        location.href = '/'
    }
})