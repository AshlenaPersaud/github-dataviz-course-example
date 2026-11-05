
function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("sketch-holder");
}

function draw() {
  background(255, 225, 230);

  // Colors
  let rosePink = color(232, 100, 168);
  let deepPink = color(232, 50, 100);
  let babiePink = color(255, 225, 230);

  // Clock hands
  let h = map(hour() % 12 + minute() / 60, 0, 12, 0, TWO_PI);
  let m = map(minute() + second() / 60, 0, 60, 0, TWO_PI);
  let s = map(second(), 0, 60, 0, TWO_PI);

  // Hand lengths
  let radius = min(600, 400) / 2;
  let sRadius = radius * 0.71;
  let mRadius = radius * 0.6;
  let hRadius = radius * 0.5;

  // Center of clock
  translate(300, 200);

  // Outer circle
  stroke(rosePink);
  strokeWeight(3);
  fill(babiePink);
  ellipse(0, 0, 300, 300);

  // Center circle
  noStroke();
  fill(deepPink);
  ellipse(0, 0, 10, 10);

  // Clock numbers
  push();
  fill(deepPink);
  textSize(18);
  textAlign(CENTER, CENTER);

  for (let num = 1; num <= 12; num++) {
    let angle = num * TWO_PI / 12 - HALF_PI;
    let x = cos(angle) * 120;
    let y = sin(angle) * 120;

    text(num, x, y);
  }
  pop();

  // Second hand
  push();
  rotate(s);
  stroke(deepPink);
  strokeWeight(1);
  line(0, 0, 0, -sRadius);
  pop();

  // Minute hand
  push();
  rotate(m);
  stroke(deepPink);
  strokeWeight(2);
  line(0, 0, 0, -mRadius);
  pop();

  // Hour hand
  push();
  rotate(h);
  stroke(deepPink);
  strokeWeight(4);
  line(0, 0, 0, -hRadius);
  pop();

  // Second tick marks
  push();
  stroke(deepPink);
  strokeWeight(2);

  for (let ticks = 0; ticks < 60; ticks++) {
    line(0, -140, 0, -145);
    rotate(TWO_PI / 60);
  }
  pop();
}
