Welcome to wiki10, a wiki-like tool that allows creating a knowledge base by
rendering static markdown files to HTML. No server is needed!

Just create a new project, write down your markdown files, build the HTML files
and you are ready to open the generated HTML files in your browser.

## Features

- Static generation: no web server required
- Pages as markdown files: no database required
- No sitemap: don't worry about where to put your pages in the tree
- Aliases: give a page aliases so it can be found under different titles
- Graphs and more: plantuml, mermaid, chartjs, lilypond support

## Creating a new project

```sh
$ npx wiki10 init path/to/wiki
```

## Project structure

A project has the following structure:

- public/ - the generated files
  - pages/ - the actual HTML files you open in your browser
- source/
  - layout/ - the layout HTML, CSS etc.
  - media/ - images and other files you include in your pages
  - pages/ - directory where you write your markdown documents
    - Meta/ - special pages such as list of all files

## Building

In order to build a project, i.e. creating the HTML files from the Markdown
source files, run:

```sh
$ npx wiki10 build path/to/wiki
```

This command will rebuild all pages that were modified since the last run and
copy the media files into the public folder.

### Options

#### --verbose, -v

Enable verbose logging

#### -vv

Enable debug logging

#### --rebuild-pages

Rebuild all pages

#### --rebuild-assets

Rebuild all assets (graphs etc.) of modified files

## External dependencies

- `plantuml` for rendering plantuml graphs
- `lilypond` and `inkscape` for rendering lilypond sheet music
- `fluidsynth` and `ffmpeg` for rendering lilypond music for ogg music files

## Generating internal docs

Run the following command to generate internal documentation in the docs folder:

```sh
$ npm run docs
# or:
$ yarn docs
```

## Contributing

### git commit messages

The format for git messages is based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

`<type>` is one of:

- Fix: patching a bug
- Docs: documentation
- Chore: update dependencies
- Other

`<description>` is a short title that describes the applied changes in present
tense, for example `Add files to package.json`.

Exception to the message format are tagged version updates (see below).

### Bumping version number

After all code targeting the next version is committed, the version number
(e.g. in package.json) can be updated. For this, use the commands
`npm|yarn version major|minor|patch`:

- Use `patch`, if bugs were patched or documentation was updated
- Use `minor`, if new features were introduced
- Use `major`, if breaking changes were introduced

After the version has been bumped, publish the new package version using
`npm|yarn publish`.

### Running wiki10 during development

Using the `npx wiki10 ...` commands will fetch the latest published version from
the npm registry to run. If you are currently developing on wiki10 itself and
want to run some commands, use `npm start ...` or `yarn start ...` instead.
