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

    const response = await fetch(process.env.NEXT_PUBLIC_API_BULK_UPDATE_ENDPOINT, {
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
    <>
      <Table>
        <thead>
          <tr>
            <th>
              PLANTADDRESS1
              <TextInput onChange={(value) => handleFilterChange(value, 'PLANTADDRESS1')} />
            </th>
            <th>
              FRAME
              <TextInput onChange={(value) => handleFilterChange(value, 'FRAME')} />
            </th>
            <th>
              PLANTNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'PLANTNAME')} />
            </th>
            <th>
              UNITNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'UNITNAME')} />
            </th>
            <th>
              SUBNAME
              <TextInput onChange={(value) => handleFilterChange(value, 'SUBNAME')} />
            </th>
            <th>
              MACHINESN
              <TextInput onChange={(value) => handleFilterChange(value, 'MACHINESN')} />
            </th>
            <th>
              CRM_PLANT_ID
              <TextInput onChange={(value) => handleFilterChange(value, 'CRM_PLANT_ID')} />
            </th>
            <th>
              CRM_UNIT_ID
              <TextInput onChange={(value) => handleFilterChange(value, 'CRM_UNIT_ID')} />
            </th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, i) => (
            <tr key={i} style={editedData[i] ? { backgroundColor: 'yellow' } : {}}>
              <td>{row.PLANTADDRESS1}</td>
              <td>{row.FRAME}</td>
              <td>{row.PLANTNAME}</td>
              <td>{row.UNITNAME}</td>
              <td>{row.SUBNAME}</td>
              <td>{row.MACHINESN}</td>
              <td>
                <TextInput
                  value={editedData[i]?.CRM_PLANT_ID || row.CRM_PLANT_ID}
                  onChange={(value) => handleChange(value, 'CRM_PLANT_ID', i)}
                  maxLength={10}
                />
              </td>
              <td>
                <TextInput
                  value={editedData[i]?.CRM_UNIT_ID || row.CRM_UNIT_ID}
                  onChange={(value) => handleChange(value, 'CRM_UNIT_ID', i)}
                  maxLength={10}
                />
              </td>
              <td>
                <Button
                  onClick={() => handleUpdate(i)}
                  disabled={!(editedData[i] && (editedData[i]?.CRM_PLANT_ID !== row.CRM_PLANT_ID || editedData[i]?.CRM_UNIT_ID !== row.CRM_UNIT_ID))}
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={handleBulkUpdate} disabled={!Object.keys(editedData).length}>Bulk Update</Button>

      <Modal
        opened={updateModalOpen}
        onClose={handleUpdateModalClose}
        title="Confirm Update"
      >
        <p>Are you sure you want to update this row?</p>
        <Button onClick={handleConfirmedUpdate}>Yes</Button>
        <Button onClick={handleUpdateModalClose}>No</Button>
      </Modal>

      <Modal
        opened={bulkUpdateModalOpen}
        onClose={handleBulkUpdateModalClose}
        title="Confirm Bulk Update"
      >
        <p>Are you sure you want to update all edited rows?</p>
        <Button onClick={handleConfirmedBulkUpdate}>Yes</Button>
        <Button onClick={handleBulkUpdateModalClose}>No</Button>
      </Modal>
    </>
  );
}

export default EditableTable;
