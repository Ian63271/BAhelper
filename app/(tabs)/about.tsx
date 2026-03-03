import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() { 
    return (
        <View style={styles.container}>
            <Text style={styles.text}>BAhelper version 0.1</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#4f6e98',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#fff'
  },
});