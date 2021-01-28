// import React from "react";

// export default class Slider extends React.Component {
//   constructor(props) {
//     super(props);

//     this.slider = React.createRef();
//     this.weight = React.createRef();
//   }
//   componentDidMount() {
//     var slider = this.slider;
//     var output = this.weight;
//     console.log(slider);
//     console.log(output);

//     console.log(slider.current)

//     // output.innerHTML = slider.value;

//     // slider.oninput = function () {
//     //   output.innerHTML = this.value;
//     //   let weighting = this.value / 100;
//     // };
//   }

//   render() {
//     return (
//       <div className="slidecontainer">
//         <input
//           type="range"
//           min="-100"
//           max="100"
//           value="0"
//           className="slider"
//           id="myRange"
//           ref={this.slider}
//         />
//         <p>
//           Odds weighting:{this.slider.current}
//           <span id="weight" className="weight" ref="{this.weight}"></span>
//         </p>
//       </div>
//     );
//   }
// }
