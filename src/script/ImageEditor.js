import Jcrop from "jquery-jcrop"

var ImageEditor = {

  context: null,
  image: null,
  canvas: null,
  filter_edited: false,
  init: (context, image, canvas) => {
      ImageEditor.context = context;
      ImageEditor.image = image;
      ImageEditor.canvas = canvas;
  },
  Filter: {
    style: {},
    defaultValue : {
      blur: 0,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      hue_rotate: 0,
      invert: 0,
      opacity: 100,
      saturate: 100,
      sepia: 0
    },
    init: () => {
      document.getElementById("grayscale").value = ImageEditor.Filter.defaultValue.grayscale;
      document.getElementById("blur").value = ImageEditor.Filter.defaultValue.blur;
      document.getElementById("sepia").value = ImageEditor.Filter.defaultValue.sepia;
      document.getElementById("opacity").value = ImageEditor.Filter.defaultValue.opacity;
      document.getElementById("brightness").value = ImageEditor.Filter.defaultValue.brightness;
      document.getElementById("contrast").value = ImageEditor.Filter.defaultValue.contrast;
      document.getElementById("hue_rotate").value = ImageEditor.Filter.defaultValue.hue_rotate;
      document.getElementById("invert").value = ImageEditor.Filter.defaultValue.invert;
      document.getElementById("saturate").value = ImageEditor.Filter.defaultValue.saturate;
    },
    blur: (val) => {
      ImageEditor.Filter.style.blur = "blur(" + val + "px)";
      ImageEditor.Filter.draw();
    },
    grayscale: (val) => {
      ImageEditor.Filter.style.grayscale = "grayscale(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    sepia: (val) => {
      ImageEditor.Filter.style.sepia = "sepia(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    saturate: (val) => {
      ImageEditor.Filter.style.saturate = "saturate(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    hue_rotate: (val) => {
      ImageEditor.Filter.style.hue_rotate = "hue-rotate(" + val + "deg)";
      ImageEditor.Filter.draw();
    },
    invert: (val) => {
      ImageEditor.Filter.style.invert = "invert(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    opacity: (val) => {
      ImageEditor.Filter.style.opacity = "opacity(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    brightness: (val) => {
      ImageEditor.Filter.style.brightness = "brightness(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    contrast: (val) => {
      ImageEditor.Filter.style.contrast = "contrast(" + val + "%)";
      ImageEditor.Filter.draw();
    },
    reset: () => {
      ImageEditor.Filter.style = {};
      ImageEditor.context.filter = "none";
      ImageEditor.Filter.draw();
    },
    draw: () => {
      var sum = "";
      for (var key in ImageEditor.Filter.style) {
         if (ImageEditor.Filter.style.hasOwnProperty(key)) {
            sum += ImageEditor.Filter.style[key] + " ";
         }
      }
      ImageEditor.context.filter = sum;
      ImageEditor.context.drawImage(ImageEditor.image, 0, 0);
      ImageEditor.context.filter = "none";
    }
  },
  Editor: {
    crop_max_width: window.innerWidth * 0.5,
    crop_max_height: window.innerHeight * 0.5,
    jcrop_api: null,
    prefsize: null,
    selectcanvas: function(coords) {
      ImageEditor.Editor.prefsize = {
        x: Math.round(coords.x),
        y: Math.round(coords.y),
        w: Math.round(coords.w),
        h: Math.round(coords.h)
      };
    },
    applyCrop: function() {
      ImageEditor.Editor.reapplyFilter();
      ImageEditor.context.drawImage(ImageEditor.image, ImageEditor.Editor.prefsize.x, ImageEditor.Editor.prefsize.y, ImageEditor.Editor.prefsize.w, ImageEditor.Editor.prefsize.h, 0, 0, ImageEditor.canvas.width, ImageEditor.canvas.height);
    },

    applyScale: function(scale) {
      if (scale == 1) return;
      ImageEditor.canvas.width = ImageEditor.canvas.width * scale;
      ImageEditor.canvas.height = ImageEditor.canvas.height * scale;
      ImageEditor.Editor.reapplyFilter();
      ImageEditor.context.drawImage(ImageEditor.image, 0, 0, ImageEditor.canvas.width, ImageEditor.canvas.height);
    },

    applyRotate: function() {
      ImageEditor.canvas.width = ImageEditor.image.height;
      ImageEditor.canvas.height = ImageEditor.image.width;
      ImageEditor.context.clearRect(0, 0, ImageEditor.canvas.width, ImageEditor.canvas.height);
      ImageEditor.context.translate(ImageEditor.image.height / 2, ImageEditor.image.width / 2);
      ImageEditor.context.rotate(Math.PI / 2);
      ImageEditor.Editor.reapplyFilter();
      ImageEditor.context.drawImage(ImageEditor.image, -ImageEditor.image.width / 2, -ImageEditor.image.height / 2);
    },

    applyHflip: function() {
      ImageEditor.context.clearRect(0, 0, ImageEditor.canvas.width, ImageEditor.canvas.height);
      ImageEditor.context.translate(ImageEditor.image.width, 0);
      ImageEditor.context.scale(-1, 1);
      ImageEditor.Editor.reapplyFilter();
      ImageEditor.context.drawImage(ImageEditor.image, 0, 0);
    },

    applyVflip: function() {
      ImageEditor.context.clearRect(0, 0, ImageEditor.canvas.width, ImageEditor.canvas.height);
      ImageEditor.context.translate(0, ImageEditor.image.height);
      ImageEditor.context.scale(1, -1);
      ImageEditor.Editor.reapplyFilter();
      ImageEditor.context.drawImage(ImageEditor.image, 0, 0);
    },
    reapplyFilter: function(){

      if (!ImageEditor.filter_edited){
        return;
      }
      ImageEditor.filter_edited = false;
      var sum = "";
      for (var key in ImageEditor.Filter.style) {
         if (ImageEditor.Filter.style.hasOwnProperty(key)) {
            sum += ImageEditor.Filter.style[key] + " ";
         }
      }
      ImageEditor.context.filter = sum;
    },
    jcropInit: function(canvasElem) {
      canvasElem.Jcrop({
        onSelect: ImageEditor.Editor.selectcanvas,
        onRelease: ImageEditor.Editor.clearcanvas,
        boxWidth: ImageEditor.Editor.crop_max_width,
        boxHeight: ImageEditor.Editor.crop_max_height
      }, function() {
        ImageEditor.Editor.jcrop_api = this;
      });
      ImageEditor.Editor.clearcanvas();
    },
    clearcanvas: function() {
      ImageEditor.Editor.prefsize = {
        x: 0,
        y: 0,
        w: ImageEditor.canvas.width,
        h: ImageEditor.canvas.height,
      };
    }
  },




}


export default ImageEditor;
