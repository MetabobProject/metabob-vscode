import { createTheme } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles';

const shadows: ThemeOptions['shadows'] = [
  'none',
  '0px 2px 1px -1px rgba(19, 17, 32, 0.2), 0px 1px 1px 0px rgba(19, 17, 32, 0.14), 0px 1px 3px 0px rgba(19, 17, 32, 0.12)',
  '0px 3px 1px -2px rgba(19, 17, 32, 0.2), 0px 2px 2px 0px rgba(19, 17, 32, 0.14), 0px 1px 5px 0px rgba(19, 17, 32, 0.12)',
  '0px 4px 8px -4px rgba(19, 17, 32, 0.42)',
  '0px 6px 18px -8px rgba(19, 17, 32, 0.56)',
  '0px 3px 5px -1px rgba(19, 17, 32, 0.2), 0px 5px 8px rgba(19, 17, 32, 0.14), 0px 1px 14px rgba(19, 17, 32, 0.12)',
  '0px 2px 10px 0px rgba(19, 17, 32, 0.1)',
  '0px 4px 5px -2px rgba(19, 17, 32, 0.2), 0px 7px 10px 1px rgba(19, 17, 32, 0.14), 0px 2px 16px 1px rgba(19, 17, 32, 0.12)',
  '0px 5px 5px -3px rgba(19, 17, 32, 0.2), 0px 8px 10px 1px rgba(19, 17, 32, 0.14), 0px 3px 14px 2px rgba(19, 17, 32, 0.12)',
  '0px 5px 6px -3px rgba(19, 17, 32, 0.2), 0px 9px 12px 1px rgba(19, 17, 32, 0.14), 0px 3px 16px 2px rgba(19, 17, 32, 0.12)',
  '0px 6px 6px -3px rgba(19, 17, 32, 0.2), 0px 10px 14px 1px rgba(19, 17, 32, 0.14), 0px 4px 18px 3px rgba(19, 17, 32, 0.12)',
  '0px 6px 7px -4px rgba(19, 17, 32, 0.2), 0px 11px 15px 1px rgba(19, 17, 32, 0.14), 0px 4px 20px 3px rgba(19, 17, 32, 0.12)',
  '0px 7px 8px -4px rgba(19, 17, 32, 0.2), 0px 12px 17px 2px rgba(19, 17, 32, 0.14), 0px 5px 22px 4px rgba(19, 17, 32, 0.12)',
  '0px 7px 8px -4px rgba(19, 17, 32, 0.2), 0px 13px 19px 2px rgba(19, 17, 32, 0.14), 0px 5px 24px 4px rgba(19, 17, 32, 0.12)',
  '0px 7px 9px -4px rgba(19, 17, 32, 0.2), 0px 14px 21px 2px rgba(19, 17, 32, 0.14), 0px 5px 26px 4px rgba(19, 17, 32, 0.12)',
  '0px 8px 9px -5px rgba(19, 17, 32, 0.2), 0px 15px 22px 2px rgba(19, 17, 32, 0.14), 0px 6px 28px 5px rgba(19, 17, 32, 0.12)',
  '0px 8px 10px -5px rgba(19, 17, 32, 0.2), 0px 16px 24px 2px rgba(19, 17, 32, 0.14), 0px 6px 30px 5px rgba(19, 17, 32, 0.12)',
  '0px 8px 11px -5px rgba(19, 17, 32, 0.2), 0px 17px 26px 2px rgba(19, 17, 32, 0.14), 0px 6px 32px 5px rgba(19, 17, 32, 0.12)',
  '0px 9px 11px -5px rgba(19, 17, 32, 0.2), 0px 18px 28px 2px rgba(19, 17, 32, 0.14), 0px 7px 34px 6px rgba(19, 17, 32, 0.12)',
  '0px 9px 12px -6px rgba(19, 17, 32, 0.2), 0px 19px 29px 2px rgba(19, 17, 32, 0.14), 0px 7px 36px 6px rgba(19, 17, 32, 0.12)',
  '0px 10px 13px -6px rgba(19, 17, 32, 0.2), 0px 20px 31px 3px rgba(19, 17, 32, 0.14), 0px 8px 38px 7px rgba(19, 17, 32, 0.12)',
  '0px 10px 13px -6px rgba(19, 17, 32, 0.2), 0px 21px 33px 3px rgba(19, 17, 32, 0.14), 0px 8px 40px 7px rgba(19, 17, 32, 0.12)',
  '0px 10px 14px -6px rgba(19, 17, 32, 0.2), 0px 22px 35px 3px rgba(19, 17, 32, 0.14), 0px 8px 42px 7px rgba(19, 17, 32, 0.12)',
  '0px 11px 14px -7px rgba(19, 17, 32, 0.2), 0px 23px 36px 3px rgba(19, 17, 32, 0.14), 0px 9px 44px 8px rgba(19, 17, 32, 0.12)',
  '0px 11px 15px -7px rgba(19, 17, 32, 0.2), 0px 24px 38px 3px rgba(19, 17, 32, 0.14), 0px 9px 46px 8px rgba(19, 17, 32, 0.12)',
];

