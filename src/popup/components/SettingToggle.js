import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateSettings} from '../actions/Settings.js';

const mapStateToProps = (state, ownProps) => {
  return {
    value: state.settings[ownProps.settingType],
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

class SettingToggle extends Component {
  static get propTypes() {
    return {
      settingType: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      value: PropTypes.bool.isRequired,
      updateSettings: PropTypes.func.isRequired,
    };
  }

  async onChangeCheckBox(event) {
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'updateSettings',
      settingType: this.props.settingType,
      value: event.target.checked,
    });
    this.props.updateSettings(event.target.checked);
  }

  render() {
    return (
      <div className='setting-toggle'>
        <input
          type='checkbox'
          checked={this.props.value}
          onChange={this.onChangeCheckBox.bind(this)} />
        <span>{this.props.message}</span>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingToggle);
