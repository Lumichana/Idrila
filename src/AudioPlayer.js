import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";

const AudioPlayer = forwardRef(({ src, onNext }, ref) => {
    const [audio] = useState(new Audio());
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);  
    const [tone, setTone] = useState(1); // Added tone state
    const [scale, setScale] = useState(1); // Added scale state

    const [playbackRate, setPlaybackRate] = useState(1);
    useEffect(() => {
        if (src) {
            audio.src = src;
            audio.playbackRate = playbackRate;
            // Event listeners
            const updateTime = () => setCurrentTime(audio.currentTime);
            const updateDuration = () => setDuration(audio.duration);

            audio.addEventListener("timeupdate", updateTime);
            audio.addEventListener("loadedmetadata", updateDuration);

            audio.play();

            // Cleanup event listeners when component unmounts
            return () => {
                audio.removeEventListener("timeupdate", updateTime);
                audio.removeEventListener("loadedmetadata", updateDuration);
            };
        }
    }, [audio, src]);

    useEffect(() => {
        const handleEnded = () => {
            // Call onNext when the song finishes playing
            if (onNext) onNext();
        };

        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [onNext]);

    const play = (newTimeSpan) => {
        if (newTimeSpan) audio.currentTime = newTimeSpan;
        audio.play();
    };

    const replay = () => {
        setCurrentTime(0);
        play();
    };

    const pause = () => {
        audio.pause();
    };

    const setVolumeLevel = (newVolume) => {
        setVolume(newVolume);
        audio.volume = newVolume;
    };

    const handleTimestampChange = (e) => {
        const newTimestamp = parseFloat(e.target.value);
        play(newTimestamp);
    };

    const info = () => {
        return { currentTime, duration };
    };
    useEffect(() => {
        if (playbackRate !== audio.playbackRate) {
            audio.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // Use useImperativeHandle to expose functions to the parent component
    useImperativeHandle(ref, () => ({
        play,
        pause,
        setVolumeLevel,
        info,
        replay,
        handleTimestampChange,
    }));
    const handleSpeedChange = (e) => {
        const newSpeed = parseFloat(e.target.value);
        setPlaybackRate(newSpeed);
    };

    return (
        <div>
            <button onClick={() => play()}>Play</button>
            <button onClick={() => pause()}>Pause</button>
            <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
            />
            <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleTimestampChange}
            />
            <input type="range" min={0.5} max={2} step={0.05} value={playbackRate} onChange={handleSpeedChange} />
            <div>{playbackRate}</div>
            <div>
                <p>Current Time: {currentTime}</p>
                <p>Total Time: {duration}</p>
            </div>
        </div>
    );
});

export default AudioPlayer;
