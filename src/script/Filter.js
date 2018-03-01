import fx from "./lib/glfx"

var Filter = {
  blur: (val, context, image) => {
    if (context.filter == "none"){
      context.filter = "blur(" + val + "px)";           
    }else{
      context.filter += " blur(" + val + "px)";           
    }
    context.drawImage(image, 0, 0);
  },
  grayscale: (val, context, image) => {
    if (context.filter == "none"){
      context.filter = "grayscale(" + val + "%)";            
    }else{
      context.filter += " grayscale(" + val + "%)";           
    }
    context.drawImage(image, 0, 0);
  }
}


export default Filter;
