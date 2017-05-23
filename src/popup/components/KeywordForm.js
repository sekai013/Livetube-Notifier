import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {addKeyword} from '../actions/Keywords.js';

const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addKeyword: (text) => {
      const value = ownProps.keywordType === 'authors'
                ? {text, compare: 'include'}
                : {text};
      dispatch(addKeyword(ownProps.keywordType, value));
    },
  };
};

class KeywordForm extends Component {
  constructor(props) {
    super(props);
    this.state = {keyword: ''};
  }

  static get propTypes() {
    return {
      keywordType: PropTypes.string.isRequired,
      addKeyword: PropTypes.func.isRequired,
    };
  }

  onChangeKeyword(event) {
    this.setState({keyword: event.target.value});
  }

  async onClickButton(event) {
    const {keyword} = this.state;
    if (keyword) {
      const value = this.props.keywordType === 'authors'
                  ? {text: keyword, compare: 'include'}
                  : {text: keyword};
      chrome.runtime.sendMessage(chrome.runtime.id, {
        type: 'addKeyword',
        keyword: {
          type: this.props.keywordType,
          value,
        },
      });
      this.props.addKeyword(keyword);
      this.setState({keyword: ''});
    }
  }

  render() {
    return (
      <div className='keyword-form'>
        <input
          className='form-control'
          value={this.state.keyword}
          onChange={this.onChangeKeyword.bind(this)} />
        <button
          className='btn btn-sm form-group'
          onClick={this.onClickButton.bind(this)}>
          追加
        </button>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeywordForm);
