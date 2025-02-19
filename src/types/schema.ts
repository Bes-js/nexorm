export interface NexormSchema {
    allowNull?: boolean;
    autoIncrement?: boolean;
    defaultValue?: any;
    primaryKey?: boolean;
    unique?: boolean;
    index?: boolean;
    foreignKey?: boolean;
    references?: string;
    onUpdate?: string;
    onDelete?: string;
    type?: string;
    length?: number;
};