import appConfig from "../config.json";
const fs = window.require("fs");
const path = window.require("path");

class config {
    static init() {
        const appRoot = path.join(window.require("electron").app.getPath("appData"), appConfig.appName);
        global.path = {
            appRoot: appRoot,
            appConfig: path.join(appRoot, "app.config"),
        };

        if (!fs.existsSync(global.path.appRoot)) fs.mkdirSync(global.path.appRoot);

        if (!fs.existsSync(global.path.appConfig)) {
            fs.writeFileSync(global.path.appConfig, JSON.stringify(appConfig, undefined, 2));
        }
    }

    static get(key) {
        try {
            const configData = fs.readFileSync(global.path.appConfig);
            const config = JSON.parse(configData);
            if (key) {
                const value = config[key];
                if (value === "") {
                    return undefined;
                } else {
                    return config[key];
                }
            } else {
                return config;
            }
        } catch (error) {
            return undefined;
        }
    }

    static upsert(key, value) {
        try {
            const configData = fs.readFileSync(global.path.appConfig);
            const config = JSON.parse(configData);
            config[key] = value;
            fs.writeFileSync(global.path.appConfig, JSON.stringify(config));
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default config;
