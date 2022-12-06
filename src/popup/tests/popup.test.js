import {describe, expect, test} from '@jest/globals';
import { nonce } from '../utils'
import { getSuggestions } from '../suggestions';


// First test tests Nonce function for size
describe('Test Nonce: ', () => {
  test('checks Length is accurate', () => {
    expect(nonce(12).length).toBe(12);
  });
});
