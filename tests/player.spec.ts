import { clipDuration } from '../src/utils/player';

test('clipDuration.', async () => {
  const samples = ['00:16:19:21', '01:16:19:21', '01:16:59:21'];
  const ret = samples.map((sample) => clipDuration(sample));
  const ans = ['16:20', '76:20', '76:59'];
  expect(ret).toEqual(ans);
});
