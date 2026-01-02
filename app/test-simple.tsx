import { Text, View } from 'react-native';

export default function TestSimple() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>✅ APP LOADED SUCCESSFULLY!</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>Runtime is working correctly</Text>
    </View>
  );
}
