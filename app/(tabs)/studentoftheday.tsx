import { Text } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import charactersData from "@/data/characters.json";
import { Character } from "@/types/character";

export default function Index() {
  // Get a random character or specific one - you can modify this logic
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    // For now, showing the first character. You can randomize or select based on date
    if (charactersData.length > 0) {
      setCharacter(charactersData[1] as Character);
    }

    // // Select a character based on today's date (same day = same character)
    // if (charactersData.length > 0) {
    //   const today = new Date();
    //   const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    //   const characterIndex = dayOfYear % charactersData.length;
    //   setCharacter(charactersData[characterIndex] as Character);
    // }
  }, []);

  if (!character) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Dynamically require the image based on the path
  const characterImage = require('@/assets/images/Yoshimi_Portrait.png');

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}> 
        <ImageViewer imgSource={characterImage} />
      </View>
      <Text>Name: {character.name}</Text>
      <Text>Age: {character.age}</Text>
      <Text>Birthday: {character.birthday}</Text>
      <Text>Height: {character.height}</Text>
      <Text>Hobbies: {character.hobbies}</Text>
      <Text>Designer: {character.designer}</Text>
      <Text>Illustrator: {character.illustrator}</Text>
      <Text>Voice: {character.voice}</Text>
      <Text>Damage Type: {character.damageType}</Text>
      <Text>Armor Type: {character.armorType}</Text>
      <Text>Combat Class: {character.combatClass}</Text>
      <Text>School: {character.school}</Text>
      <Text>Role: {character.role}</Text>
      <View style={styles.footerContainer}>
        <Button label="Choose a photo" theme="primary" />
        <Button label="Use this photo" />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f6e98',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff'
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    overflow: 'hidden',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
});