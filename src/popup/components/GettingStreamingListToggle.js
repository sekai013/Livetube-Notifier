import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {startGettingStreamingList, stopGettingStreamingList}
from '../actions/GettingStreamingList';

const mapStateToProps = (state, ownProps) => {
  return {
    gettingStreamingList: state.gettingStreamingList,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    startGettingStreamingList: () => {
      dispatch(startGettingStreamingList());
    },
    stopGettingStreamingList: () => {
      dispatch(stopGettingStreamingList());
    },
  };
};

class GettingStreamingListToggle extends Component {
  static get propTypes() {
    return {
      gettingStreamingList: PropTypes.bool.isRequired,
      startGettingStreamingList: PropTypes.func.isRequired,
      stopGettingStreamingList: PropTypes.func.isRequired,
    };
  }

  async onClickButton(event) {
    // TODO: await message to background
    const requestType = this.props.gettingStreamingList
        ? 'stopGettingStreamingList'
        : 'startGettingStreamingList';
    await chrome.runtime.sendMessage(chrome.runtime.id, {type: requestType});
    // TODO
    if (this.props.gettingStreamingList) {
      this.props.stopGettingStreamingList();
    } else {
      this.props.startGettingStreamingList();
    }
  }

  getButtonMessage() {
    return this.props.gettingStreamingList
        ? '配信取得停止'
        : '配信取得開始';
  }

  render() {
    return (
      <div className='getting-streaming-list-toggle'>
        <button className='btn btn-sm' onClick={this.onClickButton.bind(this)}>
          {this.getButtonMessage()}
        </button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GettingStreamingListToggle);
