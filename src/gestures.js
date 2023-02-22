const { GestureDescription, Finger, FingerCurl } = window.fp

const pointerGesture = new GestureDescription('pointer') // 👆
const doublePointerGesture = new GestureDescription('doublePointer') // ✌️
const paperGesture = new GestureDescription('paper') // 🖐

// Paper
// -----------------------------------------------------------------------------

// no finger should be curled
for (let finger of Finger.all) {
	paperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0)
}

// Pointer
//------------------------------------------------------------------------------

// index and middle finger: stretched out
pointerGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0)

pointerGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0)

// ring: curled
pointerGesture.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0)
pointerGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.9)

// ring: curled
pointerGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0)
pointerGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9)

// pinky: curled
pointerGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0)
pointerGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9)

// DoublePointer
//------------------------------------------------------------------------------

// index and middle finger: stretched out
doublePointerGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0)

doublePointerGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0)

// ring: curled
doublePointerGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0)

// ring: curled
doublePointerGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0)
doublePointerGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9)

// pinky: curled
doublePointerGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0)
doublePointerGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9)

const gestures = [pointerGesture, doublePointerGesture, paperGesture]

export { gestures }
