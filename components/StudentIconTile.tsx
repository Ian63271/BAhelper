import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, damageTypeColors, radius } from '@/constants/theme';
import { studentIcons } from '@/types/imageMap';
import { Students } from '@/types/students';

type Props = {
    student: Students;
    owned?: boolean;
    favorite?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
};

function StudentIconTile({ student, owned, favorite, onPress, onLongPress }: Props) {
    const rimColor = (student.damageType && damageTypeColors[student.damageType]) || colors.border;

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
            <View style={[styles.iconWrap, { borderColor: rimColor }, owned && styles.iconWrapOwned]}>
                <Image source={studentIcons[student.id]} style={styles.icon} contentFit="cover" />
                {favorite && (
                    <View style={styles.favBadge}>
                        <Ionicons name="heart" size={12} color="#fff" />
                    </View>
                )}
                {owned && (
                    <View style={styles.ownedBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {student.name}
            </Text>
        </Pressable>
    );
}

export default memo(StudentIconTile);

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    pressed: {
        opacity: 0.7,
    },
    iconWrap: {
        borderWidth: 2.5,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: colors.surfaceAlt,
    },
    iconWrapOwned: {
        borderColor: colors.success,
    },
    icon: {
        width: 64,
        height: 64,
    },
    name: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    favBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.danger,
        borderRadius: radius.pill,
        padding: 2,
    },
    ownedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: colors.success,
        borderRadius: radius.pill,
        padding: 2,
    },
});
