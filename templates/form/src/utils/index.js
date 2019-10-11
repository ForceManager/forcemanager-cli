const utils = {
  formatEntityList: function(entity, data) {
    return data.map((el) => {
      switch (entity) {
        case 'contacts':
          return {
            value: el.id,
            label: `${el.firstName || el.nombre} ${el.lastName || el.apellidos}`,
          };
        default:
          return el;
      }
    });
  },
};

export default utils;
