
// function BulletList(props) {
//     const arr = props.array;
//     const listItems = arr.map((stat) =>
//       <li key={stat} className="H2HStat">
//         {stat}
//       </li>
//     );
//     return (
//       <ul>{listItems}</ul>
//     );
//   }

function BulletList(props) {
  return (
    <ul className={props.className}>
      <li>{props.array[0]}</li>
    </ul>
  );
}

export default BulletList;