import mime from "mime";

import { v4 } from "uuid";

const { parseFile } = window.require("music-metadata");
const fs = window.require("fs");
const path = window.require("path");

async function getMusicMetadata(filePath) {
    try {
        const metadata = await parseFile(filePath, { native: true });
        return {
            song: {
                key: crypto.randomUUID(),
                title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
                artist: metadata.common.artist ? metadata.common.artist : "Unknown Artist",
                artists: metadata.common.artists,
                year: metadata.common.year,
                album: metadata.common.album || "Unknown Album",
                filePath: filePath,
            },
            metadata,
        };
    } catch (error) {
        console.error("Error reading metadata for", filePath, error.message);
        return { song: undefined, metadata: undefined };
    }
}

async function listMusicFiles(directory) {
    const musicList = { songs: [], albums: {} };

    async function processFile(file) {
        const filePath = path.join(directory, file);

        const mimeType = mime.getType(filePath);
        if (mimeType && mimeType.startsWith("audio")) {
            const { song, metadata } = await getMusicMetadata(filePath);
            if (song && metadata) {
                musicList.songs.push(song);

                // Generate a GUID key for the album
                const albumKey = v4();
                if (
                    !Object.values(musicList.albums).some(
                        (v) => v.album === song.album && v.albumartist === metadata.common.albumartist
                    )
                ) {
                    // If album does not exist in albums list, add it
                    musicList.albums[albumKey] = {
                        key: albumKey,
                        album: song.album,
                        albumartist: metadata.common.albumartist ?? "Unknown Artist",
                        cover:
                            (metadata.common.picture ?? []).length > 0
                                ? "data:image/jpg;base64," + metadata.common.picture[0].data.toString("base64")
                                : null,
                    };
                }

                // Link the song to the album using the album key
                metadata.album = albumKey;
            }
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
