const body = document.getElementsByTagName("body")[0];

function setColor(name) {
  body.style.backgroundColor = name;
}

function randomColor() {
  const red = Math.round(Math.random() * 255);
  const green = Math.round(Math.random() * 255);
  const blue = Math.round(Math.random() * 255);

  const color = `rgb(${red}, ${green}, ${blue})`;
  body.style.backgroundColor = color;
}

randomColor();
// Reference
// https://www.youtube.com/watch?v=2ml4x0rO1PQ
// https://github.com/techwithtim/5-Mini-JS-Projects-for-Beginners
