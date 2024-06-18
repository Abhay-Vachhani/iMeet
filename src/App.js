import PeerWebRTC from 'peer-webrtc'
import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const App = () => {
	const SOCKET_SERVER = 'http://localhost:8000'

	const meetingIdRef = useRef()
	const yourVideoRef = useRef()
	const peerVideoRef = useRef()
	const messageInputRef = useRef()
	const streamRef = useRef()
	const peer = useRef()

	const [messages, setMessages] = useState([])
	const [isConnected, setIsConnected] = useState(false)
	const [devices, setDevices] = useState({
		video: false,
		audio: false,
	})

	useEffect(() => {
		(async () => {
			try {
				streamRef.current = await navigator.mediaDevices.getUserMedia({ video: devices.video, audio: devices.audio })
				yourVideoRef.current.srcObject = streamRef.current
				yourVideoRef.current.play()
			} catch { }
		})()
	}, [devices])

	const user = window.location.pathname.replace('/', '')
	const isHost = window.location.pathname.replace('/', '') == 'host' // name of the host

	const iceServers = [
		// Using a STUN server helps discover the public IP addresses of the peers
		// and facilitates NAT traversal, allowing direct communication if possible.

		// TURN servers relay media traffic when direct peer-to-peer connections 
		// cannot be established due to NAT or firewall restrictions. These are critical 
		// for ensuring reliable connections across various network configurations.

		// Including Google's public STUN servers provides a reliable fallback.
		// These servers are widely used and help ensure that at least STUN services
		// are available if custom servers are not reachable or fail.
		{
			urls: 'stun:stun.l.google.com:19302' // Google's primary STUN server.
		},
		{
			urls: 'stun:stun1.l.google.com:19302' // Additional Google STUN server for redundancy.
		},
		{
			urls: 'stun:stun2.l.google.com:19302' // Additional Google STUN server for redundancy.
		},
		{
			urls: 'stun:stun3.l.google.com:19302' // Additional Google STUN server for redundancy.
		},
		{
			urls: 'stun:stun4.l.google.com:19302' // Additional Google STUN server for redundancy.
		}
	]

	const hostMeeting = () => {
		const meetingId = meetingIdRef.current.value
		const socket = new io(SOCKET_SERVER)

		socket.on('connect', async () => {
			console.log("🚀 ~ socket: connected")

			socket.on('error', ({ msg }) => {
				console.log("🚀 ~ socket: error", msg)
				alert(msg)
			})

			socket.emit('set-meeting-info', {
				meetingId,
				user,
			})

			peer.current = new PeerWebRTC(true, streamRef.current, {
				iceServers: iceServers,
				iceTransportPolicy: 'all'
			})

			peer.current.onConnect(() => {
				console.log("🚀 ~ peer: connected")
				setIsConnected(true)
			})

			peer.current.onDisconnect(() => {
				console.log("🚀 ~ peer: disconnected")
				setIsConnected(false)
			})

			peer.current.onSignal((sdp) => {
				console.log("🚀 ~ peer: onSignal")
				socket.emit('set-host-sdp', { meetingId: meetingId, sdp })
			})

			peer.current.onIceCandidate((candidate) => {
				console.log("🚀 ~ peer: onIceCandidate")
				socket.emit('set-host-candidate', { meetingId: meetingId, candidate })
			})

			socket.on('guest-sdp', (sdp) => {
				console.log("🚀 ~ socket: guest-sdp")
				peer.current.signal(sdp)
			})

			socket.on('guest-candidate', (candidate) => {
				console.log("🚀 ~ socket: guest-candidate")
				peer.current.addIceCandidate(candidate)
			})

			peer.current.onData((data) => {
				console.log("🚀 ~ peer: onData", data)
				setMessages(preMessages => [...preMessages, { type: 'reply', data }])
			})

			peer.current.onStream((stream) => {
				console.log("🚀 ~ peer: onStream")
				try {
					peerVideoRef.current.srcObject = stream
					peerVideoRef.current.play()
				} catch {

				}
			})
		})
	}

	const joinMeeting = () => {
		const meetingId = meetingIdRef.current.value
		const socket = new io(SOCKET_SERVER)

		socket.on('connect', () => {
			console.log("🚀 ~ socket: connected")

			socket.on('error', ({ msg }) => {
				console.log("🚀 ~ socket: error", msg)
				alert(msg)
			})

			socket.emit('get-meeting-info', {
				meetingId,
				user
			})

			peer.current = new PeerWebRTC(false, streamRef.current, {
				iceServers: iceServers,
				iceTransportPolicy: 'all'
			})

			peer.current.onConnect(() => {
				console.log("🚀 ~ peer: connected")
				setIsConnected(true)
			})

			socket.on('meeting-info', ({ meetingId, host, hostSDP, hostCandidates }) => {
				console.log("🚀 ~ socket.on ~ meeting-info:", { meetingId, host, hostSDP })

				if (hostSDP)
					peer.current.signal(hostSDP)

				if (hostCandidates)
					hostCandidates.forEach(candidate => {
						peer.current.addIceCandidate(candidate)
					});
			})

			peer.current.onSignal((sdp) => {
				console.log("🚀 ~ peer: onSignal")
				socket.emit('set-guest-sdp', { meetingId: meetingId, sdp })
			})

			peer.current.onData((data) => {
				console.log("🚀 ~ peer: onData", data)
				setMessages(preMessages => [...preMessages, { type: 'reply', data }])
			})

			peer.current.onStream((stream) => {
				console.log("🚀 ~ peer: onStream")
				try {
					peerVideoRef.current.srcObject = stream
					peerVideoRef.current.play()
				} catch {

				}
			})

			peer.current.onIceCandidate((candidate) => {
				console.log("🚀 ~ peer: onIceCandidate")
				socket.emit('set-guest-candidate', { meetingId: meetingId, candidate })
			})

			socket.on('host-candidate', (candidate) => {
				console.log("🚀 ~ socket: host-candidate")
				peer.current.addIceCandidate(candidate)
			})
		})
	}

	const sendMessage = (e) => {
		e.preventDefault()
		const message = messageInputRef.current.value

		peer.current.send(message)
		setMessages(preMessages => [...preMessages, { type: 'sender', data: message }])

		messageInputRef.current.value = ''
	}

	return (
		<div>
			User: {user}
			<br />
			<button onClick={async () => {
				try {
					await navigator.mediaDevices.getUserMedia({ video: true })
					setDevices({ ...devices, video: true })
				} catch {
					alert('Please provide camera permission')
				}
			}}>Camera</button>

			<button onClick={async () => {
				try {
					await navigator.mediaDevices.getUserMedia({ audio: true })
					setDevices({ ...devices, audio: true })
				} catch {
					alert('Please provide microphone permission')
				}
			}}>Microphone</button>

			<br />
			Camera {devices.video ? 'allowed' : 'not allowed'}
			<br />
			Microphone {devices.audio ? 'allowed' : 'not allowed'}
			<br />
			<input ref={meetingIdRef} type='text' />
			{
				isHost
					?
					<button onClick={hostMeeting}>Host</button>
					:
					<button onClick={joinMeeting}>Join</button>
			}

			<div hidden={!isConnected}>
				<h2>Messages</h2>
				<div style={{
					width: 600,
					height: 300,
					border: '1px solid',
					overflow: 'scroll'
				}}>
					{
						messages.map(({ type, data }, index) => (
							<div key={index} style={{
								textAlign: type == 'reply' ? 'start' : 'end',
								marginLeft: '8px',
								marginRight: '8px',
							}}>
								<p>{data}</p>
							</div>
						))
					}
				</div>

				<form style={{
					width: 600,
					border: '1px solid',
					display: 'flex'
				}} onSubmit={sendMessage}>
					<input type='text' ref={messageInputRef} style={{
						flex: 1
					}} autoFocus />
					<button>Send</button>
				</form>

			</div>
			<div>
				<div style={{
					display: 'flex'
				}}>
					<div>
						<h2 style={{ textAlign: 'center' }}>You</h2>
						<video style={{
							width: 300,
							height: 300,
							border: '1px solid'
						}} ref={yourVideoRef} muted>
						</video>
					</div>
					<div hidden={!isConnected}>
						<h2 style={{ textAlign: 'center' }}>{isHost ? 'Guest' : 'Host'}</h2>
						<video style={{
							width: 300,
							height: 300,
							border: '1px solid'
						}} ref={peerVideoRef}>
						</video>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App