import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  push,
  onValue,
  update,
  ref,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://endorsement-project-b2320-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementsInDB = ref(database, "endorsements");

const textfieldEl = document.getElementById("endorsement-input");
const fromInputEl = document.getElementById("from-input");
const toInputEl = document.getElementById("to-input");
const publishBtnEl = document.getElementById("publish-btn");
const endorsementsEl = document.getElementById("endorsements-wrapper");

publishBtnEl.addEventListener("click", function () {
  let textInput = textfieldEl.value;
  let fromInput = fromInputEl.value;
  let toInput = toInputEl.value;

  push(endorsementsInDB, {
    text: textInput,
    from: fromInput,
    to: toInput,
    likes: 0,
  });

  clearInputs();
});

onValue(endorsementsInDB, function (snapshot) {
  if (snapshot.exists()) {
    clearEndorsements();

    let endorsementsObjArray = Object.entries(snapshot.val());

    endorsementsObjArray.forEach(function (item) {
      appendNewEndorsementDiv(item[1], item[0]);
    });
  } else {
    endorsementsEl.innerHTML = "<p>There are no messages here...</p>";
  }
});

function clearInputs() {
  textfieldEl.value = fromInputEl.value = toInputEl.value = "";
}

function clearEndorsements() {
  endorsementsEl.innerHTML = "";
}

function appendNewEndorsementDiv(itemValues, itemKey) {
  let endorsementText = itemValues.text;
  let endorsementFrom = itemValues.from;
  let endorsementTo = itemValues.to;
  let endorsementLikes = itemValues.likes;

  const outerDiv = document.createElement("div");

  const toHeading = document.createElement("h3");
  toHeading.textContent = `To ${endorsementTo}`;

  const endorsementParagraph = document.createElement("p");
  endorsementParagraph.className = "endorsement-text";
  endorsementParagraph.textContent = endorsementText;

  const flexRowDiv = document.createElement("div");
  flexRowDiv.className = "flex-row";

  const fromHeading = document.createElement("h4");
  fromHeading.textContent = `From ${endorsementFrom}`;

  const likeButton = document.createElement("button");
  likeButton.className = "like-btn";
  likeButton.textContent = `❤ ${endorsementLikes}`;

  const localStorageKey = `endorsement_${itemKey}`;
  const storedData = JSON.parse(localStorage.getItem(localStorageKey));
  if (storedData) {
    if (storedData.endorsed) {
      likeButton.disabled = true;
      likeButton.classList.add("red-text");
    }
  }

  likeButton.addEventListener("click", function () {
    if (!likeButton.disabled) {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          endorsed: true,
        })
      );

      likeButton.disabled = true;
      updateLikes(itemKey, endorsementLikes);
    }
  });

  flexRowDiv.appendChild(fromHeading);
  flexRowDiv.appendChild(likeButton);

  outerDiv.append(toHeading);
  outerDiv.append(endorsementParagraph);
  outerDiv.append(flexRowDiv);

  endorsementsEl.appendChild(outerDiv);
}

function updateLikes(itemKey, currentLikes) {
  const endorsementRef = ref(database, `endorsements/${itemKey}`);
  const updatedLikes = currentLikes + 1;

  update(endorsementRef, { likes: updatedLikes });
}
