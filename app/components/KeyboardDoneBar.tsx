import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export const KEYBOARD_DONE_ID = 'happ-e-keyboard-done';

export function KeyboardDoneBar() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View style={styles.bar}>
        <Pressable onPress={() => Keyboard.dismiss()} hitSlop={12} style={styles.btn}>
          <Text style={styles.label}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  label: {
    color: '#FFC300',
    fontWeight: '700',
    fontSize: 16,
  },
});
