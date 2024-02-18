import { Button, ConfigProvider, Popover, Slider } from "antd";
import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Icon from "@ant-design/icons";
import Icons from "./Components/Icons/Icons";
import { PlayMode } from "./enum";
const AudioPlayer = forwardRef(
    ({ src, onNext, onPrevious, enableOnNext, enableOnPrevious, playMode, onPlayModeChange }, ref) => {
        const [audio] = useState(new Audio());
        const [currentTime, setCurrentTime] = useState(0);
        const [duration, setDuration] = useState(0);
        const [volume, setVolume] = useState(1);
        const [isPlaying, _isPlaying] = useState(false);

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
                _isPlaying(true);

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
            _isPlaying(true);
            audio.play();
        };

        const replay = () => {
            setCurrentTime(0);
            _isPlaying(true);
            play();
        };

        const pause = () => {
            _isPlaying(false);
            audio.pause();
        };

        const setVolumeLevel = (newVolume) => {
            setVolume(newVolume);
            audio.volume = newVolume;
        };

        const handleTimestampChange = (v) => {
            const newTimestamp = parseFloat(v);
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
        const handleSpeedChange = (v) => {
            const newSpeed = parseFloat(v);
            setPlaybackRate(newSpeed);
        };

        return (
            <>
                <Slider
                    className="Timestamp"
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={handleTimestampChange}
                />
                <ConfigProvider>
                    <div className="AudioPlayer">
                        <div>
                            <Button icon={<Icons.PicInPic />} shape="circle" type="link" />
                            <Button
                                icon={
                                    playMode === PlayMode.RepeatOne ? (
                                        <Icons.RepeatOne />
                                    ) : playMode === PlayMode.Loop ? (
                                        <Icons.Repeat />
                                    ) : (
                                        <Icons.Shuffle />
                                    )
                                }
                                shape="circle"
                                type="link"
                                onClick={onPlayModeChange}
                            />
                        </div>
                        <div style={{ gap: 3 }}>
                            <Button
                                icon={<Icons.SkipBack />}
                                shape="circle"
                                type="link"
                                disabled={!enableOnPrevious}
                                onClick={onPrevious}
                            />
                            <Button
                                icon={isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                shape="circle"
                                type="link"
                                onClick={isPlaying ? () => pause() : () => play()}
                            />
                            <Button
                                icon={<Icons.SkipForward />}
                                type="link"
                                shape="circle"
                                disabled={!enableOnNext}
                                onClick={onNext}
                            />
                        </div>

                        <div>
                            <Popover
                                content={
                                    <Slider
                                        vertical
                                        style={{ height: 100 }}
                                        min={0.5}
                                        max={2}
                                        step={0.01}
                                        value={playbackRate}
                                        onChange={handleSpeedChange}
                                    />
                                }
                                trigger="hover"
                            >
                                <Button icon={<Icons.Speed />} type="link" shape="circle" />
                            </Popover>
                            <Popover
                                content={
                                    <Slider
                                        vertical
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={volume}
                                        style={{ height: 100 }}
                                        onChange={(v) => setVolumeLevel(parseFloat(v))}
                                    />
                                }
                                trigger="hover"
                            >
                                <Button
                                    icon={
                                        volume === 0 ? (
                                            <Icons.Mute />
                                        ) : volume <= 0.5 ? (
                                            <Icons.VolumeDown />
                                        ) : (
                                            <Icons.VolumeUp />
                                        )
                                    }
                                    type="link"
                                    shape="circle"
                                />
                            </Popover>
                        </div>

                        {/* <Slider
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(v) => setVolumeLevel(parseFloat(v))}
        /> */}
                        {/* <button onClick={() => play()}>Play</button>
        <button onClick={() => pause()}>Pause</button>
        <Slider
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleTimestampChange}
        />
        <input type="range"  />
        <div>{playbackRate}</div>
        <div>
            <p>Current Time: {currentTime}</p>
            <p>Total Time: {duration}</p>
        </div> */}
                    </div>
                </ConfigProvider>
            </>
        );
    }
);

export default AudioPlayer;
