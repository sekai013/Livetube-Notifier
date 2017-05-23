import React, {Component} from 'react';
import PropTypes from 'prop-types';

class KeywordItem extends Component {
  static get propTypes() {
    return {
      text: PropTypes.string.isRequired,
      deleteKeyword: PropTypes.func.isRequired,
      baseURL: PropTypes.string,
      index: PropTypes.number.isRequired,
    };
  }

  onClickDelete(event) {
    this.props.deleteKeyword();
  }

  render() {
    return (
      <div className='keyword-item row'>
        <div className='col-xs-10'>
          {this.getTextNode()}
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

  getTextNode() {
    const {baseURL, text} = this.props;
    return baseURL
      ? <a href={`${baseURL}${text}`} target='_blank'>{text}</a>
      : <span>{text}</span>;
  }
}

export default KeywordItem;
