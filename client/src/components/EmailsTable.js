import React from "react";
import { useTable } from "react-table";
import * as moment from "moment";

const columns = [
  { Header: "Subject", accessor: "subject" },
  { Header: "Sender Name", accessor: "sender_name" },
  { Header: "Sender Email", accessor: "sender" },
  { Header: "Read", accessor: "read" },
  { Header: "Flag", accessor: "flag" },
  { Header: "Time", accessor: "timestamp" },
];

const EmailsTable = ({ data }) => {
  // Transform data for display
  const transformedData = data.map((item) => ({
    ...item,
    timestamp: moment(item.timestamp).format("YYYY-MM-DD HH:mm"),
    read: item.read ? "Read" : "Unread",
  }));

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: transformedData
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

export default EmailsTable;
