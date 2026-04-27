import React, { useRef, useState, useCallback, useEffect } from 'react';
import bgVideo1 from '../assets/final-bg-1.mp4';
import bgVideo2 from '../assets/final-bg-2.mp4';
import bgVideo3 from '../assets/final-bg-3.mp4';
import bgVideo4 from '../assets/final-bg-4.mp4';

// Sequence: bg1 → bg3 → bg4 → bg2 → (repeat)
const videos = [bgVideo1, bgVideo3, bgVideo4, bgVideo2];
const CROSSFADE_DURATION = 1.5; // seconds — fade starts this long before the video ends

const VideoBackground = ({ children }) => {
    const videoRefA = useRef(null);
    const videoRefB = useRef(null);
    const [showA, setShowA] = useState(true);
    const activeIndexRef = useRef(0);
    const isFadingRef = useRef(false); // prevents double-triggering

    // Initialise both players on mount
    useEffect(() => {
        const a = videoRefA.current;
        const b = videoRefB.current;
        if (a) {
            a.src = videos[0];
            a.load();
            a.play().catch(() => { });
        }
        // Pre-load the second video so it's ready instantly
        if (b) {
            b.src = videos[1];
            b.load();
        }
    }, []);

    // Start the crossfade BEFORE the current video ends
    const handleTimeUpdate = useCallback((e) => {
        const video = e.target;
        if (!video.duration || isFadingRef.current) return;

        const remaining = video.duration - video.currentTime;

        if (remaining <= CROSSFADE_DURATION) {
            isFadingRef.current = true;

            const nextIdx = (activeIndexRef.current + 1) % videos.length;
            const incomingRef = showA ? videoRefB : videoRefA;

            // Start playing the incoming video underneath so it's already rolling
            if (incomingRef.current) {
                incomingRef.current.currentTime = 0;
                incomingRef.current.play().catch(() => { });
            }

            // Toggle opacity — CSS transition handles the smooth blend
            setShowA((prev) => !prev);
            activeIndexRef.current = nextIdx;
        }
    }, [showA]);

    // When the now-hidden video fully ends, pre-load the next clip and reset the fading flag
    const handleEnded = useCallback(() => {
        isFadingRef.current = false;

        const nextIdx = (activeIndexRef.current + 1) % videos.length;
        const hiddenRef = showA ? videoRefB : videoRefA; // after the toggle, the old player is hidden

        if (hiddenRef.current) {
            hiddenRef.current.src = videos[nextIdx];
            hiddenRef.current.load();
        }
    }, [showA]);

    const videoBaseStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: `opacity ${CROSSFADE_DURATION}s ease-in-out`,
        zIndex: 0,
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Video A */}
            <video
                ref={videoRefA}
                muted
                playsInline
                onTimeUpdate={showA ? handleTimeUpdate : undefined}
                onEnded={!showA ? handleEnded : undefined}
                style={{
                    ...videoBaseStyle,
                    opacity: showA ? 1 : 0,
                }}
            />

            {/* Video B */}
            <video
                ref={videoRefB}
                muted
                playsInline
                onTimeUpdate={!showA ? handleTimeUpdate : undefined}
                onEnded={showA ? handleEnded : undefined}
                style={{
                    ...videoBaseStyle,
                    opacity: showA ? 0 : 1,
                }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-navy-dark/80 to-black/85 backdrop-blur-[2px]" style={{ zIndex: 1 }}></div>

            {/* Page Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {children}
            </div>
        </div>
    );
};

export default VideoBackground;
