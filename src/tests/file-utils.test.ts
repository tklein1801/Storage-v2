import type { IFile, IFolder } from '../types/store.interface';
import {
  getFilenameFromFile,
  getFileExtensionFromFile,
  getPathFromFile,
} from '../utils/file.utils';

describe('getFilenameFromFile', () => {
  test('Code_RCoQWXePjH.png = png', () => {
    expect(getFilenameFromFile({ name: 'Code_RCoQWXePjH.png' } as IFile)).toBe('Code_RCoQWXePjH');
  });

  test('me1.jpg = me1', () => {
    expect(getFilenameFromFile({ name: 'me1.jpg' } as IFile)).toBe('me1');
  });

  test('Code_vF6XC.5kLuG.png = Code_vF6XC.5kLuG', () => {
    expect(getFilenameFromFile({ name: 'Code_vF6XC.5kLuG.png' } as IFile)).toBe('Code_vF6XC.5kLuG');
  });
});

describe('getFileExtensionFromFile', () => {
  test('Code_RCoQWXePjH.png = png', () => {
    expect(getFileExtensionFromFile('FILE', { name: 'Code_RCoQWXePjH.png' } as IFile)).toBe('png');
  });

  test('me1.jpg = jpb', () => {
    expect(getFileExtensionFromFile('FILE', { name: 'me1.jpg' } as IFile)).toBe('jpg');
  });

  test('Code_vF6XC.5kLuG.png = png', () => {
    expect(getFileExtensionFromFile('FILE', { name: 'Code_vF6XC.5kLuG.png' } as IFile)).toBe('png');
  });

  test('Work = Work', () => {
    expect(getFileExtensionFromFile('FOLDER', { name: 'Work' } as IFolder)).toBe('');
  });

  test('Te.st = Te.st', () => {
    expect(getFileExtensionFromFile('FOLDER', { name: 'Te.st' } as IFolder)).toBe('');
  });
});

describe('getPathFromFile', () => {
  test('Work.png = Length of 1', () => {
    expect(getPathFromFile({ path: 'Work.png' } as IFile)).toHaveLength(1);
  });

  test('Work.png = ""', () => {
    expect(getPathFromFile({ path: 'Work.png' } as IFile)[0]).toBe('');
  });

  test('Work.png = [""]', () => {
    expect(new Set(getPathFromFile({ path: 'Work.png' } as IFile))).toEqual(new Set(['']));
  });

  test('Images/Work.png = Length of 1', () => {
    expect(getPathFromFile({ path: 'Images/Work.png' } as IFile)).toHaveLength(1);
  });

  test('Images/Work.png = Images', () => {
    expect(getPathFromFile({ path: 'Images/Work.png' } as IFile)[0]).toBe('Images');
  });

  test('Work.png = ["Images"]', () => {
    expect(new Set(getPathFromFile({ path: 'Images/Work.png' } as IFile))).toEqual(
      new Set(['Images'])
    );
  });

  test('Images/Work/Work.png = ["Images", "Work"]', () => {
    expect(new Set(getPathFromFile({ path: 'Images/Work/Work.png' } as IFile))).toEqual(
      new Set(['Images', 'Work'])
    );
  });

  test('Images/Work/ = ["Images", "Work"]', () => {
    expect(new Set(getPathFromFile({ path: 'Images/Work/' } as IFile))).toEqual(
      new Set(['Images', 'Work'])
    );
  });
});
