/* @flow */
type Streaming = {
  id: string,
  link: string,
  author: string,
  title: string,
  viewing: number,
  view: number,
  comments: number,
  created: string,
  tags: Array<string>,
};

const API_LIST : Array<string> = [
  'http://livetube.cc/index.live.json',
  'http://h.livetube.cc/index.live.json',
  'http://t.livetube.cc/index.live.json',
  'http://z.livetube.cc/index.live.json',
];

const sampling = (array: Array<any>): any => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const fetchStreamingData = (): Promise<Array<Streaming>> => {
  const api = sampling(API_LIST);
  return fetch(api).then((res) => res.json());
};

export default fetchStreamingData;
