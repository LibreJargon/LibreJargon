import { DatabaseHandler } from "../firebase/firebaseClients";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { nonce } from "./utils";

//Default Settings Here that Also Determines Setting Structure
const settings = [["Replace All Instances of Jargon", true]];

//TODO could possibly erase settings if settings were removed from middle
function pullSettingsList() {
  if (self.user) {
    const uid = self.user.uid;
    var counter = 0;
    self.dbHandler.getSettings(uid).then((settingsList) => {
      for (var i of Object.keys(settingsList)) {
        if (counter >= settings.length) {
          self.dbHandler.rmSettingFromList(self.user.uid, i);
        } else {
          if (settingsList[i].name == settings[counter][0]) {
            renderSettingsItem(settingsList[i].name, settingsList[i].value, i);
          } else {
            const file = {
              name: settings[counter][0],
              value: settings[counter][1],
            };
            self.dbHandler.changeSetting(self.user.uid, i, file);
            renderSettingsItem(settings[counter][0], settings[counter][1], i);
          }
        }
        counter++;
      }
      while (counter < settings.length) {
        const file = {
          name: settings[counter][0],
          value: settings[counter][1],
        };
        counter++;
        self.dbHandler.addToSettingsList(file, self.user.uid, nonce(10));
      }
    });
  }
}

function renderSettingsItem(name, value, id) {
  var ul = document.getElementById("settings-list");
  var li = document.createElement("li");
  li.className = "rl-li";
  var changeBtn = document.createElement("button");
  changeBtn.className = "icons";

  if (value == true) {
    changeBtn.textContent = "\u2713";
  } else {
    changeBtn.textContent = "X";
  }

  changeBtn.addEventListener("click", () => {
    const liToChange = document.getElementById(id);

    var changeBtn = liToChange.childNodes[0];
    var title = liToChange.childNodes[1].title;

    var value;
    if (changeBtn.textContent == "X") {
      changeBtn.textContent = "\u2713";
      value = true;
    } else {
      changeBtn.textContent = "X";
      value = false;
    }
    const file = {
      name: title,
      value: value,
    };
    self.dbHandler.changeSetting(self.user.uid, id, file);
  });

  var titlep = document.createElement("a");
  titlep.appendChild(document.createTextNode(name));
  titlep.title = name;
  li.id = id;
  li.appendChild(changeBtn);
  li.appendChild(titlep);
  ul.appendChild(li);
}

export { settings, pullSettingsList, renderSettingsItem };
