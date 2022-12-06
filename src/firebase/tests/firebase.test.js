import { describe, expect, test } from "@jest/globals";
import { DatabaseHandler, AuthHandler } from "../firebaseClients";
import { getAuth } from "firebase/auth";

var db = new DatabaseHandler();
var auth = new AuthHandler();
const testEmail = "test@test.com";
const testPassword = "test123";

describe("Test Authentication: ", () => {
  test("Checks if signed in user is authenticated", () => {
    return auth.signIn(testEmail, testPassword).then((usr) => {
      expect(!getAuth().currentUser).toBe(false);
    });
  });

  test("Checks if signed out user is authenticated", () => {
    return auth.signOut().then((usr) => {
      expect(getAuth().currentUser).toBe(null);
    });
  });
});

describe("Test Each Part of Database: ", () => {
  test("Pulls reading list and confirms correctness", () => {
    return auth.signIn(testEmail, testPassword).then((usr) => {
      return db.getReadingList(getAuth().currentUser.uid).then((rlData) => {
        expect(rlData).toStrictEqual({
          R7g6kdUxvR: {
            title: "Title 1",
            link: "Link 1",
          },
        });
      });
    });
  });

  test("Pulls jargon list and confirms correctness", () => {
    return auth.signIn(testEmail, testPassword).then((usr) => {
      db.getJargon(getAuth().currentUser.uid).then((jargonData) => {
        expect(jargonData).toStrictEqual({
          "3tCsFDwGkT": {
            word: "algorithm",
          },
        });
      });
    });
  });

  test("Pulls settings list and confirms correctness", () => {
    return auth.signIn(testEmail, testPassword).then((usr) => {
      db.getSettings(getAuth().currentUser.uid).then((settingData) => {
        expect(settingData).toStrictEqual({
          a47qPF9q0Z: {
            name: "Replace All Instances of Jargon",
            value: false,
          },
        });
      });
    });
  });
});
