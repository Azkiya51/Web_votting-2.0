const socket = io();
let currentRoomId = '';
let participantName = '';

function showCreate() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('createRoom').classList.remove('hidden');
}

function showJoin() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('joinRoom').classList.remove('hidden');
}

function createRoom() {
    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);
}

function joinRoom() {
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

// Voting (peserta)
function vote(choice, argument) {
    socket.emit('vote', { roomId: currentRoomId, argument, choice });
}

function showResults() {
    document.getElementById('results').classList.remove('hidden');
}

socket.on('roomCreated', (roomId) => {
    alert(`Room berhasil dibuat dengan ID: ${roomId}`);
    currentRoomId = roomId;
    document.getElementById('createRoom').classList.add('hidden');
    document.getElementById('roomArea').classList.remove('hidden');
    document.getElementById('adminRoom').classList.remove('hidden');
    document.getElementById('roomInfo').innerText = `Room ID: ${roomId}`;
});

socket.on('joinedRoom', (roomData) => {
    document.getElementById('joinRoom').classList.add('hidden');
    document.getElementById('roomArea').classList.remove('hidden');
    document.getElementById('participantRoom').classList.remove('hidden');
    document.getElementById('roomInfo').innerText = `Room ID: ${currentRoomId}`;
    document.getElementById('participantsList').innerText = `Peserta: ${roomData.participants.join(', ')}`;
});

socket.on('participantsUpdate', (participants) => {
    document.getElementById('participantsList').innerText = `Peserta: ${participants.join(', ')}`;
});

socket.on('newArgument', ({ argument, logicType }) => {
    const safeArg = encodeURIComponent(argument); 
    const div = document.getElementById('argumentDisplay');
    div.innerHTML = `
        <p><strong>Argumen:</strong> ${argument} <em>(${logicType})</em></p>
        <button onclick="vote('agree', '${safeArg}')">✅ Setuju</button>
        <button onclick="vote('disagree', '${safeArg}')">❌ Tidak Setuju</button>
    `;
});


socket.on('voteUpdate', (voteData) => {
    const total = voteData.agree + voteData.disagree;
    const agreePct = ((voteData.agree / total) * 100).toFixed(2);
    const disagreePct = (100 - agreePct).toFixed(2);
    document.getElementById('resultsDisplay').innerHTML = `
        <p>✅ Setuju: ${agreePct}%</p>
        <p>❌ Tidak Setuju: ${disagreePct}%</p>
    `;
});

socket.on('errorMsg', (msg) => {
    alert(msg);
});
