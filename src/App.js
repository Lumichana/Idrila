import React, { createContext, useEffect, useState, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import { listMusicFiles } from "./utilities/music";
import { Button, Table } from "antd";
import { HistoryOutlined } from "@ant-design/icons";

export const AppConfig = createContext(undefined);

function App() {
    const audioPlayerRef = useRef(null);
    const tableRef = useRef(null);
    const [musicList, setMusicList] = useState([]);
    const [albums, _albums] = useState([]);
    const [currentPlaying, setCurrentPlaying] = useState();
    const [curp, _curp] = useState("");
    const [playMode, setPlayMode] = useState("random");
    const [playHistory, setPlayHistory] = useState([]);

    useEffect(() => {
        // Fetch and set the music list on startup
        listMusicFiles("X:\\Idrila\\Music")
            .then((musicList) => {
                setMusicList(musicList.songs);
                _albums(musicList.albums);
            })
            .catch((error) => console.error("Error fetching music list:", error));
    }, []);

    const playMusic = (song) => {
        // Update playHistory
        addToHistory(song);
        _curp(song.key);

        setCurrentPlaying(song.filePath);
    };

    const scrollToSong = () => {
        tableRef.current.scrollTo({ key: curp });
    };

    const addToHistory = (song) => {
        setPlayHistory((ps) => {
            const updatedHistory = ps.filter((s) => s.key !== song.key);
            updatedHistory.push(song);
            return [...updatedHistory];
        });
    };

    const removeLastFromHistory = () => {
        setPlayHistory((ps) => {
            ps.pop();
            return [...ps];
        });
    };

    useEffect(() => {
        console.log(playHistory);
    }, [playHistory]);

    const enableGetPrevious = () => playHistory.length > 1;

    const onPrevious = () => {
        const song = playHistory[playHistory.length - 2];
        removeLastFromHistory();
        playMusic(song);
    };

    const onNext = () => {
        switch (playMode) {
            case "one":
                audioPlayerRef.current.replay();
                break;
            case "random":
                let history;
                if (playHistory.length === musicList.length) {
                    history = playHistory.slice(Math.floor(playHistory.length / 3));
                    setPlayHistory(history);
                } else {
                    history = playHistory;
                }
                let remainingSongs = musicList.filter((song) => history.findIndex((s) => s.key === song.key) === -1);
                const randomIndex = Math.floor(Math.random() * remainingSongs.length);
                playMusic(remainingSongs[randomIndex]);
                break;
            case "loop":
                // For 'loop' mode, loop back to the first song when reaching the end
                playMusic(musicList[(musicList.findIndex((song) => song.key === curp) + 1) % musicList.length]);
                break;
            default:
                break;
        }
    };

    const handlePlayModeChange = (mode) => {
        setPlayMode(mode);
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Artist",
            dataIndex: "artist",
            key: "artist",
            ellipsis: true,
        },
        {
            title: "Album",
            dataIndex: "album",
            key: "album",
            ellipsis: true,
            render: (i) => albums[i].album,
        },
    ];

    return (
        <AppConfig.Provider value={{ playMusic }}>
            <div className="App">
                <AudioPlayer ref={audioPlayerRef} src={currentPlaying} onNext={onNext} />

                <div>
                    <label>Play Mode:</label>
                    <select value={playMode} onChange={(e) => handlePlayModeChange(e.target.value)}>
                        <option value="one">Repeat One</option>
                        <option value="random">Random</option>
                        <option value="loop">Loop</option>
                    </select>
                </div>
                <div>
                    <Button disabled={!enableGetPrevious()} onClick={onPrevious}>
                        Previous
                    </Button>
                    <button onClick={onNext}>Next</button>
                </div>
                <Table
                    ref={tableRef}
                    columns={columns}
                    dataSource={musicList}
                    size="small"
                    pagination={false}
                    scroll={{ y: 500 }}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => playMusic(record),
                        };
                    }}
                    rowSelection={{
                        type: "radio",
                        selectedRowKeys: [curp],
                        renderCell: () => <></>,
                    }}
                />
            </div>
        </AppConfig.Provider>
    );
}

export default App;
