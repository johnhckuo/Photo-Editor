import '../scss/reset.scss';
import '../scss/main.scss';

import swal from 'sweetalert2'
import firebase from "firebase"
import ImageEditor from "./ImageEditor"

var canvas;
var context;
var image, originalImage;

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


function getDate() {
	var date = new Date();

	var mm = date.getMonth() + 1; // getMonth() is zero-based
	var dd = date.getDate();
	var hh = date.getHours();
	var minute = date.getMinutes();
	var ss = date.getSeconds();

	return [date.getFullYear(),
					(mm>9 ? '' : '0') + mm,
					(dd>9 ? '' : '0') + dd,
					(hh>9 ? '' : '0') + hh,
					(minute>9 ? '' : '0') + minute,
					(ss>9 ? '' : '0') + ss
				 ].join('');
};

function firebaseUpload(file){
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var imagesRef = storageRef.child('images/' + getDate() + '.png');
	var uploadTask = imagesRef.put(file);

	uploadTask.on('state_changed', function(snapshot){

	  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		document.getElementById("upload_text").innerHTML = 'Upload is ' + Math.round(progress) + '% done';
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
		swal("Upload Complete", "Your image URL is: " + downloadURL,  "success");

	});
}

document.getElementById("file").addEventListener("change", function(e){
	loadImage(this);
}, false);

function recacheImage(){
	if (!ImageEditor.filter_edited){
		validateImage();
		ImageEditor.filter_edited = true;
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

	if (ImageEditor.Editor.jcrop_api != null) {
	  ImageEditor.Editor.jcrop_api.destroy();
	  ImageEditor.image = image;
	  ImageEditor.context = context;
	}else{
	  ImageEditor.init(context, image, canvas);
	  ImageEditor.Filter.init();
	  originalImage = image;
	}

  	ImageEditor.Editor.jcropInit($("#canvas"));

}

function showAdvancePanel(){
	$(".advance_panel").fadeIn();
	$(".initial_panel").fadeOut();
}





document.getElementById("crop").addEventListener("click", function(e){
	ImageEditor.Editor.applyCrop();
	validateImage();
}, false);

document.getElementById("scale").addEventListener("click", function(e){
	var scale = prompt("Scale Factor:", "1");
	ImageEditor.Editor.applyScale(scale);
	validateImage();
}, false);

document.getElementById("rotate").addEventListener("click", function(e){
	ImageEditor.Editor.applyRotate();
	validateImage();
}, false);

document.getElementById("hflip").addEventListener("click", function(e){
	ImageEditor.Editor.applyHflip();
	validateImage();
}, false);

document.getElementById("vflip").addEventListener("click", function(e){
	ImageEditor.Editor.applyVflip();
	validateImage();
}, false);

document.getElementById("blur").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.blur(e.target.value);
}, false);

document.getElementById("grayscale").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.grayscale(e.target.value);
}, false);

document.getElementById("sepia").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.sepia(e.target.value);
}, false);

document.getElementById("saturate").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.saturate(e.target.value);
}, false);

document.getElementById("hue_rotate").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.hue_rotate(e.target.value);
}, false);

document.getElementById("invert").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.invert(e.target.value);
}, false);

document.getElementById("opacity").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.opacity(e.target.value);
}, false);

document.getElementById("brightness").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.brightness(e.target.value);
}, false);

document.getElementById("contrast").addEventListener("input", function(e){
	recacheImage();
	ImageEditor.Filter.contrast(e.target.value);
}, false);

document.getElementById("reset").addEventListener("click", function(e){
	ImageEditor.Filter.reset();
	ImageEditor.init(context, image, canvas);
	ImageEditor.Filter.init();
	ImageEditor.Editor.jcrop_api = null;
	image = originalImage;
	restartJcrop();
	ImageEditor.filter_edited = false;
}, false);

document.getElementById("form").addEventListener("submit", function(e){
	e.preventDefault();
  var formData = new FormData(document.getElementById("form"));
  var blob = dataURLtoBlob(canvas.toDataURL());
  //---Add file blob to the form data
  formData.append("cropped_image[]", blob);
  firebaseUpload(blob);
}, false);