export const registerTheme = () => {
  const vscodeTheme = getComputedStyle(document.documentElement);
  const mainColor = vscodeTheme.getPropertyValue('--vscode-input-foreground');
  const backgroundDefault = vscodeTheme.getPropertyValue('--vscode-input-background');

  const themeOptions: ThemeOptions = {
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          },
        },
      },
    },
    palette: {
      common: {
        black: '#000',
        white: '#FFF',
      },
      mode: 'dark',
      primary: {
        light: '#9E69FD',
        main: '#1360C4',
        dark: '#1360C4,',
        contrastText: '#FFF',
      },
      secondary: {
        light: '#9C9FA4',
        main: '#8A8D93',
        dark: '#777B82',
        contrastText: '#FFF',
      },
      success: {
        light: '#6AD01F',
        main: '#56CA00',
        dark: '#4CB200',
        contrastText: '#FFF',
      },
      error: {
        light: '#FF6166',
        main: '#FF4C51',
        dark: '#E04347',
        contrastText: '#FFF',
      },
      warning: {
        light: '#FFCA64',
        main: '#FFB400',
        dark: '#E09E00',
        contrastText: '#FFF',
      },
      info: {
        light: '#32BAFF',
        main: '#16B1FF',
        dark: '#139CE0',
        contrastText: '#FFF',
      },
      grey: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#D5D5D5',
        A200: '#AAAAAA',
        A400: '#616161',
        A700: '#303030',
      },
      text: {
        primary: `rgba(${mainColor}, 0.87)`,
        secondary: `rgba(${mainColor}, 0.68)`,
        disabled: `rgba(#DCDCDC, 0.46)`,
      },
      divider: `rgba(${mainColor}, 0.12)`,
      background: {
        paper: '#312D4B',
        default: backgroundDefault,
      },
      action: {
        active: `rgba(#1360C4, 0.54)`,
        hover: `rgba(#1360C4, 0.04)`,
        selected: `rgba(#1360C4, 0.08)`,
        disabled: `rgba(#696969, 0.46)`,
        disabledBackground: `rgba(#696969, 0.18)`,
        focus: `rgba(#1360C4, 0.12)`,
      },
    },
    shadows: shadows,
    breakpoints: {
      values: {
        xs: 0,
        sm: 200,
        md: 400,
        lg: 600,
        xl: 800,
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'sans-serif',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      fontSize: 10,
      fontWeightLight: 200,
      fontWeightRegular: 300,
      fontWeightMedium: 300,
      fontWeightBold: 400,
    },
    spacing: (factor: number) => `${0.25 * factor}rem`,
    shape: {
      borderRadius: 6,
    },
    mixins: {
      toolbar: {
        minHeight: 64,
      },
    },
  };

  return themeOptions;
};
export const muiThemeDark = createTheme(registerTheme());
