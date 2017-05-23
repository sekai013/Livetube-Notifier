import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {deleteKeyword, editKeyword} from '../actions/Keywords.js';

const mapStateToProps = (state, ownProps) => {
  return {
    keywordList: state.keywords[ownProps.keywordType],
    useHighServer: state.settings.useHighServer,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    deleteKeyword: (index) => {
      dispatch(deleteKeyword(ownProps.keywordType, index));
      chrome.runtime.sendMessage(chrome.runtime.id, {
        type: 'deleteKeyword',
        keyword: {
          type: ownProps.keywordType,
          index: index,
        },
      });
    },
    editKeyword: (index, value) => {
      dispatch(editKeyword(ownProps.keywordType, value, index));
    },
  };
};

class KeywordList extends Component {
  static get propTypes() {
    return {
      keywordType: PropTypes.string.isRequired,
      ItemClass: PropTypes.func.isRequired,
      keywordList: PropTypes.arrayOf(PropTypes.any).isRequired,
      useHighServer: PropTypes.bool.isRequired,
      deleteKeyword: PropTypes.func.isRequired,
      editKeyword: PropTypes.func.isRequired,
    };
  }

  render() {
    const {ItemClass} = this.props;
    const baseURL = this.getBaseURL();
    const itemToJSX = (item, i) =>
      <ItemClass
        key={i}
        deleteKeyword={this.props.deleteKeyword.bind(this, i)}
        editKeyword={this.props.editKeyword.bind(this, i)}
        baseURL={baseURL}
        index={i}
        {...item} />;
    const items = this.props.keywordList.map(itemToJSX);
    return (
      <div className='keyword-list'>
        {items}
      </div>
    );
  }

  getBaseURL() {
    const {keywordType, useHighServer} = this.props;
    const host = useHighServer ? 'http://h.livetube.cc' : 'http://livetube.cc';
    switch(keywordType) {
      case 'authors':
        return `${host}/`;
      case 'tags':
        return `${host}/tag.`;
      default:
        return null;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeywordList);
