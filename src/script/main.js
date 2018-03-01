import '../scss/reset.scss';
import '../scss/main.scss';

import Jcrop from "jquery-jcrop"
import swal from 'sweetalert2'
import firebase from "firebase"

import Filter from "./Filter"

var crop_max_width = window.innerWidth * 0.5;
var crop_max_height = window.innerHeight * 0.5;
var jcrop_api;
var canvas;
var context;
var image, originalImage;
var filter_edited = false;

var prefsize;

init();

function init(){
	var config = {
	    apiKey: "AIzaSyDGH1msoXnr-xzW-hKLCMyXxaa6B9nRjAk",
	    authDomain: "imageditor-54955.firebaseapp.com",
	    databaseURL: "https://imageditor-54955.firebaseio.com",
	    projectId: "imageditor-54955",
	    storageBucket: "imageditor-54955.appspot.com",
	    messagingSenderId: "128661984266"
	  };
	firebase.initializeApp(config);

}

function firebaseUpload(file){
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var imagesRef = storageRef.child('images/user.png');

	var uploadTask = imagesRef.put(file);
	uploadTask.then(function(snapshot) {
		swal("Upload Complete", "success");
	});


	uploadTask.on('state_changed', function(snapshot){

	  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		document.getElementById("upload_text").value = 'Upload is ' + Math.round(progress) + '% done';
	  switch (snapshot.state) {
	    case firebase.storage.TaskState.PAUSED: // or 'paused'
	      console.log('Upload is paused');
	      break;
	    case firebase.storage.TaskState.RUNNING: // or 'running'
	      console.log('Upload is running');
	      break;
	  }
	}, function(error) {

	  switch (error.code) {
	    case 'storage/unauthorized':
	      // User doesn't have permission to access the object
	      break;

	    case 'storage/canceled':
	      // User canceled the upload
	      break;

	    case 'storage/unknown':
	      // Unknown error occurred, inspect error.serverResponse
	      break;
	  }
	}, function() {
	  // Upload completed successfully, now we can get the download URL
	  var downloadURL = uploadTask.snapshot.downloadURL;
	});
}

document.getElementById("file").addEventListener("change", function(e){
	loadImage(this);
}, false);

function recacheImage(){
	if (!filter_edited){
		validateImage();
		filter_edited = true;
	}
}

function loadImage(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    canvas = null;
    reader.onload = function(e) {
      image = new Image();
      image.onload = validateImage;
      image.src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function dataURLtoBlob(dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = decodeURIComponent(parts[1]);

    return new Blob([raw], {
      type: contentType
    });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {
    type: contentType
  });
}

function validateImage() {
  if (canvas != null) {
    image = new Image();
    image.onload = restartJcrop;
    image.src = canvas.toDataURL();
  } else restartJcrop();
}

function restartJcrop() {

	showAdvancePanel();

	var views = document.getElementById("views");
	while (views.firstChild){
		document.getElementById("views").removeChild(views.firstChild);
	}
	var canvasElem = document.createElement("canvas");
	canvasElem.id = "canvas";
  views.appendChild(canvasElem);
  canvas = canvasElem;
  context = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);

	if (jcrop_api != null) {
		jcrop_api.destroy();
		Filter.image = image;
		Filter.context = context;
	}else{
		Filter.init(context, image);
		originalImage = image;
	}

  $("#canvas").Jcrop({
    onSelect: selectcanvas,
    onRelease: clearcanvas,
    boxWidth: crop_max_width,
    boxHeight: crop_max_height
  }, function() {
    jcrop_api = this;
  });
  clearcanvas();
}

function showAdvancePanel(){
	$(".advance_panel").fadeIn();
	$(".initial_panel").fadeOut();
}

function clearcanvas() {
  prefsize = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
  };
}

function selectcanvas(coords) {
  prefsize = {
    x: Math.round(coords.x),
    y: Math.round(coords.y),
    w: Math.round(coords.w),
    h: Math.round(coords.h)
  };
}

function applyCrop() {
	reapplyFilter();
  context.drawImage(image, prefsize.x, prefsize.y, prefsize.w, prefsize.h, 0, 0, canvas.width, canvas.height);
  validateImage();
}

function applyScale(scale) {
  if (scale == 1) return;
  canvas.width = canvas.width * scale;
  canvas.height = canvas.height * scale;
	reapplyFilter();
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  validateImage();
}

function applyRotate() {
	canvas.width = image.height;
  canvas.height = image.width;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(image.height / 2, image.width / 2);
  context.rotate(Math.PI / 2);
	reapplyFilter();
  context.drawImage(image, -image.width / 2, -image.height / 2);
  validateImage();
}

function applyHflip() {
	context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(image.width, 0);
  context.scale(-1, 1);
	reapplyFilter();
  context.drawImage(image, 0, 0);
  validateImage();
}

function applyVflip() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(0, image.height);
  context.scale(1, -1);
	reapplyFilter();
  context.drawImage(image, 0, 0);
  validateImage();
}

function reapplyFilter(){

	if (!filter_edited){
		return;
	}

	filter_edited = false;
	var sum = "";
	for (var key in Filter.style) {
		 if (Filter.style.hasOwnProperty(key)) {
				sum += Filter.style[key] + " ";
		 }
	}
	context.filter = sum;
}

document.getElementById("crop").addEventListener("click", function(e){
	applyCrop();
}, false);

document.getElementById("scale").addEventListener("click", function(e){
	var scale = prompt("Scale Factor:", "1");
	applyScale(scale);
}, false);

document.getElementById("rotate").addEventListener("click", function(e){
	applyRotate();
}, false);

document.getElementById("hflip").addEventListener("click", function(e){
	applyHflip();
}, false);

document.getElementById("vflip").addEventListener("click", function(e){
	applyVflip();
}, false);

document.getElementById("blur").addEventListener("input", function(e){
	recacheImage();
	Filter.blur(e.target.value);
}, false);

document.getElementById("grayscale").addEventListener("input", function(e){
	recacheImage();
	Filter.grayscale(e.target.value);
}, false);

document.getElementById("sepia").addEventListener("input", function(e){
	recacheImage();
	Filter.sepia(e.target.value);
}, false);

document.getElementById("saturate").addEventListener("input", function(e){
	recacheImage();
	Filter.saturate(e.target.value);
}, false);

document.getElementById("hue_rotate").addEventListener("input", function(e){
	recacheImage();
	Filter.hue_rotate(e.target.value);
}, false);

document.getElementById("invert").addEventListener("input", function(e){
	recacheImage();
	Filter.invert(e.target.value);
}, false);

document.getElementById("opacity").addEventListener("input", function(e){
	recacheImage();
	Filter.opacity(e.target.value);
}, false);

document.getElementById("brightness").addEventListener("input", function(e){
	recacheImage();
	Filter.brightness(e.target.value);
}, false);

document.getElementById("contrast").addEventListener("input", function(e){
	recacheImage();
	Filter.contrast(e.target.value);
}, false);

document.getElementById("reset").addEventListener("click", function(e){
	Filter.reset();
	Filter.init(context, image);
	jcrop_api = null;
	image = originalImage;
	restartJcrop();
	filter_edited = false;
}, false);

document.getElementById("form").addEventListener("submit", function(e){
	e.preventDefault();
  var formData = new FormData(document.getElementById("form"));
  var blob = dataURLtoBlob(canvas.toDataURL());
  //---Add file blob to the form data
  formData.append("cropped_image[]", blob);
  firebaseUpload(blob);
}, false);
