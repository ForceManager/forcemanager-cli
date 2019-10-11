import React, { PureComponent } from 'react';
// import validator from 'validator';
import { Form } from 'hoi-poi-ui';

import './style.scss';

class FormValidator extends PureComponent {
  state = { errors: {}, validations: {} };

  validateField = (field, value) => {
    // const { schema, currentPage } = this.props;
  };

  onFormChange = (values, field, value) => {
    const { onChange } = this.props;

    this.validateField(field, value);
    onChange(values, field);
  };

  onFieldFocus = (values, field, value) => {
    const { onFocus } = this.props;

    onFocus(values, field, value);
  };

  render() {
    const { errors } = this.state;
    const { schema, values, customFields } = this.props;

    return (
      <Form
        onChange={this.onFormChange}
        onFocus={this.onFieldFocus}
        values={values}
        errors={errors}
        schema={schema}
        customFields={customFields}
      />
    );
  }
}

export default FormValidator;
