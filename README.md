# Papa's Record Room

A gift for Papa: a record room where his favourite music plays while the family's photos turn on the turntable.

Live page: https://claude.ai/artifact/6srz6H2Dz1aEBrgoVh1H7P

## What's here

- `index.html`: the whole page. It runs as a claude.ai artifact and uses the artifact's storage for photos, songs, records and liner notes. The turntable plays only his favourites: uploaded songs play in the page, playlist songs open in YouTube Music.
- "Tum Se Hi Ghar": the family's birthday song for Papa's 54th, written from Mumma's, Bhaiya's, Shriya's (and Leo & Shiro's) words.
- Papa's Library: a shelf of PDF, EPUB and text books with a reader in the page that reopens each book where he stopped.
- `data/playlist-hindi.json`, `data/playlist-english.json`: Papa's YouTube Music playlists (319 Hindi, 100 English songs), as loaded into the page.
- `media/`: the sung song (`tum-se-hi-ghar-sung.mp4`, played by the page), the music-only version (`tum-se-hi-ghar.mp4`) and Papa's photo used in the song section.
- `tools/render-song.js`: composes the song's tune and renders it to a WAV (`npm i node-web-audio-api@1 && node tools/render-song.js song.wav`), then `press-record` wraps it for the page.
- `tools/press-record.swift`: wraps a song file (mp3, m4a, wav) in a small .mp4 so the page's storage accepts it.

## Converting a song

```bash
swiftc -O tools/press-record.swift -o tools/press-record
./tools/press-record "song.mp3" "song.mp4"
```

Only use songs the family owns.

## Android app

Download: [PapasRecordRoom.apk](app/PapasRecordRoom.apk). On the phone, open the file and allow installing from this source when Android asks.

The app shows a spinning record, then opens the Record Room in Chrome, where Papa stays signed in to Claude. The room must be shared with his Claude account from the page's Share menu.

Source is in `android/`; build it with `android/build.sh` (needs the Android SDK and JDK 17, no Gradle).
