(() => {
  if (!window.wiki10 || !Array.isArray(window.wiki10.pages)) {
    console.warn('window.wiki10.pages is not an array');
    return;
  }

  const activePage = Object.assign({
    level: 1,
  }, window.wiki10.activePage ?? {});

  const searchInput = document.getElementById('search');
  const suggestionsBox = document.getElementById('suggestions');

  if (!searchInput || !suggestionsBox) {
    console.warn('missing #search or #suggestions');
    return;
  }

  function toggleSuggestions(show) {
    suggestionsBox.hidden = !show;
  }

  function setSuggestions(pages) {
    const ul = suggestionsBox.querySelector('ul');
    ul.textContent = '';

    for (const page of pages) {
      const li = ul.appendChild(document.createElement('li'));
      const a = li.appendChild(document.createElement('a'));
      a.href = `${'../'.repeat(activePage.level - 1)}${page.filename}`;
      a.textContent = page.title;
    }
  }

  function findPages() {
    const search = searchInput.value.replace(/\s+/, ' ').trim().toLowerCase();

    if (search == '') {
      toggleSuggestions(false);
      return;
    }

    const pages = window.wiki10.pages.filter(page => {
      return page.title.toLowerCase().includes(search);
    });

    if (pages.length > 0) {
      setSuggestions(pages);
      toggleSuggestions(true);
    } else {
      toggleSuggestions(false);
    }
  }

  searchInput.addEventListener('focus', () => {
    findPages();
  });

  searchInput.addEventListener('input', () => {
    findPages();
  });

  searchInput.addEventListener('blur', event => {
    if (!event.relatedTarget) {
      suggestionsBox.hidden = true;
    }

    const parent = event.relatedTarget?.closest('#suggestions');

    if (!parent) {
      suggestionsBox.hidden = true;
    }
  });
})();
