// components/EditableTable.js
import React, { useState, useEffect } from "react";
import { Table, Button, TextInput, Paper, Modal } from "@mantine/core";
import { useFetchData } from "../../hooks/useFetchData";
import { FIELD_NAMES } from "../../constants/fieldNames";

const editableFields = [FIELD_NAMES.CRM_PLANT_ID, FIELD_NAMES.CRM_UNIT_ID];

// components/EditableTable.js

export const EditableTable = () => {
  const { fetchedData, error } = useFetchData();
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [filter, setFilter] = useState({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [updatedRow, setUpdatedRow] = useState(null);
  const [updatedRows, setUpdatedRows] = useState([]);

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

  const handleBulkUpdateModalClose = () => {
    setBulkUpdateModalOpen(false);
  };

  const handleUpdate = async (index) => {
    const editedRow = editedData[index];
    if (!editedRow || Object.keys(editedRow).length === 0) {
      console.error("Update failed: No changes made");
      return;
    }

    const updatedRow = { ...fetchedData[index], ...editedRow, index: index };
    setUpdatedRow(updatedRow);
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
        index === updatedRow.index ? { ...row, ...editedData[index] } : row
      );
      setData(updatedData);
      handleUpdateModalClose();
    } else {
      console.error("Update failed: " + response.statusText);
    }
  };

  const handleBulkUpdate = async () => {
    const rowsToUpdate = Object.keys(editedData).filter(
      (index) => Object.keys(editedData[index]).length > 0
    );

    if (rowsToUpdate.length === 0) {
      console.error("Bulk update failed: No changes made");
      return;
    }

    setUpdatedRows(rowsToUpdate.map(Number));
    setBulkUpdateModalOpen(true);
  };

  const handleConfirmedBulkUpdate = async () => {
    if (updatedRows.length === 0) {
      console.error("Bulk update failed: No rows to update");
      return;
    }

    const bulkUpdateData = updatedRows.map((index) => ({
      ...fetchedData[index],
      ...editedData[index],
    }));

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_BULK_UPDATE_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulkUpdateData),
      }
    );

    if (response.ok) {
      const updatedData = data.map((row, index) =>
        editedData[index] ? { ...row, ...editedData[index] } : row
      );
      setData(updatedData);
      setEditedData({});
      handleBulkUpdateModalClose();
    } else {
      console.error("Bulk update failed: " + response.statusText);
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Button
        onClick={handleBulkUpdate}
        disabled={!Object.keys(editedData).length}
      >
        Bulk Update
      </Button>
      <Modal opened={updateModalOpen} onClose={handleUpdateModalClose}>
        <Button onClick={handleConfirmedUpdate}>Confirm Update</Button>
      </Modal>
      <Modal opened={bulkUpdateModalOpen} onClose={handleBulkUpdateModalClose}>
        <Button onClick={handleConfirmedBulkUpdate}>Confirm Bulk Update</Button>
      </Modal>
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
                  disabled={!editedData[index]}
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button
        onClick={handleBulkUpdate}
        disabled={!Object.keys(editedData).length}
      >
        Bulk Update
      </Button>
      <Modal opened={updateModalOpen} onClose={handleUpdateModalClose}>
        <Paper padding="md">
          <h1>Update Confirmation</h1>
          <p>Are you sure you want to update this row?</p>
          <Button onClick={handleConfirmedUpdate}>Yes, update</Button>
        </Paper>
      </Modal>
      <Modal opened={bulkUpdateModalOpen} onClose={handleBulkUpdateModalClose}>
        <Paper padding="md">
          <h1>Bulk Update Confirmation</h1>
          <p>Are you sure you want to update these rows?</p>
          <Button onClick={handleConfirmedBulkUpdate}>Yes, update</Button>
        </Paper>
      </Modal>
    </>
  );
};
