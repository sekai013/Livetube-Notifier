import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import StreamingItem from './StreamingItem.js';

const mapStateToProps = (state, ownProps) => {
  return {
    streamingList: state.streamingList,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

class StreamingList extends Component {
  static get propTypes() {
    const streamingShape = PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    });
    return {
      streamingList: PropTypes.arrayOf(streamingShape).isRequired,
    };
  }

  render() {
    const streamingToJSX = (item, i) => <StreamingItem key={i} {...item} />;
    const items = this.props.streamingList.map(streamingToJSX);
    return (
      <div className='streaming-list'>
        {items}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreamingList);
