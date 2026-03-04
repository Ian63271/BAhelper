import { Image } from "expo-image";
import { ImageSourcePropType, StyleSheet } from "react-native";

type Props = {
    imgSource: ImageSourcePropType
};

export default function ImageViewer ({ imgSource }: Props) {
    return <Image source={imgSource} style={styles.image} contentFit="contain" />
}

const styles = StyleSheet.create({
    image: {
        width: '80%',
        height: '80%',
        borderRadius: 18,
    },
})