import '../scss/reset.scss';
import '../scss/main.scss';

import Jcrop from "jquery-jcrop"
import swal from 'sweetalert2'
import firebase from "firebase"
// import champ_img from "../images/champ.png";
// import draw_img from "../images/draw.png";
// import welcome_img from "../images/welcome.png";
// import background from "../images/background.png";

var crop_max_width = 400;
var crop_max_height = 400;
var jcrop_api;
var canvas;
var context;
var image;

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

	var uploadTask = imagesRef.put(file, { contentType: 'image/png' });
	uploadTask.then(function(snapshot) {
	  console.log('Uploaded a blob or file!');
	});


	uploadTask.on('state_changed', function(snapshot){

	  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	  console.log('Upload is ' + progress + '% done');
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

$("#file").change(function() {
  loadImage(this);
});

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
    image.src = canvas.toDataURL('image/png');
  } else restartJcrop();
}

function restartJcrop() {
  if (jcrop_api != null) {
    jcrop_api.destroy();
  }
  $("#views").empty();
  $("#views").append("<canvas id=\"canvas\">");
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
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
  canvas.width = prefsize.w;
  canvas.height = prefsize.h;
  context.drawImage(image, prefsize.x, prefsize.y, prefsize.w, prefsize.h, 0, 0, canvas.width, canvas.height);
  validateImage();
}

function applyScale(scale) {
  if (scale == 1) return;
  canvas.width = canvas.width * scale;
  canvas.height = canvas.height * scale;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  validateImage();
}

function applyRotate() {
  canvas.width = image.height;
  canvas.height = image.width;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(image.height / 2, image.width / 2);
  context.rotate(Math.PI / 2);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  validateImage();
}

function applyHflip() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(image.width, 0);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0);
  validateImage();
}

function applyVflip() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(0, image.height);
  context.scale(1, -1);
  context.drawImage(image, 0, 0);
  validateImage();
}

$("#cropbutton").click(function(e) {
  applyCrop();
});
$("#scalebutton").click(function(e) {
  var scale = prompt("Scale Factor:", "1");
  applyScale(scale);
});
$("#rotatebutton").click(function(e) {
  applyRotate();
});
$("#hflipbutton").click(function(e) {
  applyHflip();
});
$("#vflipbutton").click(function(e) {
  applyVflip();
});

$("#form").submit(function(e) {
  e.preventDefault();
  var formData = new FormData($(this)[0]);
  var blob = dataURLtoBlob(canvas.toDataURL('image/png'));
  //---Add file blob to the form data
  formData.append("cropped_image[]", blob);
  firebaseUpload(blob);
});
