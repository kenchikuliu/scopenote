const paths = {
  note: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h5" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  agreement: <><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h4" /></>,
  document: <><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5" /><path d="m3 15 2 2 3-3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  edit: <><path d="m15 4 5 5L9 20H4v-5zM13 6l5 5" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
  upload: <><path d="M12 16V4m-4 4 4-4 4 4M4 16v5h16v-5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  leaf: <><path d="M20 3C8 2 3 7 5 14s11 8 14-2c1-3 1-6 1-9Z" /><path d="M3 21 15 9" /></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-5" /></>,
  chevron: <path d="m8 5 7 7-7 7" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  print: <><path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6zM17 11h.01" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z" /></>,
  undo: <><path d="M4 9h9a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5" /></>,
};

export default function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] ?? paths.note}</svg>;
}
