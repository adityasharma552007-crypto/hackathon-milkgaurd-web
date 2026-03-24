export const WAVELENGTH_LABELS = [
  410, 435, 460, 485, 510, 535, 560, 585,
  610, 645, 680, 705, 730, 760, 810, 860, 900, 940,
];

export const WAVELENGTH_DETECTION_ZONES: Record<number, { zone: string; detects: string }> = {
  410: { zone: 'Violet light', detects: 'Fat baseline' },
  435: { zone: 'Violet light', detects: 'Fat baseline' },
  460: { zone: 'Blue light', detects: 'Fat / protein baseline' },
  485: { zone: 'Blue-green light', detects: 'Detergent zone' },
  510: { zone: 'Green light', detects: 'Detergent zone' },
  535: { zone: 'Green light', detects: 'Detergent / starch zone' },
  560: { zone: 'Yellow-green light', detects: 'Starch zone' },
  585: { zone: 'Yellow light', detects: 'Urea zone' },
  610: { zone: 'Orange-red light', detects: 'Urea zone' },
  645: { zone: 'Red light', detects: 'Urea / neutralizer zone' },
  680: { zone: 'Deep red', detects: 'Neutralizer zone' },
  705: { zone: 'Near-infrared', detects: 'Neutralizer / water zone' },
  730: { zone: 'Near-infrared', detects: 'Water zone' },
  760: { zone: 'Near-infrared', detects: 'Water zone' },
  810: { zone: 'Near-infrared', detects: 'Fat content zone' },
  860: { zone: 'Near-infrared', detects: 'Fat / protein zone' },
  900: { zone: 'Deep near-IR', detects: 'Formalin zone' },
  940: { zone: 'Deep near-IR', detects: 'Formalin / water zone' },
};
