import { gestures } from './gestures.js'

const config = {
	video: { width: 640, height: 480, fps: 30 },
}

const landmarkColors = {
	thumb: 'red',
	index: 'blue',
	middle: 'yellow',
	ring: 'green',
	pinky: 'pink',
	wrist: 'white',
}

const gestureStrings = {
	pointer: '👆',
	doublePointer: '✌️',
	paper: '🖐',
}

async function createDetector() {
	return window.handPoseDetection.createDetector(
		window.handPoseDetection.SupportedModels.MediaPipeHands,
		{
			runtime: 'mediapipe',
			modelType: 'full',
			maxHands: 2,
			solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
		}
	)
}

async function main() {
	const video = document.querySelector('#pose-video')
	const canvas = document.querySelector('#pose-canvas')
	const ctx = canvas.getContext('2d')
	const cursor = document.getElementById('cursor')

	const drawCanvas = document.getElementById('draw-canvas')
	const rect = drawCanvas.getBoundingClientRect()
	console.log(rect)
	drawCanvas.style.width = '640px'
	drawCanvas.style.height = '480px'
	drawCanvas.style.backgroundColor = 'lightgreen'
	const ctxDraw = drawCanvas.getContext('2d')

	const resultLayer = {
		right: document.querySelector('#pose-result-right'),
		left: document.querySelector('#pose-result-left'),
	}
	const knownGestures = [...gestures]
	const GE = new fp.GestureEstimator(knownGestures)
	// load handpose model
	const detector = await createDetector()
	console.log('mediaPose model loaded')

	// main estimation loop
	const estimateHands = async () => {
		// clear canvas overlay
		ctx.clearRect(0, 0, config.video.width, config.video.height)
		resultLayer.right.innerText = ''
		resultLayer.left.innerText = ''

		// get hand landmarks from video
		const hands = await detector.estimateHands(video, {
			flipHorizontal: true,
		})

		for (const hand of hands) {
			for (const keypoint of hand.keypoints) {
				const name = keypoint.name.split('_')[0].toString().toLowerCase()
				const color = landmarkColors[name]
				drawPoint(ctx, keypoint.x, keypoint.y, 3, color)
			}

			const keypoints3D = hand.keypoints3D.map(keypoint => [
				keypoint.x,
				keypoint.y,
				keypoint.z,
			])
			const prediction = GE.estimate(keypoints3D, 8.5)
			if (prediction.gestures.length === 0) {
				updateDebugInfo(prediction.poseData, 'left')
			}

			let positionX = hand.keypoints[8].x
			let positionY = hand.keypoints[8].y

			cursor.style.left =
				(positionX * window.innerWidth) / config.video.width + 'px'
			cursor.style.top =
				(positionY * window.innerHeight) / config.video.height + 'px'

			if (!prediction.gestures.length) continue

			// find gesture with highest match score
			const result = prediction.gestures.reduce((p, c) =>
				p.score > c.score ? p : c
			)
			const found = gestureStrings[result.name]
			const chosenHand = hand.handedness.toLowerCase()

			switch (found) {
				case gestureStrings.pointer:
					drawLine(ctxDraw, positionX, positionY)
					break

				case gestureStrings.doublePointer:
					break

				case gestureStrings.paper:
					ctxDraw.clearRect(0, 0, 640, 480)
			}

			updateDebugInfo(prediction.poseData, chosenHand)

			resultLayer[chosenHand].innerText = found
		}
		// ...and so on
		setTimeout(() => {
			estimateHands()
		}, 10 / config.video.fps)
	}

	estimateHands()
	console.log('Starting predictions')
}

async function initCamera(width, height, fps) {
	const constraints = {
		audio: false,
		video: {
			facingMode: 'user',
			width: width,
			height: height,
			frameRate: { max: fps },
		},
	}

	const video = document.querySelector('#pose-video')
	video.width = width
	video.height = height

	// get video stream
	const stream = await navigator.mediaDevices.getUserMedia(constraints)
	video.srcObject = stream

	return new Promise(resolve => {
		video.onloadedmetadata = () => {
			resolve(video)
		}
	})
}

function drawPoint(ctx, x, y, r, color) {
	ctx.beginPath()
	ctx.arc(x, y, r, 0, 2 * Math.PI)
	ctx.fillStyle = color
	ctx.fill()
}

function drawLine(ctxDraw, positionX, positionY) {
	ctxDraw.beginPath()
	ctxDraw.arc(positionX / 2, positionY / 4, 3, 0, 2 * Math.PI)
	ctxDraw.fill()
}

function updateDebugInfo(data, hand) {
	const summaryTable = `#summary-${hand}`
	for (let fingerIdx in data) {
		document.querySelector(`${summaryTable} span#curl-${fingerIdx}`).innerHTML =
			data[fingerIdx][1]
		document.querySelector(`${summaryTable} span#dir-${fingerIdx}`).innerHTML =
			data[fingerIdx][2]
	}
}

window.addEventListener('DOMContentLoaded', () => {
	initCamera(config.video.width, config.video.height, config.video.fps).then(
		video => {
			video.play()
			video.addEventListener('loadeddata', event => {
				console.log('Camera is ready')
				main()
			})
		}
	)

	const canvas = document.querySelector('#pose-canvas')
	canvas.width = config.video.width
	canvas.height = config.video.height
	console.log('Canvas initialized')
})
