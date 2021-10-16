import { clipDurationString } from '../src/utils/player';

test('clipDurationString.', async () => {
  const samples = ['00:16:19:21', '01:16:19:21', '01:16:59:21', '00:00:00:12'];
  const ret = samples.map((sample) => clipDurationString(sample));
  const ans = ['16:20', '76:20', '76:59', '12f'];
  expect(ret).toEqual(ans);
});
