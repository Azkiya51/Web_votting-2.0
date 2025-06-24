const socket = io();
let currentRoomId = '';
let participantName = '';

function showCreate() {
    document.getElementById('createRoomDiv').style.display = 'block';
}
function showJoin() {
    document.getElementById('joinRoomDiv').style.display = 'block';
}

function createRoomdiv() {
    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);
}

function joinRoomdiv() {
    currentRoomId = document.getElementById('roomId').value;
    participantName = document.getElementById('participantName').value;
    socket.emit('joinRoom', { roomId: currentRoomId, name: participantName });
}

function sendArgument() {
    const argument = document.getElementById('argument').value;
    const logicType = document.getElementById('logicType').value;
    socket.emit('sendArgument', { roomId: currentRoomId, argument, logicType });
    document.getElementById('argument').value = '';
}

socket.on('roomCreated', (roomId) => {
    alert(`Room berhasil dibuat dengan ID: ${roomId}`);
    currentRoomId = roomId;
    document.getElementById('createRoomDiv').style.display = 'none';
    document.getElementById('roomArea').style.display = 'block';
    document.getElementById('roomInfo').innerText = `Room ID: ${roomId}`;
});

socket.on('joinedRoom', (roomData) => {
    document.getElementById('joinRoomDiv').style.display = 'none';
    document.getElementById('roomArea').style.display = 'block';
    document.getElementById('roomInfo').innerText = `Room ID: ${currentRoomId}`;
    document.getElementById('participantsList').innerText = `Peserta: ${roomData.participants.join(', ')}`;
});

socket.on('participantsUpdate', (participants) => {
    document.getElementById('participantsList').innerText = `Peserta: ${participants.join(', ')}`;
});

socket.on('newArgument', ({ argument, logicType }) => {
    const div = document.getElementById('argumenArea');
    div.innerHTML = `
        <p>Argumen: ${argument} (${logicType})</p>
        <button onclick="vote('agree', '${argument}')">Setuju</button>
        <button onclick="vote('disagree', '${argument}')">Tidak Setuju</button>
    `;
});

function vote(choice, argument) {
    socket.emit('vote', { roomId: currentRoomId, argument, choice });
}

socket.on('voteUpdate', (voteData) => {
    const total = voteData.agree + voteData.disagree;
    const agreePct = ((voteData.agree / total) * 100).toFixed(2);
    document.getElementById('argumenArea').innerHTML += `<p>✅ Setuju: ${agreePct}%</p>`;
});

socket.on('errorMsg', (msg) => {
    alert(msg);
});
