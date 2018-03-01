
var Filter = {
  context: null,
  image: null,
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
  init: (context, image) => {
    Filter.context = context;
    Filter.image = image;
    document.getElementById("grayscale").value = Filter.defaultValue.grayscale;
    document.getElementById("blur").value = Filter.defaultValue.blur;
    document.getElementById("sepia").value = Filter.defaultValue.sepia;
    document.getElementById("opacity").value = Filter.defaultValue.opacity;
    document.getElementById("brightness").value = Filter.defaultValue.brightness;
    document.getElementById("contrast").value = Filter.defaultValue.contrast;
    document.getElementById("hue_rotate").value = Filter.defaultValue.hue_rotate;
    document.getElementById("invert").value = Filter.defaultValue.invert;
    document.getElementById("saturate").value = Filter.defaultValue.saturate;
  },
  blur: (val) => {
    Filter.style.blur = "blur(" + val + "px)";
    Filter.draw();
  },
  grayscale: (val) => {
    Filter.style.grayscale = "grayscale(" + val + "%)";
    Filter.draw();
  },
  sepia: (val) => {
    Filter.style.sepia = "sepia(" + val + "%)";
    Filter.draw();
  },
  saturate: (val) => {
    Filter.style.saturate = "saturate(" + val + "%)";
    Filter.draw();
  },
  hue_rotate: (val) => {
    Filter.style.hue_rotate = "hue-rotate(" + val + "deg)";
    Filter.draw();
  },
  invert: (val) => {
    Filter.style.invert = "invert(" + val + "%)";
    Filter.draw();
  },
  opacity: (val) => {
    Filter.style.opacity = "opacity(" + val + "%)";
    Filter.draw();
  },
  brightness: (val) => {
    Filter.style.brightness = "brightness(" + val + "%)";
    Filter.draw();
  },
  contrast: (val) => {
    Filter.style.contrast = "contrast(" + val + "%)";
    Filter.draw();
  },
  reset: () => {
    Filter.style = {};
    Filter.context.filter = "none";
    Filter.draw();
  },
  draw: () => {
    var sum = "";
    for (var key in Filter.style) {
       if (Filter.style.hasOwnProperty(key)) {
          sum += Filter.style[key] + " ";
       }
    }
    Filter.context.filter = sum;
    Filter.context.drawImage(Filter.image, 0, 0);
    Filter.context.filter = "none";
  }
}


export default Filter;
