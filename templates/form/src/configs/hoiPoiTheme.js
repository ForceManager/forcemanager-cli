import { createHoiPoiTheme } from 'hoi-poi-ui';

const hoiPoiTheme = createHoiPoiTheme({
  overrides: {
    Section: {
      backgroundColor: 'red',
      root: {
        backgroundColor: 'blue',
      },
      '&signatures': {
        Input: {
          postComponent: {
            position: 'absolute',
            top: '10px',
            left: '10px',
          },
          postCloseComponent: {
            height: '15px',
            width: '15px',
          },
        },
      },
    },
  },
  props: {},
});

export default hoiPoiTheme;
