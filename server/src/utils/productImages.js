import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Generates clean, on-brand eyewear illustrations as SVG (no external image hosting, so links never break).
 * They live in client/public/products, so the frontend host (Vite, Vercel, any CDN) serves them as /products/<slug>-<n>.svg.
 * by editing a product's image URLs in the admin.
 */
const DIR = fileURLToPath(new URL('../../../client/public/products/', import.meta.url));
export const imageUrls = (slug) => [1, 2].map((n) => `/products/${slug}-${n}.svg`);

const SHAPES = {
  round: '<circle r="92"/>',
  square: '<rect x="-92" y="-84" width="184" height="168" rx="26"/>',
  rectangle: '<rect x="-102" y="-64" width="204" height="128" rx="20"/>',
  oval: '<ellipse rx="102" ry="74"/>',
  aviator: '<path d="M-100-62C-100-92 100-92 100-62C100 30 44 100 0 100C-60 100-100 30-100-62Z"/>',
  'cat-eye': '<path d="M-104-72C-70-92 30-96 100-52C112 20 66 80 0 80C-66 80-104 20-104-72Z"/>',
  wayfarer: '<path d="M-100-70L100-62L88 62Q0 84-88 62Z"/>',
};
const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function glasses({ shape, color, kind }) {
  const lens = SHAPES[shape] ?? SHAPES.round;
  const fill = kind === 'sun' ? 'url(#tint)' : kind === 'blue' ? '#bcd7f2' : '#ffffff';
  const opacity = kind === 'sun' ? 0.92 : kind === 'blue' ? 0.5 : 0.35;
  const glint =
    '<path d="M-62-36L-24-66" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="10" stroke-linecap="round"/>';
  return `<g fill="${fill}" fill-opacity="${opacity}" stroke="${color}" stroke-width="16" stroke-linejoin="round">
    <g transform="translate(-150 0)">${lens}${glint}</g>
    <g transform="translate(150 0) scale(-1 1)">${lens}${glint}</g></g>
  <path d="M-54-22Q0-58 54-22" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
  <path d="M-250-40L-300-52M250-40L300-52" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>`;
}

function accessory(name, color) {
  if (/case/i.test(name)) {
    return `<rect x="170" y="380" width="460" height="230" rx="38" fill="${color}"/><path d="M196 470H604" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 8"/><rect x="368" y="362" width="64" height="46" rx="10" fill="#C6A76B"/>`;
  }
  return `<rect x="230" y="350" width="340" height="260" rx="22" fill="#e8e4dc" transform="rotate(-7 400 480)"/><rect x="230" y="350" width="340" height="260" rx="22" fill="#8D8A84" transform="rotate(3 400 480)"/><rect x="230" y="350" width="340" height="260" rx="22" fill="#C6A76B" transform="rotate(-1 400 480)"/>`;
}

/** variant 1 = studio front view on ivory, variant 2 = angled "lifestyle" tile on champagne. */
export function renderProductSvg({ name, shape, color, category, variant }) {
  const stroke = color === '#e8e4dc' ? '#a39d92' : color; // the "Clear" frame needs a visible outline
  const isAccessory = category === 'Accessories';
  const kind =
    category === 'Sunglasses' ? 'sun' : category === 'Blue Light Glasses' ? 'blue' : 'clear';
  const art = isAccessory
    ? accessory(name, stroke)
    : `<g transform="translate(400 470) scale(${variant === 1 ? 1.05 : 0.85}) rotate(${variant === 1 ? 0 : -8})">${glasses({ shape, color: stroke, kind })}</g>`;
  const bg =
    variant === 1
      ? '<rect width="800" height="1000" fill="#F8F6F1"/>'
      : '<rect width="800" height="1000" fill="url(#warm)"/><circle cx="400" cy="480" r="300" fill="#fff" fill-opacity=".28"/>';
  const shadow =
    variant === 1 ? '<ellipse cx="400" cy="700" rx="270" ry="16" fill="#000" opacity=".07"/>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${esc(name)}"><title>${esc(name)}</title>
<defs><linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1c1c"/><stop offset="1" stop-color="#5a5a5a"/></linearGradient>
<linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EFE6D2"/><stop offset="1" stop-color="#D8C298"/></linearGradient></defs>
${bg}${shadow}${art}</svg>`;
}

export function writeProductImages(items) {
  mkdirSync(DIR, { recursive: true });
  for (const it of items)
    for (const variant of [1, 2])
      writeFileSync(`${DIR}${it.slug}-${variant}.svg`, renderProductSvg({ ...it, variant }));
  return items.length * 2;
}
