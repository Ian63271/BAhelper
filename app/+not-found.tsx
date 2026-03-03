import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
    return(
        <>
            <Stack.Screen options ={{ title: 'Not Found' }} />
            <View style={styles.container}>
                <Text style={styles.text}> Oops, page not found</Text>
                <Link href="/" style={styles.button}>
                    Go back to the homescreen
                </Link>
            </View>
        </>
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