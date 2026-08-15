export type ThemeName = 'blue' | 'green' | 'pink' | 'yellow' | 'purple' | 'gray';

export type Theme = {
  name: ThemeName;
  label: string;
  color: string;
};

export const themes: Theme[] = [
  { name: 'blue', label: '蓝', color: '#38BDF8' },
  { name: 'green', label: '绿', color: '#34D399' },
  { name: 'pink', label: '粉', color: '#F472B6' },
  { name: 'yellow', label: '黄', color: '#FBBF24' },
  { name: 'purple', label: '紫', color: '#A78BFA' },
  { name: 'gray', label: '灰', color: '#94A3B8' },
];

export const defaultTheme = themes[0];
