export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Scan: undefined;
  Map: undefined;
  History: undefined;
  EduGuard: undefined;
};

export type ScanStackParamList = {
  ScanScreen: undefined;
  ScanResultScreen: { scanId: string };
  DetailedReportScreen: { scanId: string };
};

export type HistoryStackParamList = {
  HistoryScreen: undefined;
  DetailedReportScreen: { scanId: string };
};
