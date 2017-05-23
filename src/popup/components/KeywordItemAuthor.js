import React from 'react';
import PropTypes from 'prop-types';
import KeywordItem from './KeywordItem.js';

class KeywordItemAuthor extends KeywordItem {
  static get propTypes() {
    return {
      text: PropTypes.string.isRequired,
      compare: PropTypes.string.isRequired,
      editKeyword: PropTypes.func.isRequired,
      deleteKeyword: PropTypes.func.isRequired,
      baseURL: PropTypes.string,
      index: PropTypes.number.isRequired,
    };
  }

  async onChangeCheckBox(event) {
    const newValue = {
      text: this.props.text,
      compare: this.props.compare === 'include' ? 'equal' : 'include',
    };
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'editKeyword',
      keyword: {
        type: 'authors',
        value: newValue,
        index: this.props.index,
      },
    });
    this.props.editKeyword(newValue);
  }

  render() {
    return (
      <div className='keyword-item-author row'>
        <div className='col-xs-5'>
          {this.getTextNode()}
        </div>
        <div className='col-xs-5 text-center'>
          <input
            type='checkbox'
            checked={this.props.compare === 'include'}
            onChange={this.onChangeCheckBox.bind(this)} />
          <span>部分一致</span>
          <input
            type='checkbox'
            checked={this.props.compare === 'equal'}
            onChange={this.onChangeCheckBox.bind(this)} />
          <span>完全一致</span>
        </div>
        <div className='col-xs-2 text-center'>
          <button
            className='btn btn-xs'
            onClick={this.onClickDelete.bind(this)}>
            削除
          </button>
        </div>
      </div>
    );
  }
}

export default KeywordItemAuthor;
