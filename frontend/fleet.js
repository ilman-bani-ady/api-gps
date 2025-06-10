// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Load fleet data
    loadFleetData();

    // Add event listeners
    document.getElementById('saveFleetBtn').addEventListener('click', saveFleet);
    document.getElementById('updateFleetBtn').addEventListener('click', updateFleet);
});

// Load fleet data from API
async function loadFleetData() {
    try {
        const response = await fetch('/api/tracking/fleet', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            const tableBody = document.getElementById('fleetTableBody');
            tableBody.innerHTML = '';

            data.data.forEach(vehicle => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${vehicle.device_id}</td>
                    <td>${vehicle.vehicle_name || '-'}</td>
                    <td>${vehicle.plate_number || '-'}</td>
                    <td>
                        <span class="badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-danger'}">
                            ${vehicle.status || 'unknown'}
                        </span>
                    </td>
                    <td>${new Date(vehicle.last_update).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editFleet('${vehicle.device_id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFleet('${vehicle.device_id}')">
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading fleet data:', error);
        alert('Failed to load fleet data');
    }
}

// Save new fleet
async function saveFleet() {
    const deviceId = document.getElementById('deviceId').value;
    const vehicleName = document.getElementById('vehicleName').value;
    const plateNumber = document.getElementById('plateNumber').value;

    try {
        const response = await fetch('/api/fleet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                device_id: deviceId,
                vehicle_name: vehicleName,
                plate_number: plateNumber
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Close modal and reload data
            const modal = bootstrap.Modal.getInstance(document.getElementById('addFleetModal'));
            modal.hide();
            loadFleetData();
            
            // Clear form
            document.getElementById('addFleetForm').reset();
        } else {
            alert(data.message || 'Failed to add vehicle');
        }
    } catch (error) {
        console.error('Error saving fleet:', error);
        alert('Failed to add vehicle');
    }
}

// Edit fleet
async function editFleet(deviceId) {
    try {
        const response = await fetch(`/api/fleet/${deviceId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            const vehicle = data.data;
            document.getElementById('editFleetId').value = vehicle.device_id;
            document.getElementById('editDeviceId').value = vehicle.device_id;
            document.getElementById('editVehicleName').value = vehicle.vehicle_name || '';
            document.getElementById('editPlateNumber').value = vehicle.plate_number || '';

            const modal = new bootstrap.Modal(document.getElementById('editFleetModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading vehicle data:', error);
        alert('Failed to load vehicle data');
    }
}

// Update fleet
async function updateFleet() {
    const deviceId = document.getElementById('editFleetId').value;
    const vehicleName = document.getElementById('editVehicleName').value;
    const plateNumber = document.getElementById('editPlateNumber').value;

    try {
        const response = await fetch(`/api/fleet/${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                vehicle_name: vehicleName,
                plate_number: plateNumber
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Close modal and reload data
            const modal = bootstrap.Modal.getInstance(document.getElementById('editFleetModal'));
            modal.hide();
            loadFleetData();
        } else {
            alert(data.message || 'Failed to update vehicle');
        }
    } catch (error) {
        console.error('Error updating fleet:', error);
        alert('Failed to update vehicle');
    }
}

// Delete fleet
async function deleteFleet(deviceId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }

    try {
        const response = await fetch(`/api/fleet/${deviceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (data.status === 'success') {
            loadFleetData();
        } else {
            alert(data.message || 'Failed to delete vehicle');
        }
    } catch (error) {
        console.error('Error deleting fleet:', error);
        alert('Failed to delete vehicle');
    }
}