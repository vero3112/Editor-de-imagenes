const width = 320;
const height = 240;
let uploadedImage = null;
let isSelectingColor = false;
const downloadButton = $('#download-button');
const colorBox = $('#color-box');
const redSlider = $('#red-slider');
const redSliderP = $('#red-slider-p');
const greenSlider = $('#green-slider');
const greenSliderP = $('#green-slider-p');
const blueSlider = $('#blue-slider');
const blueSliderP = $('#blue-slider-p');
const presetSelect = $('#preset-select');
const toleranceSlider = $('#tolerance-slider');
const toleranceSliderP = $('#tolerance-slider-p');
let sc_r = 0, sc_g = 0, sc_b = 0;

redSliderP.text(redSlider.val());
redSlider.on('input', () => {
  let value = redSlider.val();
  redSliderP.text(value);
});
greenSliderP.text(greenSlider.val());
greenSlider.on('input', () => {
  let value = greenSlider.val();
  greenSliderP.text(value);
});
blueSliderP.text(blueSlider.val());
blueSlider.on('input', () => {
  let value = blueSlider.val();
  blueSliderP.text(value);
});
toleranceSliderP.text(toleranceSlider.val());
toleranceSlider.on('input', () => {
  let value = toleranceSlider.val();
  toleranceSliderP.text(value);
});

function setup() {
  createCanvas(width, height).parent('canvas-container');
  pixelDensity(1);
  const htmlDropzone = select('#dropzone');
  htmlDropzone.dragOver(function() {
    htmlDropzone.addClass('dragover');
  });
  htmlDropzone.dragLeave(function() {
    htmlDropzone.removeClass('dragover');
  });
  htmlDropzone.drop(function(file) {
    uploadedImage = loadImage(file.data);
    htmlDropzone.removeClass('dragover');
  });
}

function draw() {
  background(100, 0);
  console.log(mouseInCanvas());
  if(uploadedImage === null) return;
  let canvasRatio = width/height;
  let imageWidth = uploadedImage.width;
  let imageHeight = uploadedImage.height;
  let imageRatio = imageWidth/imageHeight;
  let x = 0, y = 0, w, h;
  if(imageRatio > canvasRatio) {
    w = width;
    h = w/imageRatio;
    y = (height - h)/2;
  } else {
    h = height;
    w = imageRatio * h;
    x = (width - w)/2;
  }
  image(uploadedImage, x, y, w, h);
  loadPixels();
  if(isSelectingColor && mouseInCanvas()) {
    x = Math.round(mouseX);
    y = Math.round(mouseY);
    let index = (y*width + x) * 4;
    sc_r = pixels[index];
    sc_g = pixels[index+1];
    sc_b = pixels[index+2];
    colorBox.css('background-color', `rgb(${sc_r}, ${sc_g}, ${sc_b})`);
  }
  if (presetSelect.val() === 'sc') singleColor(pixels);
  else if(presetSelect.val() === 'grayscale') grayscale(pixels);
  else if (presetSelect.val() === 'bw') bw(pixels);
  else if (presetSelect.val() === 'bubblegum') bubblegum(pixels);
  else defaultFilter(pixels);
  updatePixels();
}

downloadButton.click(function() {
  uploadedImage.loadPixels();
  let pixelBackup = [];
  for(let i = 0; i < uploadedImage.pixels.length; i++) {
    pixelBackup.push(uploadedImage.pixels[i]);
  }
  if (presetSelect.val() === 'sc') singleColor(uploadedImage.pixels);
  else if(presetSelect.val() === 'grayscale') grayscale(uploadedImage.pixels);
  else if (presetSelect.val() === 'bw') bw(uploadedImage.pixels);
  else if (presetSelect.val() === 'bubblegum') bubblegum(uploadedImage.pixels);
  else defaultFilter(uploadedImage.pixels);
  uploadedImage.updatePixels();
  save(uploadedImage, 'edit.png');
  uploadedImage.loadPixels();
  for(let i = 0; i < uploadedImage.pixels.length; i++) {
    uploadedImage.pixels[i] = pixelBackup[i];
  }
  uploadedImage.updatePixels();
});

colorBox.click(function() {
  isSelectingColor = true;
});

function mouseClicked() {
  if(mouseInCanvas()) isSelectingColor = false;
}

function mouseInCanvas() {
  if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) return true;
  else return false;
}

function singleColor(pixels) {
  for(let pixel = 0; pixel < pixels.length/4; pixel++) {
    let i = pixel * 4;
    let tolerance = Number(toleranceSlider.val());
    let difference = Math.abs(pixels[i] - sc_r) + Math.abs(pixels[i+1] - sc_g) + Math.abs(pixels[i+2] - sc_b);
    if(difference < tolerance) continue;
    let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    pixels[i] = average;
    pixels[i+1] = average;
    pixels[i+2] = average;
  }
}

function grayscale(pixels) {
  for(let pixel = 0; pixel < pixels.length/4; pixel++) {
    let i = pixel * 4;
    let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    pixels[i] = average;
    pixels[i+1] = average;
    pixels[i+2] = average;
  }
}

function bw(pixels) {
  for(let pixel = 0; pixel < pixels.length/4; pixel++) {
    let i = pixel * 4;
    let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    if(average > 127) {
      pixels[i] = 255;
      pixels[i+1] = 255;
      pixels[i+2] = 255;
    } else {
      pixels[i] = 0;
      pixels[i+1] = 0;
      pixels[i+2] = 0;
    }
  }
}

function bubblegum(pixels) {
  for(let pixel = 0; pixel < pixels.length/4; pixel++) {
    let i = pixel * 4;
    pixels[i] = 1.2 * pixels[i];
    pixels[i+1] = 0.7 * pixels[i+1];
    pixels[i+2] = 0.85 * pixels[i+2];
  }
}

function defaultFilter(pixels) {
  let r = Number(redSlider.val());
  let g = Number(greenSlider.val());
  let b = Number(blueSlider.val());
  for(let pixel = 0; pixel < pixels.length/4; pixel++) {
    let i = pixel * 4;
    pixels[i] = pixels[i] + r;
    pixels[i+1] = pixels[i+1] + g;
    pixels[i+2] = pixels[i+2] + b;
  }
}