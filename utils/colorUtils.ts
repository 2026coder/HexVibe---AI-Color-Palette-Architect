export const generateRandomHex = (): string => {
  const chars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
};

export const getContrastColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

export const downloadJson = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateHarmony = (baseHex: string, type: 'ANALOGOUS' | 'COMPLEMENTARY' | 'MONOCHROMATIC' | 'TRIADIC'): string[] => {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const palette: string[] = [baseHex];

  switch (type) {
    case 'ANALOGOUS':
      palette.push(hslToHex((h + 30) % 360, s, l));
      palette.push(hslToHex((h + 60) % 360, s, l));
      palette.push(hslToHex((h - 30 + 360) % 360, s, l));
      palette.push(hslToHex((h - 60 + 360) % 360, s, l));
      break;
    case 'COMPLEMENTARY':
      palette.push(hslToHex((h + 180) % 360, s, l));
      palette.push(hslToHex(h, s, Math.min(l + 20, 100)));
      palette.push(hslToHex((h + 180) % 360, s, Math.min(l + 20, 100)));
      palette.push(hslToHex(h, s, Math.max(l - 20, 0)));
      break;
    case 'TRIADIC':
      palette.push(hslToHex((h + 120) % 360, s, l));
      palette.push(hslToHex((h + 240) % 360, s, l));
      palette.push(hslToHex((h + 120) % 360, s, Math.max(l - 20, 0)));
      palette.push(hslToHex((h + 240) % 360, s, Math.max(l - 20, 0)));
      break;
    case 'MONOCHROMATIC':
      palette.push(hslToHex(h, s, Math.max(l - 30, 0)));
      palette.push(hslToHex(h, s, Math.max(l - 15, 0)));
      palette.push(hslToHex(h, s, Math.min(l + 15, 100)));
      palette.push(hslToHex(h, s, Math.min(l + 30, 100)));
      break;
  }
  
  return palette.slice(0, 5);
};