import React, { useEffect, useRef, useState } from 'react';

interface VideoCallModalProps {
    stream: MediaStream | null;
    remoteStream: MediaStream | null;
    onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ stream, remoteStream, onClose }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && stream) localVideoRef.current.srcObject = stream;
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [stream, remoteStream]);

    return (
        <div className="video-modal-overlay">
            <div className="video-container">
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                <button onClick={onClose} className="end-call-btn">Kết thúc</button>
            </div>
        </div>
    );
};