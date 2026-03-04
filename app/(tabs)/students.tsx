import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() { 
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Students Page</Text>
              <Link href="/studentoftheday" style={styles.button}>
                    Go to student of the day page
              </Link>
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
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});