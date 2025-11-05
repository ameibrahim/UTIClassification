import React from "react";

const tableColumns = ["#", "column1"];

const tableData = [
    { number: 1, column1: "hello this is a test table" },
    { number: 2, column1: "hello this is a test table" },
    { number: 3, column1: "hello this is a test table" },
    { number: 4, column1: "hello this is a test table" },
    { number: 5, column1: "hello this is a test table" },
    { number: 6, column1: "hello this is a test table" },
    { number: 7, column1: "hello this is a test table" },
    { number: 8, column1: "hello this is a test table" },
    { number: 9, column1: "hello this is a test table" },
    { number: 10, column1: "hello this is a test table" },
];

function Breakable() {
    return (
        <div className="p-40 grid gap-8">
            <Table columns={tableColumns} data={tableData.slice(0,8)} />
            <Table columns={tableColumns} data={tableData.slice(8,10)} />
        </div>
    );
}

function Table({
    columns,
    data,
}: {
    columns: Array<string>;
    data: Array<{ number: number; column1: string }>;
}) {
    return (
        <div className="border rounded-md">
            <div className="flex border-b-1 items-center">
                {columns.map((row, index) => (
                    <div
                        key={row}
                        className={`${
                            index == 0 ? "w-10 text-center border-r-1" : ""
                        } p-2 text-xs`}
                    >
                        {row}
                    </div>
                ))}
            </div>
            <div>
                {data.map((row, index) => (
                    <div
                        key={row.number}
                        className={`${
                            index != data.length - 1 ? "border-b-1" : ""
                        } flex items-center text-xs`}
                    >
                        <div className="w-10 text-center p-2 border-r-1">
                            {row.number}
                        </div>
                        <div className="p-2">{row.column1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Breakable;
