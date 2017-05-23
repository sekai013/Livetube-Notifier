import React, {Component} from 'react';
import GettingStreamingListToggle from './GettingStreamingListToggle.js';
import SettingSelector from './SettingSelector.js';
import SettingToggle from './SettingToggle.js';
import StreamingList from './StreamingList.js';

const INTERVAL_OPTIONS = [
  {value: 1, text: '1'},
  {value: 3, text: '3'},
  {value: 5, text: '5'},
  {value: 10, text: '10'},
];

class StreamingListBox extends Component {
  render() {
    return (
      <div className='streaming-list-box'>
        <ul className='list-inline'>
          <li>
            <GettingStreamingListToggle />
          </li>
          <li>
            <SettingSelector
              settingType='updateStreamingInterval'
              message='配信通知間隔'
              options={INTERVAL_OPTIONS}
              unit='分'
              isNumber={true} />
          </li>
        </ul>
        <StreamingList />
        <ul className='list-inline'>
          <li>
            <SettingToggle
              settingType='useHighServer'
              message='h サーバで配信を開く' />
          </li>
          <li>
            <SettingToggle
              settingType='autoOpen'
              message='対象の配信が始まったら自動で開く' />
          </li>
        </ul>
      </div>
    );
  }
}

export default StreamingListBox;
