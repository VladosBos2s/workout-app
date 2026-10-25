// plans.ts
import i18n from 'i18next';
import type { TrainingPlan } from '../types';

export const fullBody2Days: TrainingPlan = {
    split: 'full-body',
    daysPerWeek: 2,
    durationWeeks: 8,
    days: [
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'A' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 1,
        },
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'B' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс', 'Кардио'],
            exercisesPerGroup: 1,
        }
    ]
};

export const fullBody3Days: TrainingPlan = {
    split: 'full-body',
    daysPerWeek: 3,
    durationWeeks: 8,
    days: [
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'A' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 1,
        },
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'B' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс', 'Кардио'],
            exercisesPerGroup: 1,
        },
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'C' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 1,
        }
    ]
};

export const upperLowerFullBody3Days: TrainingPlan = {
    split: 'upper-lower + full-body',
    daysPerWeek: 3,
    durationWeeks: 8,
    days: [
        {
            name: i18n.t('plansData.dayUpper', { letter: 'A' }),
            muscleGroups: ['Грудные', 'Спина', 'Плечи', 'Бицепс', 'Трицепс', 'Кардио'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayLower', { letter: 'B' }),
            muscleGroups: ['Ноги', 'Икры'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayFullBody', { letter: 'C' }),
            muscleGroups: ['Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 1,
        }
    ]
};

export const upperLower4Days: TrainingPlan = {
    split: 'upper-lower',
    daysPerWeek: 4,
    durationWeeks: 8,
    days: [
        {
            name: i18n.t('plansData.dayUpper', { letter: 'A' }),
            muscleGroups: ['Грудные', 'Спина', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayLower', { letter: 'B' }),
            muscleGroups: ['Ноги', 'Икры'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayUpper', { letter: 'C' }),
            muscleGroups: ['Грудные', 'Спина', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayLower', { letter: 'D' }),
            muscleGroups: ['Ноги', 'Икры'],
            exercisesPerGroup: 2,
        }
    ]
};

export const upperLower5Days: TrainingPlan = {
    split: 'upper-lower',
    daysPerWeek: 5,
    durationWeeks: 8,
    days: [
        {
            name: i18n.t('plansData.dayUpper', { letter: 'A' }),
            muscleGroups: ['Грудные', 'Спина', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayLower', { letter: 'B' }),
            muscleGroups: ['Ноги', 'Икры'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayUpper', { letter: 'C' }),
            muscleGroups: ['Грудные', 'Спина', 'Плечи', 'Бицепс', 'Трицепс'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayLower', { letter: 'D' }),
            muscleGroups: ['Ноги', 'Икры'],
            exercisesPerGroup: 2,
        },
        {
            name: i18n.t('plansData.dayCardio', { letter: 'E' }),
            muscleGroups: ['Кардио'],
            exercisesPerGroup: 1,
        }
    ]
};

export const pushPullLegs5Days: TrainingPlan = {
    split: 'push-pull-legs',
    daysPerWeek: 5,
    durationWeeks: 8,
    days: [
        { name: i18n.t('plansData.dayPush', { letter: 'A' }), muscleGroups: ['Грудные', 'Плечи', 'Трицепс'], exercisesPerGroup: 2 },
        { name: i18n.t('plansData.dayPull', { letter: 'B' }), muscleGroups: ['Спина', 'Бицепс'], exercisesPerGroup: 2 },
        { name: i18n.t('plansData.dayLegs', { letter: 'C' }), muscleGroups: ['Ноги', 'Икры'], exercisesPerGroup: 4 },
        { name: i18n.t('plansData.dayPush', { letter: 'D' }), muscleGroups: ['Грудные', 'Плечи', 'Трицепс'], exercisesPerGroup: 2 },
        { name: i18n.t('plansData.dayPull', { letter: 'E' }), muscleGroups: ['Спина', 'Бицепс'], exercisesPerGroup: 2 },
    ]
};

export const arnoldSplit5Days: TrainingPlan = {
    split: 'arnold-split',
    daysPerWeek: 5,
    durationWeeks: 8,
    days: [
        { name: i18n.t('plansData.dayChestBack', { letter: 'A' }), muscleGroups: ['Грудные', 'Спина'], exercisesPerGroup: 3 },
        { name: i18n.t('plansData.dayShouldersArms', { letter: 'B' }), muscleGroups: ['Плечи', 'Бицепс', 'Трицепс'], exercisesPerGroup: 3 },
        { name: i18n.t('plansData.dayLegsCalves', { letter: 'C' }), muscleGroups: ['Ноги', 'Икры'], exercisesPerGroup: 4 },
        { name: i18n.t('plansData.dayChestBack', { letter: 'D' }), muscleGroups: ['Грудные', 'Спина'], exercisesPerGroup: 3 },
        { name: i18n.t('plansData.dayShouldersArms', { letter: 'E' }), muscleGroups: ['Плечи', 'Бицепс', 'Трицепс'], exercisesPerGroup: 3 },
    ]
};