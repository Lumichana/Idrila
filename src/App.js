import React, { createContext, useEffect, useState, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import { listMusicFiles } from "./utilities/music";
import { Button, Table, Tabs, ConfigProvider, Layout } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import "./App.css";
import { PlayMode } from "./enum";

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
        listMusicFiles("C:\\Users\\hlin\\Documents\\Firefly\\Music")
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

    const onPlayModeChange = () => {
        if (playMode === PlayMode.Loop) {
            setPlayMode(PlayMode.RepeatOne);
        } else if (playMode === PlayMode.RepeatOne) {
            setPlayMode(PlayMode.Random);
        } else {
            setPlayMode(PlayMode.Loop);
        }
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
    const items = [
        {
            key: "Playlists",
            label: "Playlists",
        },
        {
            key: "Songs",
            label: "Songs",
        },
    ];
    //   const App = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
    return (
        <AppConfig.Provider value={{ playMusic }}>
            <ConfigProvider
                theme={{
                    components: {
                        Layout: {
                            headerBg: "#fff",
                            bodyBg: "#fff",
                            footerBg: "#fff",
                        },
                        Button: {
                            colorText: "#666666",
                        },
                        Tooltip: {
                            fontSize: 12,
                        },
                        Message: {
                            colorError: "red",
                        },
                    },
                    token: {
                        fontFamily: `Honkai, StarRail-EN, StarRail-ZH, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
                        fontWeightStrong: 400,
                    },
                }}
            >
                <div className="App">
                    <div className="Header">
                        <Tabs items={items} tabBarStyle={{ height: 50, padding: "0 20px" }} />
                    </div>
                    <div className="Content">
                        <Table
                            ref={tableRef}
                            columns={columns}
                            dataSource={musicList}
                            size="small"
                            pagination={false}
                            scroll={{ y: "calc(100vh - 159px)" }}
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
                    <div className="Footer">
                        <AudioPlayer
                            ref={audioPlayerRef}
                            src={currentPlaying}
                            onNext={onNext}
                            onPrevious={onPrevious}
                            enableOnNext
                            enableOnPrevious={enableGetPrevious()}
                            playMode={playMode}
                            onPlayModeChange={onPlayModeChange}
                        />
                        {/* <div>
                            <label>Play Mode:</label>
                            <select value={playMode} onChange={(e) => handlePlayModeChange(e.target.value)}>
                                <option value="one">Repeat One</option>
                                <option value="random">Random</option>
                                <option value="loop">Loop</option>
                            </select>
                            <div>
                                <Button disabled={!enableGetPrevious()} onClick={onPrevious}>
                                    Previous
                                </Button>
                                <button onClick={onNext}>Next</button>
                            </div>
                        </div> */}
                    </div>
                </div>
            </ConfigProvider>
        </AppConfig.Provider>
    );
}

export default App;
