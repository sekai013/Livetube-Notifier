import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateKeywordTab} from '../actions/KeywordTab.js';
import KeywordForm from './KeywordForm.js';
import KeywordList from './KeywordList.js';
import KeywordItem from './KeywordItem.js';
import KeywordItemAuthor from './KeywordItemAuthor.js';

const TABS = [
  {type: 'titles', text: '配信名'},
  {type: 'authors', text: '配信者'},
  {type: 'tags', text: 'タグ'},
];

const mapStateToProps = (state, ownProps) => {
  return {
    keywords: state.keywords,
    keywordTab: state.keywordTab,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateKeywordTab: (tab) => {
      dispatch(updateKeywordTab(tab));
    },
  };
};

class KeywordListBox extends Component {
  static get propTypes() {
    return {
      keywords: PropTypes.shape({
        titles: PropTypes.arrayOf(PropTypes.shape({
          text: PropTypes.string.isRequired,
        })).isRequired,
        tags: PropTypes.arrayOf(PropTypes.shape({
          text: PropTypes.string.isRequired,
        })).isRequired,
        authors: PropTypes.arrayOf(PropTypes.shape({
          text: PropTypes.string.isRequired,
          compare: PropTypes.string.isRequired,
        })).isRequired,
      }).isRequired,
      keywordTab: PropTypes.string.isRequired,
      updateKeywordTab: PropTypes.func.isRequired,
    };
  }

  onClickTab(tabType, event) {
    this.props.updateKeywordTab(tabType);
  }

  render() {
    const {keywords, keywordTab} = this.props;
    const tabToJSX = (tab, i) => {
      return (tab.type === keywordTab)
          ? <li key={i} role='presentation' className='active'>
              <a href='#'>{tab.text}</a>
            </li>
          : <li
              key={i}
              role='presentation'
              onClick={this.onClickTab.bind(this, tab.type)}>
              <a href='#'>{tab.text}</a>
            </li>;
    };
    const itemClass = keywordTab === 'authors'
        ? KeywordItemAuthor
        : KeywordItem;
    return (
      <div className='keyword-list-box'>
        <ul className='nav nav-tabs'>
          {TABS.map(tabToJSX)}
        </ul>
        <KeywordForm keywordType={keywordTab} />
        <KeywordList
          keywordList={keywords[keywordTab]}
          keywordType={keywordTab}
          ItemClass={itemClass} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeywordListBox);
