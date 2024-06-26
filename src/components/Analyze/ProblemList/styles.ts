import { SxProps, Theme } from '@mui/material';

export const ListHeaderTypography: SxProps = {
  fontWeight: '600',
  textAlign: 'center',
};

export const ListContainer: SxProps = {
  marginLeft: -2,
  height: '200px',
  overflowY: 'scroll',
  width: '120%',
};

export const ListItemStyles: SxProps = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 8px',
};

export const ListItemTypography: SxProps = {
  alignContent: 'flex-start',
};

export const ListItemButton: SxProps = {
  alignContent: 'flex-end',
};

export const ProblemListContainer: (theme: Theme) => SxProps = theme => ({
  textAlign: 'center',
  marginTop: theme.spacing(20),
  marginBottom: theme.spacing(20),
});

export const ProblemListHeading: (theme: Theme) => SxProps = theme => ({
  marginBottom: theme.spacing(10),
  fontWeight: '600',
  textAlign: 'center',
});

export const ButtonGrid: SxProps = {
  textAlign: 'right',
};
