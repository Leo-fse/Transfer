import React, { useState, useEffect } from 'react';
import { Table, Button, TextInput, Paper, Modal } from '@mantine/core';
import 'tailwindcss/tailwind.css';

function EditableTable() {
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [filter, setFilter] = useState({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [updatedRow, setUpdatedRow] = useState(null);
  const [updatedRows, setUpdatedRows] = useState([]);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_ENDPOINT) 
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
    const response = await fetch(process.env.NEXT_PUBLIC_API_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRow),
    });

    if (response.ok) {
      const updatedData = data.map((item, i) =>
        i === updatedRow.index ? { ...item, ...editedData[updatedRow.index] } : item
      );
      setData(updatedData);
      setUpdatedRows([...updatedRows, updatedRow.index]);
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

    const response = await fetch(process.env.NEXT_PUBLIC_API_BULK_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      setData(updatedData);
      setUpdatedRows(Object.keys(editedData).map(Number));
    } else {
      console.error('Bulk update failed');
    }
    handleBulkUpdateModalClose();
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>
              PLANTADDRESS1
              <TextInput onChange={(value) => handleFilterChange(value, 'plantAddress1')} />
            </th>
            <th>
              FRAME
              <TextInput onChange={(value) => handleFilterChange(value, 'frame')} />
            </th>
            <th>
              PLANTNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'plantName')} />
            </th>
            <th>
              UNITNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'unitName')} />
            </th>
            <th>
              SUBNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'subName')} />
            </th>
            <th>
              MACHINESN
              <TextInput onChange={(value) => handleFilterChange(value, 'machineSN')} />
            </th>
            <th>
              CRM_PLANT_ID
              <TextInput onChange={(value) => handleFilterChange(value, 'plantID')} />
            </th>
            <th>
              CRM_UNIT_ID
              <TextInput onChange={(value) => handleFilterChange(value, 'unitID')} />
            </th>
            <th>
              Update
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} style={editedData[index] ? { backgroundColor: 'yellow' } : undefined}>
              <td>{row.plantAddress1}</td>
              <td>{row.frame}</td>
              <td>{row.plantName}</td>
              <td>{row.unitName}</td>
              <td>{row.subName}</td>
              <td>{row.machineSN}</td>
              <td>
                <TextInput 
                  value={editedData[index]?.plantID ?? row.plantID ?? ''}
                  maxLength={10}
                  onChange={(value) => handleChange(value, 'plantID', index)}
                />
              </td>
              <td>
                <TextInput 
                  value={editedData[index]?.unitID ?? row.unitID ?? ''}
                  maxLength={10}
                  onChange={(value) => handleChange(value, 'unitID', index)}
                />
              </td>
              <td>
                <Button
                  onClick={() => handleUpdate(index)}
                  disabled={!(editedData[index] && !updatedRows.includes(index))}
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={handleBulkUpdate} disabled={!Object.keys(editedData).length}>
        Bulk update
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
}

export default EditableTable;
