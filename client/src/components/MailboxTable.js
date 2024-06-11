import React from "react";
import { useTable } from "react-table";
import * as moment from "moment";

const columns = [
  { Header: "Name", accessor: "mailbox_name" },
  { Header: "Total Email", accessor: "total_emails" },
  { Header: "Unread Count", accessor: "unread_count" },
  { Header: "Last Sync", accessor: "last_sync" },
];

const MailboxTable = ({ data }) => {
  // Transform data for display
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: data.map((item) => ({
        ...item,
        last_sync: moment(item.last_sync).format("YYYY-MM-DD HH:mm"),
      })),
    });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default MailboxTable;
