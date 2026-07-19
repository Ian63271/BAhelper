// Total Assault score constants and conversion formulas, re-entered from
// jozsefsallai/ba-tools src/lib/raids.ts (MIT © József Sallai).
// score = timeScoreMultiplier × (3600 − clearTimeSecs) + difficultyScore + hpScore[duration]

export type RaidDuration = 180 | 240 | 290;

export const RAID_DURATIONS: {
    label: string;
    value: RaidDuration;
    bosses: string;
}[] = [
    { label: '3:00', value: 180, bosses: 'Binah · Kaiten FX Mk.0' },
    {
        label: '4:00',
        value: 240,
        bosses: 'Chesed · ShiroKuro · Hieronymus · Perorodzilla · Hod · Gregorius · Hovercraft · Kurokage · Geburah',
    },
    { label: '4:30', value: 290, bosses: 'Goz (Yesod) · Drumbarka' },
];

export type RaidDifficultyData = {
    name: string;
    difficultyScore: number;
    hpScore: Record<RaidDuration, number>;
    timeScoreMultiplier: number;
};

export const RAID_DIFFICULTIES: RaidDifficultyData[] = [
    {
        name: 'Normal',
        difficultyScore: 250000,
        hpScore: { 180: 229000, 240: 277000, 290: 304700 },
        timeScoreMultiplier: 120,
    },
    {
        name: 'Hard',
        difficultyScore: 500000,
        hpScore: { 180: 458000, 240: 554000, 290: 609400 },
        timeScoreMultiplier: 240,
    },
    {
        name: 'Very Hard',
        difficultyScore: 1000000,
        hpScore: { 180: 916000, 240: 1108000, 290: 1218800 },
        timeScoreMultiplier: 480,
    },
    {
        name: 'Hardcore',
        difficultyScore: 2000000,
        hpScore: { 180: 1832000, 240: 2216000, 290: 2437600 },
        timeScoreMultiplier: 960,
    },
    {
        name: 'Extreme',
        difficultyScore: 4000000,
        hpScore: { 180: 5392000, 240: 6160000, 290: 6578880 },
        timeScoreMultiplier: 1440,
    },
    {
        name: 'Insane',
        difficultyScore: 6800000,
        hpScore: { 180: 12449600, 240: 14216000, 290: 14941016 },
        timeScoreMultiplier: 1920,
    },
    {
        name: 'Torment',
        difficultyScore: 12200000,
        hpScore: { 180: 18876000, 240: 19508000, 290: 20302000 },
        timeScoreMultiplier: 2400,
    },
    {
        name: 'Lunatic',
        difficultyScore: 17710000,
        hpScore: { 180: 25525000, 240: 26315000, 290: 26954000 },
        timeScoreMultiplier: 2880,
    },
];

// The in-battle timer bank is 60 real-time minutes regardless of boss.
const TIME_BANK_SECS = 3600;

export function clearTimeToScore(
    clearTimeSecs: number,
    duration: RaidDuration,
    difficulty: RaidDifficultyData
): number | null {
    const remaining = TIME_BANK_SECS - clearTimeSecs;
    if (remaining < 0) return null;
    return (
        difficulty.timeScoreMultiplier * remaining +
        difficulty.difficultyScore +
        difficulty.hpScore[duration]
    );
}

export function scoreToClearTime(
    score: number,
    duration: RaidDuration,
    difficulty: RaidDifficultyData
): number {
    const baseScore = difficulty.difficultyScore + difficulty.hpScore[duration];
    const timeScore = score - baseScore;
    return Math.min(TIME_BANK_SECS, TIME_BANK_SECS - timeScore / difficulty.timeScoreMultiplier);
}

// Accepts "95", "1:35" or "1:35.5" → seconds; null when unparseable.
export function parseTimeInput(text: string): number | null {
    const parts = text.trim().split(':');
    let secs: number;
    if (parts.length === 1) {
        secs = Number.parseFloat(parts[0]);
    } else if (parts.length === 2) {
        const mins = Number.parseInt(parts[0], 10);
        const rest = Number.parseFloat(parts[1]);
        if (Number.isNaN(mins) || Number.isNaN(rest)) return null;
        secs = mins * 60 + rest;
    } else {
        return null;
    }
    return Number.isNaN(secs) || secs < 0 ? null : secs;
}

export function formatTime(secs: number): string {
    const mins = Math.floor(secs / 60);
    const rest = secs - mins * 60;
    const whole = Math.floor(rest);
    const millis = Math.round((rest - whole) * 1000);
    const secsText = String(whole).padStart(2, '0');
    return millis > 0
        ? `${mins}:${secsText}.${String(millis).padStart(3, '0').replace(/0+$/, '')}`
        : `${mins}:${secsText}`;
}
