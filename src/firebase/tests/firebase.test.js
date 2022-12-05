import {describe, expect, test} from '@jest/globals';
import { DatabaseHandler, AuthHandler } from '../firebaseClients'
import { getAuth } from 'firebase/auth';

const db = new DatabaseHandler()
const auth = new AuthHandler()
const testEmail = 'test@test.com'
const testPassword = 'test123'

describe('Test Auth Sign In: ', () => {
  test('Checks if user is authenticated', () => {
    auth.signIn(testEmail, testPassword)
      .then((usr) => {
        expect(!getAuth().currentUser).toBe(false);
      })
  });
});

describe('Test Reading List: ', () => {
  test('Pulls reading list and confirms correctness', () => {
    auth.signIn(testEmail, testPassword)
    .then((usr) => {
      db.getReadingList(getAuth().currentUser.uid)
      .then((rlData) => {
        expect(rlData).toBe({
          'R7g6kdUxvR' : {
            link: 'Link 1',
            title: 'Title 1'
          }
        });
      })
  });
    })

});



describe('Test Auth Sign In: ', () => {
  test('Checks if user is authenticated', () => {
    auth.signOut()
      .then((usr) => {
        expect(getAuth().currentUser).toBe(null);
      })
  });
});
