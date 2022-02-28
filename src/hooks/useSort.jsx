import { useState, useCallback, useRef } from "react";

const useSort = (props, tableManager) => {
    const {
        columnsApi: { columns },
    } = tableManager;

    const sortApi = useRef({}).current;
    const [sort, setSort] = useState({ colId: null, isAsc: true });

    sortApi.sort = props.sort ?? sort;
    if (
        !columns.some(
            (column) => column.id === sortApi.sort.colId && column.sortable
        )
    )
        sortApi.sort = { colId: null, isAsc: true };

    sortApi.setSort = ({ colId, isAsc }) => {
        const {
            columnsReorderApi: { isColumnReordering },
            columnsResizeApi: { isColumnResizing },
        } = tableManager;

        if (isColumnReordering) return;
        if (isColumnResizing) return;

        if (props.sort === undefined || props.onSortChange === undefined)
            setSort({ colId, isAsc });
        props.onSortChange?.({ colId, isAsc }, tableManager);
    };

    sortApi.sortRows = useCallback(
        (rows) => {
            // using external sort(er) ?
            if (typeof props.onSortChange === 'function') {
                // ...fallback to current rows, already sorted
                return rows;
            }

            // use internal sort(er)...
            var cols = columns.reduce((conf, coldef) => {
                conf[coldef.id] = coldef;
                return conf;
            }, {});

            // ...just sort it?
            if (sortApi.sort?.colId) {
                rows = [...rows];
                rows.sort((a, b) => {
                    const aVal = cols[sortApi.sort.colId].getValue({
                        value: a[cols[sortApi.sort.colId].field],
                        column: cols[sortApi.sort.colId],
                    });
                    const bVal = cols[sortApi.sort.colId].getValue({
                        value: b[cols[sortApi.sort.colId].field],
                        column: cols[sortApi.sort.colId],
                    });

                    if (cols[sortApi.sort.colId].sortable === false) return 0;
                    return cols[sortApi.sort.colId].sort({
                        a: aVal,
                        b: bVal,
                        isAscending: sortApi.sort.isAsc,
                    });
                });
            }

            return rows;
        },
        [sortApi.sort, columns]
    );

    sortApi.toggleSort = (colId) => {
        let isAsc = true;
        if (sortApi.sort.colId === colId) {
            if (sortApi.sort.isAsc) isAsc = false;
            else {
                colId = null;
                isAsc = true;
            }
        }

        sortApi.setSort({ colId, isAsc });
    };

    return sortApi;
};

export default useSort;
