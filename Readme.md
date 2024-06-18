# iMeet

**iMeet** is a modern web-based application designed for seamless video meetings and chat. It leverages WebRTC technology to facilitate direct peer-to-peer communication, supported by robust STUN and TURN servers to ensure connectivity across various network environments.

## Features

- **Video Meetings**: Host or join video meetings with ease.
- **Real-time Chat**: Exchange messages in real-time during meetings.
- **Media Permissions**: Request and manage permissions for camera and microphone access.
- **STUN/TURN Integration**: Enhanced connectivity through custom and fallback STUN/TURN servers.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**
- **npm** (Node Package Manager)

### Clone the Repository

```bash
git clone https://github.com/Abhay-Vachhani/iMeet.git
cd iMeet
```

### Install Dependencies

```bash
npm install
```

### Start the Application

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000` to start using iMeet.

### Usage

### Hosting a Meeting

1. Navigate to `http://localhost:3000/host`.
2. Enter a unique meeting ID in the input field.
3. Allow access to your camera and microphone.
4. Click the **Host** button.
5. Share the meeting ID with participants.

### Joining a Meeting

1. Navigate to `http://localhost:3000/client`.
2. Enter the provided meeting ID in the input field.
3. Allow access to your camera and microphone if prompted.
4. Click the **Join** button.

### Sending Messages

1. Type your message in the text input at the bottom of the chat section.
2. Press **Enter** or click the **Send** button to send your message.


## Configuration

### ICE Server Configuration

iMeet uses a combination of custom and Google's public STUN/TURN servers to ensure reliable connectivity. Below is the ICE server configuration used by the application:

```javascript
const iceServers = [
	{
		urls: 'stun:stun.l.google.com:19302'
	},
	{
		urls: 'stun:stun1.l.google.com:19302'
	},
	{
		urls: 'stun:stun2.l.google.com:19302'
	},
	{
		urls: 'stun:stun3.l.google.com:19302'
	},
	{
		urls: 'stun:stun4.l.google.com:19302'
	}
]
```

This configuration is used in the `RTCPeerConnection` setup to manage peer connections.

### Key Libraries

- **React**: For building the user interface.
- **Socket.IO**: For real-time bidirectional event-based communication.
- **peer-webrtc**: A custom wrapper around WebRTC for managing peer connections.

## License

iMeet is open-source software licensed under the [MIT License](License). You are free to use, modify, and distribute this software, provided the original license terms are adhered to.

---

For further assistance or contribution to the project, please visit our [GitHub repository](https://github.com/Abhay-Vachhani/iMeet) and check the contribution guidelines.

Thank you for using iMeet! We hope it enhances your remote communication experiences.