const input = document.getElementById("input");

function reverseString(str) {
  return str.split("").reverse().join("");
}

function check() {
  const value = input.value;
  const reverse = reverseString(value);

  if (value === reverse) {
    alert("P A L I N D R O M E");
  } else {
    alert("Not today!");
  }

  input.value = "";
}
// Reference
// https://www.youtube.com/watch?v=2ml4x0rO1PQ
// https://github.com/techwithtim/5-Mini-JS-Projects-for-Beginners
