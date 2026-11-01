// press-record: wraps a song (mp3, m4a, wav…) in an .mp4 with a single still frame,
// so Papa's Record Room can store it (the store accepts video, not audio-only files).
// Usage: swift press-record.swift <input audio> <output.mp4>
import AVFoundation
import CoreVideo

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: press-record <input> <output.mp4>"); exit(2) }
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: outURL)

let asset = AVURLAsset(url: inURL)
let sem = DispatchSemaphore(value: 0)
var audioTrack: AVAssetTrack?
var duration = CMTime.zero
Task {
  audioTrack = try? await asset.loadTracks(withMediaType: .audio).first
  duration = (try? await asset.load(.duration)) ?? .zero
  sem.signal()
}
sem.wait()
guard let track = audioTrack else { print("no audio in \(args[1])"); exit(1) }

let reader = try AVAssetReader(asset: asset)
let rOut = AVAssetReaderTrackOutput(track: track, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
reader.add(rOut)

let writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)
let side = 64
let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: side, AVVideoHeightKey: side,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 20_000]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: vIn, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: side, kCVPixelBufferHeightKey as String: side])
let aIn = AVAssetWriterInput(mediaType: .audio, outputSettings: [
  AVFormatIDKey: kAudioFormatMPEG4AAC, AVNumberOfChannelsKey: 2, AVSampleRateKey: 44100, AVEncoderBitRateKey: 192_000])
aIn.expectsMediaDataInRealTime = false
writer.add(vIn); writer.add(aIn)

guard reader.startReading(), writer.startWriting() else { print("start failed: \(writer.error?.localizedDescription ?? reader.error?.localizedDescription ?? "?")"); exit(1) }
writer.startSession(atSourceTime: .zero)

// A brass-coloured frame at the start and the end of the song.
func frame() -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  CVPixelBufferLockBaseAddress(pb!, [])
  let base = CVPixelBufferGetBaseAddress(pb!)!.assumingMemoryBound(to: UInt8.self)
  for i in 0..<(CVPixelBufferGetBytesPerRow(pb!) * side / 4) { base[i*4] = 0x5a; base[i*4+1] = 0xa8; base[i*4+2] = 0xd6; base[i*4+3] = 0xff }
  CVPixelBufferUnlockBaseAddress(pb!, [])
  return pb!
}
let end = duration.isValid && duration > .zero ? duration : CMTime(seconds: 1, preferredTimescale: 600)
for t in [CMTime.zero, CMTimeSubtract(end, CMTime(value: 1, timescale: 30))] {
  while !vIn.isReadyForMoreMediaData { usleep(1000) }
  adaptor.append(frame(), withPresentationTime: t)
}
vIn.markAsFinished()

while let buf = rOut.copyNextSampleBuffer() {
  while !aIn.isReadyForMoreMediaData { usleep(1000) }
  aIn.append(buf)
}
aIn.markAsFinished()
writer.finishWriting { sem.signal() }
sem.wait()
if writer.status == .completed {
  let size = (try? FileManager.default.attributesOfItem(atPath: outURL.path)[.size] as? Int) ?? 0
  print(String(format: "pressed %@ (%.1f MB, %d:%02d)", outURL.lastPathComponent, Double(size) / 1_048_576, Int(end.seconds) / 60, Int(end.seconds) % 60))
} else { print("failed: \(writer.error?.localizedDescription ?? "?")"); exit(1) }
