import React from 'react';
import { Checkbox as HoiPoiCheckbox } from 'hoi-poi-ui';

import './style.scss';

function Checkbox({ summary, ...props }) {
  if (!summary) {
    return <HoiPoiCheckbox checked={props.value} {...props} />;
  }
  return (
    <div className="checkbox">
      <div className="checkbox-label">{props.label}</div>
      <HoiPoiCheckbox checked={props.value} {...props} />
    </div>
  );
}

export default Checkbox;
