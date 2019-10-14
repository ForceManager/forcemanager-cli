import React, { PureComponent } from 'react';
import { DatePicker as MaterialDatePicker } from '@material-ui/pickers';
import moment from 'moment';

import './style.scss';

class DatePicker extends PureComponent {
  state = { value: null, prevValue: null, reset: false };

  reset = false;

  componentDidMount() {
    const { value } = this.props;

    if (value) {
      this.setState({ value: moment(value, 'MM/DD/YYYY') });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.value && prevProps.value) {
      this.setState({ value: null });
    }
  }

  onOpen = () => {
    const { value } = this.state;

    this.setState({ prevValue: value });
  };

  onChange = (date) => {
    const { prevValue } = this.state;

    if (this.reset) {
      this.setState({ value: prevValue });
      this.reset = false;
    } else {
      this.setState({ value: date });
    }
  };

  onAccept = (date) => {
    const { onChange } = this.props;

    this.setState({ value: date });
    onChange(moment(date).format('MM/DD/YYYY'));
  };

  onClose = () => {
    this.reset = true;
  };

  render() {
    const { value } = this.state;
    const { readOnly, isReadOnly } = this.props;

    return (
      <MaterialDatePicker
        {...this.props}
        format="MM/DD/YYYY"
        invalidDateMessage={null}
        onOpen={this.onOpen}
        onChange={this.onChange}
        onAccept={this.onAccept}
        onClose={this.onClose}
        value={value}
        disabled={isReadOnly || readOnly}
      />
    );
  }
}

export default DatePicker;
