import {describe, expect, test} from '@jest/globals';
import { nonce } from '../utils'



describe('Test Nonce: ', () => {
  test('checks Length is accurate', () => {
    expect(nonce(12).length).toBe(12);
  });
});
