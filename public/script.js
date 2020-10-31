const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});

const myVideo = document.createElement('video');
myVideo.muted = true;

const messages = document.getElementById('messages');

const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })
})

let chatMessage = document.getElementById('chat__message');
chatMessage.addEventListener('keydown', (event) => {
    let messageContent = chatMessage.value;
    if (event.which === 13 && messageContent.length !== 0) {
        socket.emit('message', messageContent);
        chatMessage.value = "";
    }
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close();
    }
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

socket.on('createMessage', message => {
    const newMessage = document.createElement('li');
    newMessage.className = "message";
    newMessage.innerHTML = `<b>user:</b><br/> ${message}`;
    messages.append(newMessage);
})

// Mute or unmute voice
const muteUnmute = () => {
    const enabled = myVideo.srcObject.getAudioTracks()[0].enabled;

    if (enabled) {
         myVideo.srcObject.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
         myVideo.srcObject.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}


const playOrStop = () => {
    const enabled = myVideo.srcObject.getVideoTracks()[0].enabled;
    
    if (enabled) {
        myVideo.srcObject.getVideoTracks()[0].enabled = false;
        setStopButton();
    } else {
        setPlayButton();
        myVideo.srcObject.getVideoTracks()[0].enabled = true;
    }
}

const setPlayButton = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}

const setStopButton = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}



