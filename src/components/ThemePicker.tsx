import { Pressable, View } from 'react-native';

import { themes, type ThemeName } from '../theme/themes';

type ThemePickerProps = {
  selectedTheme: ThemeName;
  onSelect: (theme: ThemeName) => void;
};

export default function ThemePicker({ selectedTheme, onSelect }: ThemePickerProps) {
  return (
    <View accessibilityLabel="选择主题" style={{ alignItems: 'center', gap: 10 }}>
      {themes
        .filter(({ name }) => name !== selectedTheme)
        .map((theme) => (
          <Pressable
            accessibilityLabel={`${theme.label}色主题`}
            key={theme.name}
            onPress={() => onSelect(theme.name)}
            style={{
              alignItems: 'center',
              backgroundColor: theme.color,
              borderRadius: 14,
              height: 28,
              justifyContent: 'center',
              width: 28,
            }}
          />
        ))}
    </View>
  );
}
