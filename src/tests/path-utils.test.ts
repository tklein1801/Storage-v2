import { preparePath } from '../utils/path.utils';

describe('preparePaths', () => {
  test('/ = ""', () => {
    expect(preparePath('/')).toBe('');
  });

  test('./ = ""', () => {
    expect(preparePath('./')).toBe('');
  });

  test('./dir/ = dir/', () => {
    expect(preparePath('./dir/')).toBe('dir/');
  });

  test('/dir/ = ""', () => {
    expect(preparePath('/dir/')).toBe('dir/');
  });

  test('dir/another/ = dir/another/', () => {
    expect(preparePath('dir/another/')).toBe('dir/another/');
  });

  test('./dir/another/ = dir/another/', () => {
    expect(preparePath('./dir/another/')).toBe('dir/another/');
  });

  test('dir/another = dir/another/', () => {
    expect(preparePath('dir/another')).toBe('dir/another/');
  });

  test('./dir/another = dir/another/', () => {
    expect(preparePath('dir/another')).toBe('dir/another/');
  });

  test('./dir/another/test.json = dir/another/', () => {
    expect(preparePath('./dir/another/test.json')).toBe('dir/another/');
  });

  test('/dir/another/test.json = dir/another/', () => {
    expect(preparePath('/dir/another/test.json')).toBe('dir/another/');
  });

  test('dir/another/test.json = dir/another/', () => {
    expect(preparePath('dir/another/test.json')).toBe('dir/another/');
  });
});
