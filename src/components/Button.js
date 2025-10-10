export function Button(props) {
  return (
    <div id="Button">
      <button data-cy={props.text} variant="primary" type="button" onClick={props.onClickEvent} className={props.className} disabled={props.disabled} style={props.style}>
        {props.text}
      </button>
    </div>
  );
}
