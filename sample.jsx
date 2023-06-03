import React, { useState, useEffect } from 'react';
import { Table, Button, TextInput, Paper, Modal } from '@mantine/core';

export const EditableTable() {
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
    setFilter((prevFilter) => {
      const newFilter = {
        ...prevFilter,
        [field]: value,
      };
      if (!value) {
        delete newFilter[field]
      }
      return newFilter
    })

  const filteredData = data.filter(row =>
      Object.keys(filter).every((key) => {
        if (row[key] && filter[key]) {
          const filterValue = filter[key].toLowerCase()
          const cellValue = String(row[key]).toLowerCase()
          return cellValue.includes(filterValue)
        } else if (!filter[key]) {
          return true
        }
        return false
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
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'PLANTADDRESS1')} />
            </th>
            <th>
              FRAME
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'FRAME')} />
            </th>
            <th>
              PLANTNAME
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'PLANTNAME')} />
            </th>
            <th>
              UNITNAME
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'UNITNAME')} />
            </th>
            <th>
              SUBNAME
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'SUBNAME')} />
            </th>
            <th>
              MACHINESN
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'MACHINESN')} />
            </th>
            <th>
              CRM_PLANT_ID
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'CRM_PLANT_ID')} />
            </th>
            <th>
              CRM_UNIT_ID
              <TextInput onChange={(event) => handleFilterChange(event.target.value, 'CRM_UNIT_ID')} />
            </th>
            <th>
              Update
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} style={editedData[index] ? { backgroundColor: 'yellow' } : undefined}>
              <td>{row.PLANTADDRESS1}</td>
              <td>{row.FRAME}</td>
              <td>{row.PLANTNAME}</td>
              <td>{row.UNITNAME}</td>
              <td>{row.SUBNAME}</td>
              <td>{row.MACHINESN}</td>
              <td>
                <TextInput 
                  value={editedData[index]?.CRM_PLANT_ID ?? row.CRM_PLANT_ID ?? ''}
                  maxLength={10}
                  onChange={(value) => handleChange(value, 'CRM_PLANT_ID', index)}
                />
              </td>
              <td>
                <TextInput 
                  value={editedData[index]?.CRM_UNIT_ID ?? row.CRM_UNIT_ID ?? ''}
                  maxLength={10}
                  onChange={(value) => handleChange(value, 'CRM_UNIT_ID', index)}
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
