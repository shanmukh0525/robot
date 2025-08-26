import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const STATIC_DIR = path.join(__dirname, '..', 'public')
app.use(express.static(STATIC_DIR))

// Health
app.get('/healthz', (_, res) => res.json({ ok: true }))

// ICE config endpoint (env STUN/TURN)
app.get('/ice-config', (_, res) => {
	const stun = process.env.STUN_SERVERS?.split(',').filter(Boolean) || [
		'stun:stun.l.google.com:19302',
		'stun:stun1.l.google.com:19302'
	]
	const turnUrl = process.env.TURN_URL
	const turnUser = process.env.TURN_USERNAME
	const turnPass = process.env.TURN_PASSWORD

	const iceServers = [...stun.map(url => ({ urls: url }))]
	if (turnUrl && turnUser && turnPass) {
		iceServers.push({ urls: turnUrl, username: turnUser, credential: turnPass })
	}
	res.json({ iceServers })
})

const server = http.createServer(app)
const io = new SocketIOServer(server, {
	cors: { origin: '*'},
})

io.on('connection', socket => {
	let joinedRoom = null

	socket.on('join', ({ room, role }) => {
		joinedRoom = room
		socket.join(room)
		socket.to(room).emit('peer-joined', { id: socket.id, role })
	})

	socket.on('disconnect', () => {
		if (joinedRoom) {
			socket.to(joinedRoom).emit('peer-left', { id: socket.id })
		}
	})

	// Relay signaling messages within room
	for (const event of ['offer', 'answer', 'candidate', 'ready']) {
		socket.on(event, payload => {
			if (!joinedRoom) return
			socket.to(joinedRoom).emit(event, { from: socket.id, ...payload })
		})
	}
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log(`Signaling server on http://localhost:${PORT}`)
	console.log(`Serving static from ${STATIC_DIR}`)
})