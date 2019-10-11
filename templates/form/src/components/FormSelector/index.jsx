import React from 'react';
import { Select } from 'hoi-poi-ui';

import './style.scss';

const FormSelector = ({ schema, selectedForm, onChange }) => {
  const options = Object.keys(schema).map((key) => {
    return { label: schema[key].title, value: schema[key].name };
  });

  const onFormChange = (formValues) => onChange(formValues);

  return (
    <div className="forms-select">
      <Select
        label="Form Type"
        placeholder="Select one"
        onChange={onFormChange}
        options={options}
        value={selectedForm}
      />
    </div>
  );
};

export default FormSelector;
