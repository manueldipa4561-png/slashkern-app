// The done icon is a Phosphor Icons, duotone weight (MIT licence, (c) Phosphor Icons, phosphoricons.com) on a 24 x 24 grid,
// changed for slashkern: the outline stays bone (class pf), the duotone body takes the lime of the brand at about a third (class pd).
// The names ending in -on are the filled versions the tab bar shows for the tab in play. The three tabs are pictures: Missions (a glass signpost), slashkern (a glass person) and Slash (a glass star with a small blue star), see FIELD_PICS below. Styles: app.css (.k-i).
export const ICONS: Record<string, string> = {
  // sections
  done: '<g transform="scale(.09375)"><path class="pd" d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"/><path class="pf" d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></g>',
};

// The seven fields, the slashkern tab and Slash are pictures, not drawings: frosted glass objects with one lime bead, 192 x 192 with a transparent background (public/img/f/<name>.webp, notes in design/field-icons.md).
export const FIELD_PICS = ['Design', 'Writing', 'Code', 'Video', 'Selling', 'Music', 'Prompting', 'yourkern', 'copilot', 'missions'];
export const picFile = (name: string) => (name === 'copilot' ? 'ai' : name.toLowerCase()); // Slash's picture is ai.webp
export const icon = (name: string, cls = 'k-i') => FIELD_PICS.includes(name)
  ? `<img class="k-fp" src="/img/f/${picFile(name)}.webp?v=slash1" width="192" height="192" alt="" aria-hidden="true">`
  : `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] ?? ''}</svg>`;
