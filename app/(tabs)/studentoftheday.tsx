import { Text } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import studentsData from "@/data/students.json";
import { studentPortraits } from '@/types/imageMap';
import { Students } from "@/types/students";

export default function Index() {
  // Get a random student or specific one - you can modify this logic
  const [student, setStudent] = useState<Students | null>(null);

  useEffect(() => {
    // // For now, showing the first student. You can randomize or select based on date
    // if (studentsData.length > 0) {
    //   setStudent(studentsData[0] as Students);
    // }

    // // Select a student based on today's date (same day = same student)
    // if (studentsData.length > 0) {
    //   const today = new Date();
    //   const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    //   const studentIndex = dayOfYear % studentsData.length;
    //   setStudent(studentsData[studentIndex] as Students);
    // }

    // Select a random student each time the component mounts (for testing)
    if (studentsData.length > 0) {
      const randomIndex = Math.floor(Math.random() * studentsData.length);
      setStudent(studentsData[randomIndex] as Students);
    }

  }, []);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Dynamically require the image based on the path

  const studentImage = studentPortraits[student.id];

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}> 
        <ImageViewer imgSource={studentImage} />
      </View>
      <Text>Name: {student.name}</Text>
      <Text>Age: {student.age}</Text>
      <Text>Birthday: {student.birthday}</Text>
      <Text>Height: {student.height}</Text>
      <Text>Hobbies: {student.hobbies}</Text>
      <Text>Designer: {student.designer}</Text>
      <Text>Illustrator: {student.illustrator}</Text>
      <Text>Voice: {student.voice}</Text>
      <Text>Damage Type: {student.damageType}</Text>
      <Text>Armor Type: {student.armorType}</Text>
      <Text>Combat Class: {student.combatClass}</Text>
      <Text>School: {student.school}</Text>
      <Text>Role: {student.role}</Text>
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