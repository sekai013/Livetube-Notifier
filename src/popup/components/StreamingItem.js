import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  return {
    useHighServer: state.settings.useHighServer,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

class StreamingItem extends Component {
  static get propTypes() {
    return {
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      useHighServer: PropTypes.bool.isRequired,
    };
  }

  getHostURL() {
    return this.props.useHighServer
        ? 'http://h.livetube.cc/'
        : 'http://livetube.cc/';
  }

  render() {
    const hostURL = this.getHostURL();
    const tagToJSX = (tag, i) =>
      <a key={i} href={`${hostURL}tag.${tag}`} target='_blank'>{tag}</a>;
    const insertComma = (previous, current, i) => {
      return i === 0
          ? [current]
          : [...previous, (<span key={`${i}-s`}>, </span>), current];
    };
    const tags = this.props.tags.map(tagToJSX).reduce(insertComma, null);
    return (
      <div className='streaming-item panel panel-default'>
        <div className='panel-body'>
          <div className='row'>
            <div className='col-xs-3'>配信名:</div>
            <div className='col-xs-9'>
              <a href={`${hostURL}${this.props.link}`} target='_blank'>
                {this.props.title}
              </a>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-3'>配信者名:</div>
            <div className='col-xs-9'>
              <a href={`${hostURL}${this.props.author}`} target='_blank'>
                {this.props.author}
              </a>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-3'>タグ:</div>
            <div className='col-xs-9'>
              {tags}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreamingItem);
