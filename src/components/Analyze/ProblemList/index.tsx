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

export interface ProblemsListProps {
  problems: Array<{ name: string }>;
}

export const ProblemList = ({ problems }: ProblemsListProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <Box sx={ProblemListContainer(theme)}>
        <Typography variant='h6' sx={ProblemListHeading(theme)}>
          {problems.length} Problems Detected
        </Typography>

        <Typography sx={ListHeaderTypography}>Other files with problems</Typography>
        <List sx={ListContainer}>
          {problems.map((item, index) => {
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
                      <Button sx={ListItemButton} size='small' variant='contained' color='primary'>
                        Open
                      </Button>
                    </Grid>
                  </Grid>
                </ListItem>
              </>
            );
          })}
        </List>
      </Box>
    </>
  );
};
