// Sets the theme before the first paint, so the page never flashes the wrong one. Light is the default; a saved "dark" keeps the night look.
// The page's own script (app.ts applyTheme) takes over once it runs. Reads the same keys app.ts uses; a blocked storage leaves light.
(function () {
  var dark = false;
  try {
    var demo = localStorage.getItem('kern:mode') === 'demo';
    var saved = JSON.parse(localStorage.getItem(demo ? 'kern:demo' : 'kern:v1') || 'null') || (demo ? JSON.parse(localStorage.getItem('kern:v1') || 'null') : null);
    dark = !!saved && saved.theme === 'dark';
  } catch (e) { /* storage blocked or unreadable: light */ }
  if (dark) document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0F140E');
  else document.documentElement.classList.add('light');
})();
