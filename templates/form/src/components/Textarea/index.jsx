import React from 'react';

import './style.scss';

function Textarea({ ...props }) {
  return <textarea className="customTextarea" {...props} />;
}

export default Textarea;
