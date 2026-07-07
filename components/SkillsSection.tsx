import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import FilterChip from '@/components/FilterChip';
import SectionCard from '@/components/SectionCard';
import SkillCard from '@/components/SkillCard';
import { skillTypeLabels } from '@/constants/buffLabels';
import { colors, damageTypeColors, spacing } from '@/constants/theme';
import { Students } from '@/types/students';

type Props = {
    student: Students;
};

// SchaleDB-style skills panel: EX / Basic / Enhanced / Sub. Basic and
// Enhanced swap to their upgraded versions (bond gear, unique weapon 2★)
// via header toggles when the student has them.
export default function SkillsSection({ student }: Props) {
    const [useGear, setUseGear] = useState(false);
    const [useWeapon, setUseWeapon] = useState(false);

    const skills = student.skills;
    if (!skills || !skills.ex) return null;

    const tintColor = student.damageType
        ? damageTypeColors[student.damageType] ?? colors.primary
        : colors.primary;

    const basic = useGear && skills.gearPublic ? skills.gearPublic : skills.public;
    const enhanced = useWeapon && skills.weaponPassive ? skills.weaponPassive : skills.passive;

    return (
        <SectionCard title="Skills">
            <View style={styles.list}>
                <SkillCard
                    skill={skills.ex}
                    typeLabel={skillTypeLabels.Ex ?? 'EX Skill'}
                    maxLevel={5}
                    tintColor={tintColor}
                    cost={skills.ex.cost}
                    testID="skill-ex"
                />
                {basic && (
                    <View style={styles.divider}>
                        <SkillCard
                            key={`basic-${useGear}`}
                            skill={basic}
                            typeLabel={
                                useGear && skills.gearPublic
                                    ? skillTypeLabels.GearPublic ?? 'Basic Skill+'
                                    : skillTypeLabels.Public ?? 'Basic Skill'
                            }
                            maxLevel={10}
                            tintColor={tintColor}
                            headerRight={
                                skills.gearPublic ? (
                                    <FilterChip
                                        label="Bond Gear"
                                        selected={useGear}
                                        onPress={() => setUseGear(!useGear)}
                                        testID="skill-basic-toggle"
                                    />
                                ) : undefined
                            }
                        />
                    </View>
                )}
                {enhanced && (
                    <View style={styles.divider}>
                        <SkillCard
                            key={`enhanced-${useWeapon}`}
                            skill={enhanced}
                            typeLabel={
                                useWeapon && skills.weaponPassive
                                    ? skillTypeLabels.WeaponPassive ?? 'Enhanced Skill+'
                                    : skillTypeLabels.Passive ?? 'Enhanced Skill'
                            }
                            maxLevel={10}
                            tintColor={tintColor}
                            headerRight={
                                skills.weaponPassive ? (
                                    <FilterChip
                                        label="UE 2★"
                                        selected={useWeapon}
                                        onPress={() => setUseWeapon(!useWeapon)}
                                        testID="skill-enhanced-toggle"
                                    />
                                ) : undefined
                            }
                        />
                    </View>
                )}
                {skills.extraPassive && (
                    <View style={styles.divider}>
                        <SkillCard
                            skill={skills.extraPassive}
                            typeLabel={skillTypeLabels.ExtraPassive ?? 'Sub Skill'}
                            maxLevel={10}
                            tintColor={tintColor}
                        />
                    </View>
                )}
            </View>
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: spacing.lg,
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.lg,
    },
});
