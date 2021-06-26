import { SuitToStringPipe } from './suit-to-string.pipe';

describe('SuitToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new SuitToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
