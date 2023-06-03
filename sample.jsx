
import React, { useState, useEffect } from "react";
import { Table, Button, TextInput, Paper, Modal } from "@mantine/core";
import { useFetchData } from "../../hooks/useFetchData";
import { FIELD_NAMES } from "../../constants/fieldNames";

export const EditableTable = () => {
  const { fetchedData, error } = useFetchData();
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [filter, setFilter] = useState({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updatedRow, setUpdatedRow] = useState(null);

  useEffect(() => {
    setData(fetchedData);
    setEditedData({});
  }, [fetchedData]);

  const handleChange = (value, field, index) => {
    setEditedData({
      ...editedData,
      [index]: { ...editedData[index], [field]: value },
    });
  };

  const handleFilterChange = (value, field) => {
    setFilter((prevFilter) => {
      const newFilter = {
        ...prevFilter,
        [field]: value,
      };
      if (!value) {
        delete newFilter[field];
      }
      return newFilter;
    });
  };

  const filteredData = fetchedData.filter((row) =>
    Object.keys(filter).every((key) => {
      if (row[key] && filter[key]) {
        const filterValue = filter[key].toLowerCase();
        const cellValue = String(row[key]).toLowerCase();
        return cellValue.includes(filterValue);
      } else if (!filter[key]) {
        return true;
      }
      return false;
    })
  );

  const handleUpdateModalClose = () => {
    setUpdateModalOpen(false);
    setUpdatedRow(null);
  };

  const handleUpdate = async (index) => {
    setUpdatedRow({
      ...fetchedData[index],
      ...editedData[index],
      index: index,
    });
    setUpdateModalOpen(true);
  };

const handleConfirmedUpdate = async () => {
  if (!updatedRow) {
    console.error("Update failed: No row to update");
    return;
  }
  const response = await fetch(process.env.NEXT_PUBLIC_API_UPDATE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedRow),
  });

  if (response.ok) {
    const updatedData = fetchedData.map((row, index) =>
      index === updatedRow.index
        ? { ...row, ...editedData[updatedRow.index] }
        : row
    );
    setData(updatedData);
  } else {
    console.error("Update failed: " + response.statusText);
  }

  handleUpdateModalClose(); // モーダルを閉じる
};


    if (response.ok) {
      const updatedData = fetchedData.map((row, index) =>
        index === updatedRow.index
          ? { ...row, ...editedData[updatedRow.index] }
          : row
      );
      setData(updatedData);
      handleUpdateModalClose();
    } else {
      console.error("Update failed: " + response.statusText);
    }
  };

  useEffect(() => {
    if (updatedRow) {
      setUpdatedRow(null);
    }
  }, [editedData]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            {Object.values(FIELD_NAMES).map((fieldName) => (
              <th key={fieldName}>
                {fieldName}
                <TextInput
                  onChange={(event) =>
                    handleFilterChange(event.target.value, fieldName)
                  }
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {Object.values(FIELD_NAMES).map((fieldName) => (
                <td key={fieldName}>
                  <TextInput
                    value={
                      editedData[index]?.[fieldName] || row[fieldName] || ""
                    }
                    onChange={(event) =>
                      handleChange(event.target.value, fieldName, index)
                    }
                  />
                </td>
              ))}
              <td>
                <Button
                  onClick={() => handleUpdate(index)}
                  disabled={!updatedRow || updatedRow.index !== index} // 更新がある行のみボタンを有効にする
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal opened={updateModalOpen} onClose={handleUpdateModalClose}>
        <Paper padding="md">
          <h1>Update Confirmation</h1>
          <p>Are you sure you want to update this row?</p>
          <Button onClick={handleConfirmedUpdate}>Yes, update</Button>
        </Paper>
      </Modal>
    </>
  );
};
