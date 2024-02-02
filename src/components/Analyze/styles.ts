import { SxProps, Theme } from '@mui/material';

export const AnalyzePageButtonHeader: SxProps = {
  alignSelf: 'flex-end',
};

export const AnalyzePageSvgContainer: SxProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '120px',
};

export const AnalyzePageBodyContainer: (theme: Theme) => SxProps = theme => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(20),
});
