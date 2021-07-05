import { ReplacePipe } from './replace.pipe';

describe('ReplacePipe', () => {
  const testString = 'this is the test string';
  const toReplaceArray = ['t', 'e'];
  const toReplaceWithArray = ['a', 'b'];

  it('create an instance', () => {
    const pipe = new ReplacePipe();
    expect(pipe).toBeTruthy();
  });

  it('string - string - false', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, 't', 'a')).toBe(testString.replace('t', 'a'));
  });

  it('string - string - true', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, 't', 'a', true)).toBe('ahis is ahe aesa saring');
  });

  it('string[] - string - false', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, toReplaceArray, 'a', false)).toBe(testString);
  });

  it('string[] - string - true', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, toReplaceArray, 'a', true)).toBe(testString);
  });

  it('string[] - string[] - false', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, toReplaceArray, toReplaceWithArray, false)).toBe(testString);
  });

  it('string[] - string[] - true', () => {
    const pipe = new ReplacePipe();
    expect(pipe.transform(testString, toReplaceArray, toReplaceWithArray, true)).toBe(testString);
  });
});
