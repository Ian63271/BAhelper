import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

type Props = {
    children: ReactNode;
    style?: ViewStyle;
};

export default function ScreenContainer({ children, style }: Props) {
    return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
