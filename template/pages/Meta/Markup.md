## Frontmatter

A page can have an optional frontmatter. Such a page can look like this:

```md
---
title: Main Page
aliases:
  - Main
categories:
  - General
---

Page content here.
```

## Basic inline formatting

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Italic text</td>
      <td><code>*italic*</code></td>
      <td><em>italic</em></td>
    </tr>
    <tr>
      <td>Bold text</td>
      <td><code>**bold**</code></td>
      <td><strong>bold</strong></td>
    </tr>
    <tr>
      <td>Bold italic text</td>
      <td><code>***bold & italic***</code></td>
      <td><strong><em>bold & italic</em></strong></td>
    </tr>
    <tr>
      <td>Strike-throughtext</td>
      <td><code>~~strike-through~~</code></td>
      <td><s>strike-through</s></td>
    </tr>
    <tr>
      <td>Inline code</td>
      <td><code>`Code`</code></td>
      <td><code>Code</code></td>
    </tr>
  </tbody>
</table>

## Links

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Internal link</td>
      <td><code>[Main Page](Main_Page.md)</code></td>
      <td><a href="#">Main Page</a></td>
    </tr>
  </tbody>
</table>

## Images

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Inline image</td>
      <td><pre>![](example.jpeg)</pre></td>
      <td></td>
    </tr>
  </tbody>
</table>

## Section headings

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Level 2</td>
      <td><code>## Level 2</code></td>
      <td><h2>Level 2</h2></td>
    </tr>
    <tr>
      <td>Level 3</td>
      <td><code>### Level 3</code></td>
      <td><h3>Level 3</h3></td>
    </tr>
    <tr>
      <td>Level 4</td>
      <td><code>#### Level 4</code></td>
      <td><h4>Level 4</h4></td>
    </tr>
    <tr>
      <td>Level 5</td>
      <td><code>##### Level 5</code></td>
      <td><h5>Level 5</h5></td>
    </tr>
    <tr>
      <td>Level 6</td>
      <td><code>###### Level 6</code></td>
      <td><h6>Level 6</h6></td>
    </tr>
  </tbody>
</table>

## Formatted text

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Preformatted text</td>
      <td><pre>    Start each line<br>    with four spaces</pre></td>
      <td><pre>Start each line<br>with four spaces</pre></td>
    </tr>
    <tr>
      <td>Syntax highlighting</td>
      <td><pre>```js<br>console.log('Syntax highlighting!');<br>```</td>
      <td>

```js
console.log('Syntax highlighting!');
```

</td>
    </tr>
  </tbody>
</table>

If you put the language in curly braces (e.g. <code>```{plantuml}</code>),
the source code will not be rendered. This is useful for languages like plantuml,
mermaid or chartjs that generate graphics.

## Lists

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bullet list</td>
      <td><pre>* Item 1<br>* Item 2<br>  * Item 2a<br>* Item 3</td>
      <td><ul><li>Item 1<li>Item 2<ul><li>Item 2a</ul><li>Item 3</ul></td>
    </tr>
    <tr>
      <td>Numbered list</td>
      <td><pre>1. Item 1<br>1. Item 2<br>   1. Item 2a<br>1. Item 3</td>
      <td><ol><li>Item 1<li>Item 2<ol><li>Item 2a</ol><li>Item 3</ol></td>
    </tr>
    <tr>
      <td>Definition list</td>
      <td><pre>Item 1<br>~ Definition 1<br><br>Item 2<br>~ Definition 2a<br>~ Definition 2b<br><br>Item 3<br>: Definition 3</pre></td>
      <td><dl><dt>Item 1</dt><dd>Definition 1</dd><dt>Item 2</dt><dd>Definition 2a</dd><dd>Definition 2b</dd><dt>Item 3</dt><dd>Definition 3</dl></td>
    </tr>
  </tbody>
</table>

## Tables

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Syntax</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Simple table</td>
      <td><pre>| Language | Aliases |<br>| -------- | ------- |<br>| ARM assembly | armasm, arm |</pre></td>
      <td>
        <table>
          <thead><tr><th>Language</th><th>Aliases</th><tr></thead>
          <tbody><tr><td>ASM assembly</td><td>armasm, arm</td></td></tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
