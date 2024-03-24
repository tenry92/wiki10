Welcome to **wiki10**!

Run `npx wiki10 init path/to/your/wiki` to initialize a new wiki at the given path.
Go to your new project and open `source/pages/Main_Page.md` in your favorite text
editor or add new markdown files to that folder.

Run `npx wiki10 build path/to/your/wiki` to generate the HTML files.
Open `public/pages/Main_Page.html` in your favorite web browser and enjoy the
texts you have written. Repeat the command whenever you changed a markdown file.

## Media

You can add image files you want to display on your pages to `source/media`.

## Generated media

Certain fenced code blocks can be rendered into graphics or audio files.
In order to have these rendered, certain command line tools need to be installed
on your computer.

- `plantuml` for rendering plantuml graphs
- `lilypond` and `inkscape` for rendering lilypond sheet music
- `fluidsynth` and `ffmpeg` for rendering lilypond music for ogg music files

*lilypond* is used to convert lilypond sheet music into SVG, that is then
cropped via *inkscape*, and to create MIDI files.

*fluidsynth* is used to generate audio data, which is converted to an audio
container file (ogg/vorbis) via *ffmpeg*.

## Style

You will find the default style (HTML, CSS, JavaScript) in `source/layout`.
Adjust these files if you want to change the design and run
`npx wiki10 build <path> --rebuild-pages` to update all pages.
