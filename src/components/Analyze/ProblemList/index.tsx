import { Box, Grid, Button, List, ListItem, Typography, useTheme } from '@mui/material';
import {
  ListHeaderTypography,
  ListContainer,
  ListItemStyles,
  ListItemTypography,
  ListItemButton,
  ProblemListContainer,
  ProblemListHeading,
  ButtonGrid,
} from './styles';
import { useCallback } from 'react';

export interface ProblemsListProps {
  detectedProblems?: number;
  otherFileWithProblems?: Array<{ name: string, path: string }>;
  isEmptyIdentifiedProblemDetected: boolean;
}

export const ProblemList = ({
  otherFileWithProblems,
  detectedProblems,
  isEmptyIdentifiedProblemDetected,
}: ProblemsListProps): JSX.Element => {
  const theme = useTheme();

  const handleOpenOtherFile: (path: string) => React.MouseEventHandler = useCallback(
    (path: string) => e => {
      e.preventDefault();
      vscode.postMessage({
        type: 'OPEN_FILE_IN_NEW_TAB',
        data: { path },
      });
    },
    [],
  );

  return (
    <>
      <Box data-testid='problem-list' sx={ProblemListContainer(theme)}>
        {detectedProblems !== undefined && detectedProblems !== 0 && (
          <Typography variant='h6' sx={ProblemListHeading(theme)}>
            {detectedProblems} Problems Detected
          </Typography>
        )}

        {isEmptyIdentifiedProblemDetected === true && (
          <Typography variant='h6' sx={ProblemListHeading(theme)}>
            No Problems Detected
          </Typography>
        )}

        {otherFileWithProblems && otherFileWithProblems.length > 0 && (
          <>
            <Typography sx={ListHeaderTypography}>Other files with problems</Typography>
            <List sx={ListContainer}>
              {otherFileWithProblems.map(item => {
                return (
                  <ListItem key={item.name} sx={ListItemStyles}>
                    <Grid
                      container
                      spacing={theme.spacing(0.1)}
                      direction='row'
                      justifyContent='space-evenly'
                      alignItems='center'
                    >
                      <Grid item xs={7}>
                        <Typography variant='body2' sx={ListItemTypography} noWrap>
                          {item.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sx={ButtonGrid}>
                        <Button
                          sx={ListItemButton}
                          size='small'
                          variant='contained'
                          color='primary'
                          onClick={handleOpenOtherFile(item.path)}
                        >
                          Open
                        </Button>
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Box>
    </>
  );
};
