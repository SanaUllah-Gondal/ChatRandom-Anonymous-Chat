// After pairing
const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
pc.onicecandidate = e => socket.emit('ice-candidate', e.candidate);
pc.ontrack = e => videoElement.srcObject = e.streams[0];

// Offerer
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
socket.emit('offer', offer);