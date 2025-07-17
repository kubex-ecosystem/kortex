import { Timezone, Theme } from ".";
import { Language } from "./SettingsTypes";

export interface AppSettings {
  language: Language;
  timezone: Timezone;
  autoReload: boolean;
  defaultTheme: Theme;
  notifications: boolean;
  emailReports: boolean;
  logRetentionDays: number;
  refreshInterval: number;
}