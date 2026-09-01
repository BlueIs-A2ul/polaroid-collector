export type RootStackParamList = {
  Home: undefined
  Upload: { idolName?: string }
  Detail: { idolName: string }
  Edit: { recordId: string }
  Statistics: undefined
  Calendar: undefined
  ThemeSettings: undefined
  YearlyReport: undefined
  IdolReport: { idolName: string; avatarUri?: string | null }
  OrganizationCenter: undefined
}
