import { SxProps, Theme } from '@mui/material';

export const AnalyzePageBodyContainer: (theme: Theme) => SxProps = theme => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(20),
});
