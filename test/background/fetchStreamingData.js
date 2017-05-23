import 'babel-polyfill';
import test from 'ava';
import fetchMock from 'fetch-mock';
import fetchStreamingData from 'background/lib/fetchStreamingData.js';

const API_REGEXP = /http:\/\/([htz]\.)?livetube\.cc\/index\.live\.json/;
const DUMMY_STREAMING_DATA = [
  {
    id: 'aaaaaaaaaaaaa', /* [a-z0-9]{13} */
    link: '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A', /* encoded path */
    author: 'sekai013',
    title: 'amagami',
    viewing: 100,
    view: 300,
    comments: 500,
    created: 'Thu, 09 Feb 2017 19:32:13 GMT', /* date string */
    tags: [
      'betasaba',
      'game',
    ],
  },
];

test('fetch data form server', async (t) => {
  fetchMock.get(API_REGEXP, DUMMY_STREAMING_DATA);
  const streamingData = await fetchStreamingData();
  t.is(streamingData.length, 1);
  const data = streamingData[0];
  t.is(data.link, '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A');
  t.is(data.title, 'amagami');
  t.is(data.tags.length, 2);
  fetchMock.restore();
});
