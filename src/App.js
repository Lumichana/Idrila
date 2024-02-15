import "./App.css";
import Forms from "./Components/Forms/Forms";
import Icons from "./Components/Icons/Icons";
import locale from "./Static/Config/Locale/content.json";
import Pages from "./Components/Pages/Pages";
import req from "./Connector/WebConnector";
import { App as Antd, Button, ConfigProvider, Layout, Space, Tooltip, Typography } from "antd";
import { createContext, useEffect, useState } from "react";
import { colorPrimary } from "./Static/Config/Color/Color";
import { listMusicFiles } from "./utilities/music";

const { ipcRenderer } = window.require("electron");

export const AppConfig = createContext(undefined);

function App() {
    const [appPath, _appPath] = useState([]);

    const [isAppReady, _isAppReady] = useState(false);

    const init = () => {
        const objAction = setInterval(async () => {
            const strServerAddress = await ipcRenderer.invoke("serverAddress");
            if (strServerAddress) {
                global.serverAddress = strServerAddress;
                const objRequest = await fetch(`${global.serverAddress}ready`);
                if (objRequest?.status === 200) {
                    _appPath(await objRequest.text());
                    clearInterval(objAction);
                    _isAppReady(true);
                }
            }
        }, 200);
    };

    useEffect(() => {
        init();
        listMusicFiles("C:\\Users\\hlin\\Documents\\Firefly\\Music").then(console.log);
    }, []);

    return (
        <>
            <p>{isAppReady}</p>
        </>
    );
}

export default App;
