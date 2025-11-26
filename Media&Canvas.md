# 1. MediaStream API

负责采集

- 摄像头
- 麦克风
- 屏幕

返回 MediaStream 对象，一个媒体流对象可以包含多个轨道 MediaStreamTrack ，例如摄像头轨道、麦克风轨道，一般是不需要开销性能去拼接，但是在例如合成到一张 Canvas 的时候需要

# 2. WebRTC

负责处理媒体流

**WebRTC 会分别处理每条轨道**

- 编码 / 压缩
- 网络传输（强实时，低延迟）
- 解码渲染

# 3. Media Source Extensions

负责处理媒体资源视频：

- 自定义流式拉取、缓冲、拼接

# 视频会议通话 - WebRTC

像 Zoom，腾讯视频，Google Meet，飞书都在用 **WebRTC**

## 核心流程

1. 采集媒体流：**getUserMedia**
2. 建立 RTC PeerConnection
3. 将 track 添加到 peerConnection : pc.addTrack(track,stream)
4. 编码、打包、传输
5. 对端接收流并进行渲染: <video srcObject = remoteStream>

# 云游戏 / 远程桌面 - 浏览器端实时播放

1. 服务器端编码
2. 前端接受 RTP ，解码后得到 <video>
3. 用户操作通过 **RTC DataChannel** 发送**事件**

# 录屏（七牛）、直播推流

例如直播间、H5录屏等

## getDisplayMedia + WebRTC ( + Canvas )

```tsx
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
});

// 1. 在页面中播放
video.srcObject = stream;

// 2. 录制
const recorder = new MediaRecorder(stream);
recorder.ondataavailable = e => { /* 上传或保存 */ };
```

# 音频处理

## Web Audio API

# 性能问题

## 解码、渲染：浏览器GPU

## 合成Canvas : CPU

# Canvas = <canvas>元素 + 渲染上下文(2D / WebGL)

在媒体流中常通过 Canvas 对多个轨道进行合成

## 1. Canvas 2D

```tsx
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
```

逐帧绘图

常用于直播、录屏

## 2. Canvas WebGL

```tsx
const gl = canvas.getContext('webgl');
```

GPU加速提高性能