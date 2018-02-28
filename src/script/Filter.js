import fx from "./lib/glfx"

var Filter = {
  img: null,
  texture: null,
  canvas: null,
  init: () => {
    try {
        Filter.canvas = fx.canvas();
    } catch (e) {
        alert(e);
        return;
    }
    Filter.fetchTexture();
  },
  fetchTexture: () => {
    Filter.img = document.getElementById('canvas');
    Filter.texture = Filter.canvas.texture(Filter.img);
  },
  ink: () => {
    Filter.fetchTexture();

  	// apply the ink filter
  	Filter.canvas.draw(Filter.texture).ink(0.25).update();
  	// replace the image with the canvas
    Filter.rerender();

  },
  brightnessContrast: (brightness, contrast)=> {
    Filter.fetchTexture();

    Filter.canvas.draw(Filter.texture).brightnessContrast(brightness, contrast).update();
    Filter.rerender();
  },
  sepia: (amount) => {
    Filter.fetchTexture();
    Filter.canvas.draw(Filter.texture).sepia(amount).update();
    Filter.rerender();
  },
  curves: (r, g, b) => {
    Filter.fetchTexture();
    Filter.canvas.draw(Filter.texture).curves(r, g, b).update();
    Filter.rerender();
  },
  rerender: () =>{

    Filter.canvas.id = "canvas";
    //Filter.canvas.width = 400;
    //Filter.canvas.height = 400;
    Filter.img.parentNode.replaceChild(Filter.canvas, Filter.img);
  }

}


export default Filter;
