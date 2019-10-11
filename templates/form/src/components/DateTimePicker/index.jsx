import React, { PureComponent } from 'react';
import { DateTimePicker as MaterialDateTimePicker } from '@material-ui/pickers';
import moment from 'moment';

import './style.scss';

class DateTimePicker extends PureComponent {
  state = { value: null, prevValue: null, reset: false };

  reset = false;

  componentDidMount() {
    const { value } = this.props;

    if (value) {
      this.setState({ value: moment(value, 'MM/DD/YYYY HH:mm A') });
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
    onChange(moment(date).format('MM/DD/YYYY HH:mm A'));
  };

  onClose = () => {
    this.reset = true;
  };

  render() {
    const { value } = this.state;
    const { readOnly, isReadOnly } = this.props;

    if (!value) {
      return null;
    }
    return (
      <MaterialDateTimePicker
        {...this.props}
        format="MM/DD/YYYY hh:mm A"
        minutesStep={30}
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

export default DateTimePicker;
