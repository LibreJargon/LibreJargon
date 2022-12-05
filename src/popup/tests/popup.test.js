import { nonce } from '../utils'
import {describe, expect, test} from '@jest/globals';


describe('Test Nonce: ', () => {
  test('checks Length is accurate', () => {
    expect(nonce(12)).toBe(12);
  });
});
