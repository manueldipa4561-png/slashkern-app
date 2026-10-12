// slashkern is light only: sets the light class and the browser bar colour before the first paint, so the page never flashes anything else.
// The page's own script (app.ts applyTheme) does the same once it runs; there is no saved theme to read any more.
document.documentElement.classList.add('light');
document.querySelector('meta[name="theme-color"]').setAttribute('content', '#F5F7FF');
