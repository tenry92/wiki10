You can use variables in the layout files (HTML) and the actual markdown pages (Markdown).
The layout files use the [EJS](https://ejs.co/) syntax.
The Markdown files use the [Mustache](https://github.com/janl/mustache.js) syntax.

## Layout files

Simple variables:

```html
<h1><%= title %></h1>
```

Variables containing HTML (do not escape):

```html
<main><%- content %></main>
```

Iterating arrays:

```html
<% for (const item of items) { %>
  <div><%= item.text %></div>
<% } %>
```

The following variables are available:

| Name | Description | Example |
| ---- | ----------- | ------- |
| `assets` | URL to assets | <code>{{assets}}</code> |
| `cache` | URL to cache | <code>{{cache}}</code> |
| `menuItems` | Menu items for the sidebar | |
| `footerItems` | Footer items | |
| `title` | Current page's title | |
| `content` | Current page's content in HTML | |
| `activePage` | Current page | |

## Pages

Simple variables:

<pre><code>The page title is <span class="hljs-variable">&lcub;{pageTitle}}</span></code></pre>

Iterating arrays:

<pre><code><span class="hljs-variable">&lcub;{#pages}}</span>
* [<span class="hljs-variable">&lcub;{resolvedPageTitle}}</span>](<span class="hljs-variable">&lcub;{pagesUrl}}&lcub;{url}}</span>)
<span class="hljs-variable">&lcub;{/pages}}</span></code></pre>

The following variables are available:

| Name | Description | Example |
| ---- | ----------- | ------- |
| `pagesUrl` | URL to pages | <code>{{pagesUrl}}</code> |
| `assets` | URL to assets | <code>{{assets}}</code> |
| `cache` | URL to cache | <code>{{cache}}</code> |
| `pages` | Array of all pages | |
