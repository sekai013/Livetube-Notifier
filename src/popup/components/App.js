import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateMainTab} from '../actions/MainTab.js';
import StreamingListBox from './StreamingListBox.js';
import KeywordListBox from './KeywordListBox.js';

const mapStateToProps = (state, ownProps) => {
  return {
    mainTab: state.mainTab,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateMainTab: (tab) => {
      dispatch(updateMainTab(tab));
    },
  };
};

class App extends Component {
  static get propTypes() {
    return {
      mainTab: PropTypes.string.isRequired,
      updateMainTab: PropTypes.func.isRequired,
    };
  }

  onClickStreaming(event) {
    this.props.updateMainTab('streaming');
    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'initializePopup'});
  }

  onClickKeywords(event) {
    this.props.updateMainTab('keywords');
  }

  render() {
    const {mainTab} = this.props;
    return (
      <div className='app'>
        <ul className='nav nav-tabs'>
          <li role='presentation'
              className={mainTab === 'streaming' ? 'active' : ''}>
            <a href='#streaming' onClick={this.onClickStreaming.bind(this)}>
              配信一覧
            </a>
          </li>
          <li role='presentation'
              className={mainTab === 'keywords' ? 'active' : ''}>
            <a href='#keyword' onClick={this.onClickKeywords.bind(this)}>
              キーワード一覧
            </a>
          </li>
        </ul>
        {mainTab === 'streaming' ? <StreamingListBox /> : <KeywordListBox />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
