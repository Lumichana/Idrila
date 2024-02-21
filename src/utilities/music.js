import mime from "mime";

import { v4 } from "uuid";

const { parseFile } = window.require("music-metadata");
const fs = window.require("fs");
const path = window.require("path");

async function listMusicFiles(directory) {
    const musicList = { songs: [], albums: {}, artists: [] };

    const unknownAlbumKey = v4();

    musicList.albums[unknownAlbumKey] = {
        key: unknownAlbumKey,
        album: "Unknown Album",
        albumartist: "Unknown Artist",
        cover: null,
    };

    async function processFile(file) {
        const filePath = path.join(directory, file);
        try {
            const mimeType = mime.getType(filePath);

            if (mimeType && mimeType.startsWith("audio")) {
                const metadata = await parseFile(filePath, { native: true });

                let song = {
                    key: crypto.randomUUID(),
                    title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
                    artist: metadata.common.artist ? metadata.common.artist : "Unknown Artist",
                    artists: [],
                    year: metadata.common.year,
                    album: unknownAlbumKey,
                    filePath: filePath,
                };
                let artists = song.artist.split(";");
                for (const a of artists) {
                    const n = a.trim();
                    if (!musicList.artists.includes(n)) {
                        musicList.artists.push(n);
                    }
                    song.artists.push(a)
                }

                if (metadata.common.album) {
                    let findAlbum = Object.values(musicList.albums).find(
                        (v) => v.album === metadata.common.album && v.albumartist === metadata.common.albumartist
                    );

                    if (findAlbum) {
                        // exists
                        song.album = findAlbum.key;
                    } else {
                        const albumKey = v4();
                        musicList.albums[albumKey] = {
                            key: albumKey,
                            album: metadata.common.album,
                            albumartist: metadata.common.albumartist ?? "Unknown Artist",
                            cover:
                                (metadata.common.picture ?? []).length > 0
                                    ? "data:image/jpg;base64," + metadata.common.picture[0].data.toString("base64")
                                    : null,
                        };
                        song.album = albumKey;
                    }
                }

                musicList.songs.push(song);
            }
        } catch (error) {
            console.error("Error reading metadata for", filePath, error.message);
            return { song: undefined, metadata: undefined };
        }
    }

    const files = await fs.promises.readdir(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            // Recursively search within subdirectories
            const subdirectoryFiles = await listMusicFiles(filePath);
            musicList.songs.push(...subdirectoryFiles.songs);

            // Merge unique albums from the subdirectory into the main albums list
            Object.values(subdirectoryFiles.albums).forEach((subAlbum) => {
                if (!musicList.albums[subAlbum.key]) {
                    musicList.albums[subAlbum.key] = subAlbum;
                }
            });
        } else {
            // Process individual files
            await processFile(file);
        }
    }

    return musicList;
}

export { listMusicFiles };
