# Papa's Record Room

A gift for Papa: a record room where his favourite music plays while the family's photos turn on the turntable.

Live page: https://claude.ai/artifact/6srz6H2Dz1aEBrgoVh1H7P

## What's here

- `index.html`: the whole page. It runs as a claude.ai artifact and uses the artifact's storage for photos, songs, records and liner notes. The turntable plays only his favourites: uploaded songs play in the page, playlist songs open in YouTube Music.
- Papa's Library: a shelf of PDF and text books with a reader in the page that reopens each book where he stopped.
- `data/playlist-hindi.json`, `data/playlist-english.json`: Papa's YouTube Music playlists (319 Hindi, 100 English songs), as loaded into the page.
- `tools/press-record.swift`: wraps a song file (mp3, m4a, wav) in a small .mp4 so the page's storage accepts it.

## Converting a song

```bash
swiftc -O tools/press-record.swift -o tools/press-record
./tools/press-record "song.mp3" "song.mp4"
```

Only use songs the family owns.
