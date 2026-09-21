export function HeadCell({ children, className = "", align = "center" }) {
  return (
    <th
      scope="col"
      className={`MuiTableCell-root MuiTableCell-head${className ? ` ${className}` : ""}`}
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

export function BodyCell({ children, className = "", align = "center", style }) {
  return (
    <td
      className={`MuiTableCell-root MuiTableCell-body${className ? ` ${className}` : ""}`}
      style={{ textAlign: align, ...style }}
    >
      {children}
    </td>
  );
}

export function StatPill({ children }) {
  return <span className="SubpageStatPill">{children}</span>;
}

export function SubpageTable({ className = "", children, ...props }) {
  return (
    <div className={`SubpageTableScroll SubpageDataTable ${className}`.trim()}>
      <table className="MuiTable-root" {...props}>
        {children}
      </table>
    </div>
  );
}
