import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PVArrayConfig {
    panelCount: bigint;
    name: string;
    azimuthAngle: number;
    enabled: boolean;
    panelWattage: bigint;
    tiltAngle: number;
}
export interface Location {
    latitude: number;
    cityName: string;
    longitude: number;
}
export interface UserPreferences {
    preferredTab: string;
    unitSystem: string;
}
export type Time = bigint;
export interface NamedPreset {
    timestamp: Time;
    config: SystemConfig;
}
export interface CalibrationSettings {
    efficiencyMultiplier: number;
    soilingFactor: number;
    temperatureCoefficient: number;
}
export interface SystemConfig {
    arrays: Array<PVArrayConfig>;
    unitPreference: string;
    calibration: CalibrationSettings;
    co2EmissionFactor: number;
    electricityPrice: number;
    location: Location;
    systemName: string;
}
export interface backendInterface {
    getPreferences(): Promise<UserPreferences | null>;
    getPresets(): Promise<Array<[string, NamedPreset]>>;
    getSystemConfig(): Promise<SystemConfig | null>;
    getUserConfig(user: Principal): Promise<SystemConfig | null>;
    getUserPresets(user: Principal): Promise<Array<[string, NamedPreset]>>;
    savePreferences(preferences: UserPreferences): Promise<void>;
    savePreset(name: string, config: SystemConfig): Promise<void>;
    saveSystemConfig(config: SystemConfig): Promise<void>;
}
