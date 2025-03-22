// src/core/entities/enums/car-condition.enum.ts

/**
 * Represents the types of conditions a car section can have
 */
export enum CarConditionType {
    NO_DEFECT = 'no-defect',
    JUST_BOYA = 'just-boya',
    REPAIR_PAINT = 'repair-paint',
    CHANGE_PIECE = 'change-piece',
}

/**
 * Represents a section of the car that can be evaluated
 */
export enum CarSection {
    FRONT_BUMPER = 1,
    HOOD = 2,
    LEFT_DOOR = 3,
    RIGHT_DOOR = 4,
    REAR_BUMPER = 5,
    ROOF = 6,
}

/**
 * Interface for car section data with translation
 */
export interface CarSectionOption {
    id: CarSection;
    name: string;
}

/**
 * Get car section options with translation support
 */
export const getCarSectionOptions = (t?: any): CarSectionOption[] => {
    const translateWithNumber = (index: number, sectionKey: string) => {
        return t ? `${index}- ${t(`carSection.${sectionKey}`)}` : `${index}- ${sectionKey}`;
    };
    
    return [
        { id: CarSection.FRONT_BUMPER, name: translateWithNumber(1, 'frontBumper') },
        { id: CarSection.HOOD, name: translateWithNumber(2, 'hood') },
        { id: CarSection.LEFT_DOOR, name: translateWithNumber(3, 'leftDoor') },
        { id: CarSection.RIGHT_DOOR, name: translateWithNumber(4, 'rightDoor') },
        { id: CarSection.REAR_BUMPER, name: translateWithNumber(5, 'rearBumper') },
        { id: CarSection.ROOF, name: translateWithNumber(6, 'roof') },

    ];
};

/**
 * Interface for car condition type data with translation
 */
export interface CarConditionOption {
    value: CarConditionType;
    label: string;
    colorClass: string;
}

/**
 * Get car condition type options with translation support
 */
export const getCarConditionOptions = (t?: any): CarConditionOption[] => {
    return [
        { 
            value: CarConditionType.NO_DEFECT, 
            label: t ? t('conditionTypes.noDefect') : 'No defect',
            colorClass: 'bg-primary-light'
        },
        
        { 
            value: CarConditionType.JUST_BOYA, 
            label: t ? t('conditionTypes.justBoya') : 'Just boya',
            colorClass: 'bg-secondary-purple'
        },
        { 
            value: CarConditionType.REPAIR_PAINT, 
            label: t ? t('conditionTypes.repairPaint') : 'Repair & paint',
            colorClass: 'bg-secondary-indigo'
        },
        { 
            value: CarConditionType.CHANGE_PIECE, 
            label: t ? t('conditionTypes.changePiece') : 'Change piece',
            colorClass: 'bg-secondary-pink'
        },
    ];
};