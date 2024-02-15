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
  otherFileWithProblems?: Array<{ name: string }>;
}

export const ProblemList = ({
  otherFileWithProblems,
  detectedProblems,
}: ProblemsListProps): JSX.Element => {
  const theme = useTheme();

  const handleOpenOtherFile: (name: string) => React.MouseEventHandler = useCallback(
    (name: string) => e => {
      e.preventDefault();
      vscode.postMessage({
        type: 'OPEN_FILE_IN_NEW_TAB',
        data: { name },
      });
    },
    [],
  );

  return (
    <>
      <Box sx={ProblemListContainer(theme)}>
        {detectedProblems !== undefined && (
          <Typography variant='h6' sx={ProblemListHeading(theme)}>
            {detectedProblems} Problems Detected
          </Typography>
        )}

        {otherFileWithProblems && otherFileWithProblems.length > 0 && (
          <>
            <Typography sx={ListHeaderTypography}>Other files with problems</Typography>
            <List sx={ListContainer}>
              {otherFileWithProblems.map((item, index) => {
                return (
                  <>
                    <ListItem key={index} sx={ListItemStyles}>
                      <Grid
                        container
                        spacing={theme.spacing(2)}
                        direction='row'
                        justifyContent='space-evenly'
                        alignItems='center'
                      >
                        <Grid item xs={8}>
                          <Typography variant='body1' sx={ListItemTypography} noWrap>
                            {item.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sx={ButtonGrid}>
                          <Button
                            sx={ListItemButton}
                            size='small'
                            variant='contained'
                            color='primary'
                            onClick={handleOpenOtherFile(item.name)}
                          >
                            Open
                          </Button>
                        </Grid>
                      </Grid>
                    </ListItem>
                  </>
                );
              })}
            </List>
          </>
        )}
      </Box>
    </>
  );
};
