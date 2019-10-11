import { createMuiTheme } from '@material-ui/core';

const materialTheme = createMuiTheme({
  overrides: {
    MuiFormControl: {
      root: {
        width: '100%',
      },
    },
    MuiPickersCalendarHeader: {
      iconButton: {
        '& > *': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiPickersToolbarText: {
      toolbarBtnSelected: {
        color: '#FFFFFF',
      },
      toolbarTxt: {
        color: '#FFFFFF',
      },
    },
    MuiPickersDay: {
      daySelected: {
        color: '#FFFFFF',
      },
    },
    MuiInput: {
      underline: {
        '&:before': {
          transition: 'border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          borderBottom: '1px solid #dce3eb',
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottom: '1px solid #dce3eb',
        },
        '&:after': {
          borderBottom: '1px solid #FF8C00',
        },
        '&.Mui-disabled:before': {
          borderBottomStyle: 'solid',
        },
      },
    },
    PrivateTabIndicator: {
      colorSecondary: {
        backgroundColor: 'rgba(0, 0, 0, 0.54)',
      },
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      light: '#FF8C00',
      main: '#FF8C00',
      dark: '#FF8C00',
    },
  },
  typography: {
    useNextVariants: true,
    fontSize: 13,
    fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

export default materialTheme;
