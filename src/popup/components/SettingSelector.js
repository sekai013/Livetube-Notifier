import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateSettings} from '../actions/Settings.js';

const mapStateToProps = (state, ownProps) => {
  return {
    selected: state.settings[ownProps.settingType],
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateSettings: (newValue) => {
      const newSettings = {[ownProps.settingType]: newValue};
      dispatch(updateSettings(newSettings));
    },
  };
};

class SettingSelector extends Component {
  static get propTypes() {
    const valueType = PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]);
    const optionType = PropTypes.shape({
      value: valueType,
      text: PropTypes.string.isRequired,
    });
    return {
      selected: valueType,
      updateSettings: PropTypes.func.isRequired,
      settingType: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(optionType).isRequired,
      unit: PropTypes.string.isRequired,
      isNumber: PropTypes.bool.isRequired,
    };
  }

  async onChangeSelector(event) {
    const value = this.props.isNumber
                ? +event.target.value
                : event.target.value;
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'updateSettings',
      settingType: this.props.settingType,
      value,
    });
    this.props.updateSettings(value);
  }

  render() {
    const optionToJSX = (option, i) => (
      <option key={i} value={option.value}>
        {option.text}
      </option>
    );
    const options = this.props.options.map(optionToJSX);
    return (
      <div className='setting-selector'>
        <span>{this.props.message}</span>
        <select value={this.props.selected}
                onChange={this.onChangeSelector.bind(this)}
                className='form-control selector'>
          {options}
        </select>
        <span>{this.props.unit}</span>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingSelector);
