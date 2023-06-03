import React, { useState, useEffect } from 'react';
import { Table, Button, TextInput, Modal } from '@mantine/core';
import 'tailwindcss/tailwind.css';

function EditableTable() {
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [filter, setFilter] = useState({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [updatedRow, setUpdatedRow] = useState(null);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_ENDPOINT) 
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    setEditedData({});
  }, [data]);

  const handleChange = (value, field, index) => {
    setEditedData({
      ...editedData,
      [index]: { ...editedData[index], [field]: value },
    });
  };

  const handleFilterChange = (value, field) => {
    setFilter({
      ...filter,
      [field]: value,
    });
  };

  const filteredData = data.filter(row =>
    Object.keys(filter).every(
      key => !filter[key] || row[key].includes(filter[key])
    )
  );

  const handleUpdateModalClose = () => {
    setUpdateModalOpen(false);
    setUpdatedRow(null);
  };

  const handleBulkUpdateModalClose = () => {
    setBulkUpdateModalOpen(false);
  };

  const handleUpdate = async (index) => {
    setUpdatedRow({ ...data[index], ...editedData[index], index: index });
    setUpdateModalOpen(true);
  };

  const handleConfirmedUpdate = async () => {
    if (!updatedRow) {
      console.error('Update failed: No row to update');
      return;
    }
    const response = await fetch(process.env.REACT_APP_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRow),
    });

    if (response.ok) {
      setData(
        data.map((item, i) =>
          i === updatedRow.index ? { ...item, ...editedData[updatedRow.index] } : item
        )
      );
    } else {
      console.error('Update failed');
    }
    handleUpdateModalClose();
  };

  const handleBulkUpdate = async () => {
    setBulkUpdateModalOpen(true);
  };

  const handleConfirmedBulkUpdate = async () => {
    const updatedData = data.map((item, i) => editedData[i] ? { ...item, ...editedData[i] } : item);

    const response = await fetch(process.env.REACT_APP_BULK_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      setData(updatedData);
    } else {
      console.error('Bulk update failed');
    }
    handleBulkUpdateModalClose();
  };

  return (
    <div className="App">
      <h1>Editable Table</h1>
      <Button onClick={handleBulkUpdate}>Bulk Update</Button>
      <Table>
        <thead>
          <tr>
            {["PLANTADDRESS1", "FRAME", "PLANTNAME", "UNITNAME", "SUBNAME", "MACHINESN", "CRM_PLANT_ID", "CRM_UNIT_ID"].map((colName) => (
              <th key={colName}>
                {colName}
                <TextInput
                  placeholder={`Filter ${colName}`}
                  onChange={(value) => handleFilterChange(value, colName)}
                  style={{ width: '100%' }}
                />
              </th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} style={editedData[index] ? { backgroundColor: '#FFD700' } : {}}>
              {Object.keys(row).map((key, i) => {
                if (key !== "CRM_PLANT_ID" && key !== "CRM_UNIT_ID") {
                  return <td key={i}>{row[key]}</td>;
                }
                return (
                  <td key={i}>
                    <TextInput
                      value={editedData[index] && editedData[index][key] ? editedData[index][key] : row[key]}
                      onChange={(value) => handleChange(value, key, index)}
                      maxLength={10}
                      disabled={key === "CRM_PLANT_ID" || key === "CRM_UNIT_ID" ? false : true}
                    />
                  </td>
                );
              })}
              <td>
                <Button
                  onClick={() => handleUpdate(index)}
                  disabled={!editedData[index] || (editedData[index] && !Object.keys(editedData[index]).length)}
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {updateModalOpen && (
        <Modal opened={updateModalOpen} onClose={handleUpdateModalClose} title="Update Confirmation">
          <p>Are you sure you want to update the row?</p>
          <Button onClick={handleConfirmedUpdate}>Yes</Button>
          <Button onClick={handleUpdateModalClose}>No</Button>
        </Modal>
      )}
      {bulkUpdateModalOpen && (
        <Modal opened={bulkUpdateModalOpen} onClose={handleBulkUpdateModalClose} title="Bulk Update Confirmation">
          <p>Are you sure you want to bulk update the table?</p>
          <Button onClick={handleConfirmedBulkUpdate}>Yes</Button>
          <Button onClick={handleBulkUpdateModalClose}>No</Button>
        </Modal>
      )}
    </div>
  );
}

export default EditableTable;
