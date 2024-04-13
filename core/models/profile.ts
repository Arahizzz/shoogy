export interface Profile {
  id: string;
  name: string;
  insulinSensitivity: number;
  carbSensitivity: number;
}

export interface ProfileSettings {
  selectedProfileId: string;
}
