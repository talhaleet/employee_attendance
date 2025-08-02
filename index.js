    // Global variables
        let employees = [];
        let attendanceRecords = {};
        let currentMonth = new Date().toISOString().slice(0, 7);
        let selectedEmployeeId = null;
        let settings = {
            deductionPerAbsent: 500,
            maxLeaves: 1
        };
        let holidays = {};
        let attendanceChart = null;
        const { jsPDF } = window.jspdf;

        // DOM Ready
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the app
            initApp();
            
            // Tab navigation
            document.getElementById('employeesTabBtn').addEventListener('click', function(e) {
                e.preventDefault();
                showTab('employeesTab');
                updateActiveNav(this);
            });
            
            document.getElementById('attendanceTabBtn').addEventListener('click', function(e) {
                e.preventDefault();
                showTab('attendanceTab');
                updateActiveNav(this);
            });
            
            document.getElementById('analyticsTabBtn').addEventListener('click', function(e) {
                e.preventDefault();
                showTab('analyticsTab');
                updateActiveNav(this);
            });
            
            document.getElementById('settingsTabBtn').addEventListener('click', function(e) {
                e.preventDefault();
                showTab('settingsTab');
                updateActiveNav(this);
            });
            
            // Employee management
            document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
            document.getElementById('updateEmployeeBtn').addEventListener('click', updateEmployee);
            document.getElementById('loadAttendanceBtn').addEventListener('click', loadAttendance);
            document.getElementById('loadAnalyticsBtn').addEventListener('click', loadAnalytics);
            document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
            document.getElementById('confirmResetCheck').addEventListener('change', function() {
                document.getElementById('confirmResetBtn').disabled = !this.checked;
            });
            document.getElementById('confirmResetBtn').addEventListener('click', resetAllData);
            document.getElementById('addHolidayBtn').addEventListener('click', addHoliday);
            document.getElementById('exportDataBtn').addEventListener('click', exportData);
            document.getElementById('importDataBtn').addEventListener('click', () => {
                document.getElementById('importFileInput').click();
            });
            document.getElementById('importFileInput').addEventListener('change', importData);
            document.getElementById('downloadPdfBtn').addEventListener('click', downloadAttendancePdf);
            
            // Attendance marking buttons
            document.getElementById('markPresentBtn').addEventListener('click', () => markSelectedDay('P'));
            document.getElementById('markAbsentBtn').addEventListener('click', () => markSelectedDay('A'));
            document.getElementById('markLeaveBtn').addEventListener('click', () => markSelectedDay('L'));
            document.getElementById('clearMarkingBtn').addEventListener('click', () => markSelectedDay(''));
            
            // Set current month in date inputs
            document.getElementById('attendanceMonth').value = currentMonth;
            document.getElementById('analyticsMonth').value = currentMonth;
        });
        
        // Initialize the application
        function initApp() {
            // Load data from localStorage
            loadDataFromStorage();
            
            // Load employees dropdowns
            populateEmployeeDropdowns();
            
            // Render employee table
            renderEmployeeTable();
            
            // Load settings
            loadSettings();
            
            // Render holidays list
            renderHolidaysList();
        }
        
        // Load data from localStorage
        function loadDataFromStorage() {
            // Load employees
            const savedEmployees = localStorage.getItem('employees');
            if (savedEmployees) {
                employees = JSON.parse(savedEmployees);
            } else {
                // Load mock data if no saved data exists
                loadMockData();
            }
            
            // Load attendance records
            const savedAttendance = localStorage.getItem('attendanceRecords');
            if (savedAttendance) {
                attendanceRecords = JSON.parse(savedAttendance);
            }
            
            // Load settings
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
            
            // Load holidays
            const savedHolidays = localStorage.getItem('holidays');
            if (savedHolidays) {
                holidays = JSON.parse(savedHolidays);
            }
        }
        
        // Save data to localStorage
        function saveDataToStorage() {
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
            localStorage.setItem('settings', JSON.stringify(settings));
            localStorage.setItem('holidays', JSON.stringify(holidays));
        }
        
        // Load mock data (only used when no saved data exists)
        function loadMockData() {
            teachers = [
                { id: 1, name: "John Doe", salary: 30000 },
                { id: 2, name: "Jane Smith", salary: 35000 },
                { id: 3, name: "Robert Johnson", salary: 32000 }
            ];
            
            // Mock attendance data
            attendanceRecords = {
                '1': {
                    '2023-06': {
                        '1': 'P',
                        '2': 'P',
                        '3': 'A',
                        '5': 'L',
                        '10': 'A'
                    }
                },
                '2': {
                    '2023-06': {
                        '1': 'P',
                        '2': 'P',
                        '3': 'P',
                        '5': 'P',
                        '10': 'P'
                    }
                },
                '3': {
                    '2023-06': {
                        '1': 'P',
                        '2': 'A',
                        '3': 'A',
                        '5': 'L',
                        '10': 'P'
                    }
                }
            };
            
            // Mock holidays
            holidays = {
                '2023-06': {
                    '15': 'Public Holiday',
                    '30': 'School Event'
                }
            };
            
            // Save mock data to localStorage
            saveDataToStorage();
        }
        
        
        // Show tab and hide others
        function showTab(tabId) {
            const tabs = document.querySelectorAll('.tab-pane');
            tabs.forEach(tab => {
                if (tab.id === tabId) {
                    tab.classList.add('show', 'active');
                } else {
                    tab.classList.remove('show', 'active');
                }
            });
        }
        
        // Update active nav link
        function updateActiveNav(activeLink) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                if (link === activeLink) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Populate employee dropdowns
        function populateEmployeeDropdowns() {
            const dropdowns = [
                document.getElementById('attendanceEmployee'),
                document.getElementById('analyticsEmployee')
            ];
            
            dropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="">' + (dropdown.id === 'analyticsEmployee' ? 'All Employees' : 'Select Employee') + '</option>';
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.id;
                    option.textContent = employee.name;
                    dropdown.appendChild(option);
                });
            });
        }
        
        // Render employee table
        function renderEmployeeTable() {
            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';
            
            employees.forEach(employee => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>₹${employee.salary.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-employee').forEach(btn => {
                btn.addEventListener('click', function() {
                    const employeeId = parseInt(this.getAttribute('data-id'));
                    editEmployee(employeeId);
                });
            });
            
            document.querySelectorAll('.delete-employee').forEach(btn => {
                btn.addEventListener('click', function() {
                    const employeeId = parseInt(this.getAttribute('data-id'));
                    deleteEmployee(employeeId);
                });
            });
        }
        
        // Save new employee
        function saveEmployee() {
            const name = document.getElementById('employeeName').value.trim();
            const salary = parseFloat(document.getElementById('employeeSalary').value);
            
            if (!name) {
                alert('Please enter employee name');
                return;
            }
            
            if (isNaN(salary)) {
                alert('Please enter valid salary amount');
                return;
            }
            
            // Generate new employee ID
            const newId = employees.length > 0 ? Math.max(...employees.map(t => t.id)) + 1 : 1;
            
            const newEmployee = {
                id: newId,
                name: name,
                salary: salary
            };
            
            employees.push(newEmployee);
            
            // Save to localStorage
            saveDataToStorage();
            
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal')).hide();
            document.getElementById('addEmployeeForm').reset();
            
            // Update UI
            populateEmployeeDropdowns();
            renderEmployeeTable();
            
            // Show success message
            alert('Employee added successfully!');
        }
        
        // Edit employee
        function editEmployee(employeeId) {
            const employee = employees.find(t => t.id === employeeId);
            if (!employee) return;
            
            document.getElementById('editEmployeeId').value = employee.id;
            document.getElementById('editEmployeeName').value = employee.name;
            document.getElementById('editEmployeeSalary').value = employee.salary;
            
            const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
            modal.show();
        }
        
        // Update employee
        function updateEmployee() {
            const employeeId = parseInt(document.getElementById('editEmployeeId').value);
            const name = document.getElementById('editEmployeeName').value.trim();
            const salary = parseFloat(document.getElementById('editEmployeeSalary').value);
            
            if (!name) {
                alert('Please enter employee name');
                return;
            }
            
            if (isNaN(salary)) {
                alert('Please enter valid salary amount');
                return;
            }
            
            // Update employee data
            const employeeIndex = employees.findIndex(t => t.id === employeeId);
            if (employeeIndex !== -1) {
                employees[employeeIndex].name = name;
                employees[employeeIndex].salary = salary;
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal')).hide();
            
            // Update UI
            populateEmployeeDropdowns();
            renderEmployeeTable();
            
            // Show success message
            alert('Employee updated successfully!');
        }
        
        // Delete employee
        function deleteEmployee(employeeId) {
            if (!confirm('Are you sure you want to delete this employee? All attendance records will also be deleted.')) {
                return;
            }
            
            // Remove employee
            employees = employees.filter(t => t.id !== employeeId);
            
            // Remove attendance records for this employee
            if (attendanceRecords[employeeId]) {
                delete attendanceRecords[employeeId];
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            populateEmployeeDropdowns();
            renderEmployeeTable();
            
            // Show success message
            alert('Employee deleted successfully!');
        }
        
        // Load attendance data
        function loadAttendance() {
            const month = document.getElementById('attendanceMonth').value;
            const employeeId = document.getElementById('attendanceEmployee').value;
            
            if (!month || !employeeId) {
                alert('Please select both month and employee');
                return;
            }
            
            selectedEmployeeId = employeeId;
            renderAttendanceCalendar(month, employeeId);
            calculateAttendanceSummary(month, employeeId);
        }
        
        // Render attendance calendar
        function renderAttendanceCalendar(month, employeeId) {
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const firstDayOfWeek = new Date(year, monthNum - 1, 1).getDay();
            
            // Get attendance data for this employee and month
            const monthAttendance = attendanceRecords[employeeId]?.[month] || {};
            
            // Get holidays for this month
            const monthHolidays = holidays[month] || {};
            
            // Create calendar HTML
            let calendarHTML = `
                <h5 class="mb-3">${employeeNameById(employeeId)} - ${monthName(monthNum)} ${year}</h5>
                <div class="table-responsive">
                    <table class="table table-bordered calendar-table">
                        <thead>
                            <tr>
                                <th>Sun</th>
                                <th>Mon</th>
                                <th>Tue</th>
                                <th>Wed</th>
                                <th>Thu</th>
                                <th>Fri</th>
                                <th>Sat</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Calculate the starting position
            let currentDay = 1;
            let dayOfWeek = firstDayOfWeek;
            
            // Create weeks
            while (currentDay <= daysInMonth) {
                calendarHTML += '<tr>';
                
                // Create days for each week
                for (let i = 0; i < 7; i++) {
                    if ((currentDay === 1 && i < dayOfWeek) || currentDay > daysInMonth) {
                        // Empty cell before the first day or after the last day
                        calendarHTML += '<td class="empty-day"></td>';
                    } else {
                        const date = new Date(year, monthNum - 1, currentDay);
                        const isSunday = date.getDay() === 0;
                        
                        // Check if this is a holiday
                        const isHoliday = monthHolidays[currentDay];
                        
                        // Get attendance status
                        let attendanceStatus = monthAttendance[currentDay] || '';
                        if (isHoliday) {
                            attendanceStatus = 'H'; // H for Holiday
                        }
                        
                        let statusClass = '';
                        let statusText = '';
                        
                        switch (attendanceStatus) {
                            case 'P':
                                statusClass = 'present';
                                statusText = 'P';
                                break;
                            case 'A':
                                statusClass = 'absent';
                                statusText = 'A';
                                break;
                            case 'L':
                                statusClass = 'leave';
                                statusText = 'L';
                                break;
                            case 'H':
                                statusClass = 'holiday';
                                statusText = 'H';
                                break;
                            default:
                                statusText = '';
                        }
                        
                        const dayClass = isSunday ? 'sunday' : statusClass;
                        const dayTitle = isSunday ? 'Sunday' : 
                                         isHoliday ? 'Holiday' : 
                                         statusText ? statusText === 'P' ? 'Present' : 
                                                     statusText === 'A' ? 'Absent' : 
                                                     statusText === 'L' ? 'Leave' : '' : 'No record';
                        
                        calendarHTML += `
                            <td class="${dayClass}" 
                                data-day="${currentDay}" 
                                data-employee="${employeeId}" 
                                data-month="${month}"
                                title="${dayTitle}">
                                <div class="calendar-day">
                                    <div class="day-number">${currentDay}</div>
                                    ${statusText ? `<div class="day-status">${statusText}</div>` : ''}
                                </div>
                            </td>
                        `;
                        currentDay++;
                    }
                }
                
                calendarHTML += '</tr>';
            }
            
            calendarHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('attendanceCalendar').innerHTML = calendarHTML;
            
            // Add event listeners to calendar days
            document.querySelectorAll('.calendar-table td:not(.empty-day):not(.sunday)').forEach(dayCell => {
                if (dayCell.classList.contains('holiday')) {
                    // Don't allow marking holidays
                    dayCell.style.cursor = 'not-allowed';
                    return;
                }
                
                dayCell.addEventListener('click', function() {
                    // Remove selection from all days
                    document.querySelectorAll('.calendar-table td').forEach(cell => {
                        cell.classList.remove('selected');
                    });
                    
                    // Add selection to clicked day
                    this.classList.add('selected');
                });
            });
        }
        
        // Mark selected day with attendance status
        function markSelectedDay(status) {
            const selectedDay = document.querySelector('.calendar-table td.selected');
            if (!selectedDay) {
                alert('Please select a day first');
                return;
            }
            
            // Don't allow marking holidays
            if (selectedDay.classList.contains('holiday')) {
                alert('Cannot mark attendance for holidays');
                return;
            }
            
            const day = parseInt(selectedDay.getAttribute('data-day'));
            const employeeId = selectedDay.getAttribute('data-employee');
            const month = selectedDay.getAttribute('data-month');
            
            // Validate leave marking (only one leave allowed per month)
            if (status === 'L') {
                const leavesUsed = countLeavesUsed(month, employeeId);
                if (leavesUsed >= settings.maxLeaves) {
                    alert(`Only ${settings.maxLeaves} leave(s) allowed per month. This employee has already used ${leavesUsed} leave(s).`);
                    return;
                }
            }
            
            // Update attendance record
            if (!attendanceRecords[employeeId]) {
                attendanceRecords[employeeId] = {};
            }
            
            if (!attendanceRecords[employeeId][month]) {
                attendanceRecords[employeeId][month] = {};
            }
            
            if (status) {
                attendanceRecords[employeeId][month][day] = status;
            } else {
                delete attendanceRecords[employeeId][month][day];
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            renderAttendanceCalendar(month, employeeId);
            calculateAttendanceSummary(month, employeeId);
        }
        
        // Count leaves used by a employee in a month
        function countLeavesUsed(month, employeeId) {
            if (!attendanceRecords[employeeId] || !attendanceRecords[employeeId][month]) {
                return 0;
            }
            
            return Object.values(attendanceRecords[employeeId][month]).filter(s => s === 'L').length;
        }
        
        // Calculate and display attendance summary
        function calculateAttendanceSummary(month, employeeId) {
            const monthAttendance = attendanceRecords[employeeId]?.[month] || {};
            const monthHolidays = holidays[month] || {};
            
            let presentCount = 0;
            let absentCount = 0;
            let leaveCount = 0;
            let holidayCount = 0;
            
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            
            // Count all days in month (excluding Sundays and holidays)
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNum - 1, day);
                const dayOfWeek = date.getDay();
                
                // Skip Sundays
                if (dayOfWeek === 0) continue;
                
                // Skip holidays
                if (monthHolidays[day]) {
                    holidayCount++;
                    continue;
                }
                
                const status = monthAttendance[day];
                if (status === 'P') presentCount++;
                else if (status === 'A') absentCount++;
                else if (status === 'L') leaveCount++;
            }
            
            // Update summary display
            document.getElementById('presentDays').textContent = presentCount;
            document.getElementById('absentDays').textContent = absentCount;
            document.getElementById('leaveDays').textContent = leaveCount;
            
            // Calculate and display salary deduction
            const employee = employees.find(t => t.id === parseInt(employeeId));
            if (employee) {
                const deduction = absentCount * settings.deductionPerAbsent;
                document.getElementById('salaryDeduction').textContent = `₹${deduction.toLocaleString()}`;
                
                const deductionPercentage = (deduction / employee.salary) * 100;
                const deductionProgress = document.getElementById('deductionProgress');
                deductionProgress.style.width = `${Math.min(100, deductionPercentage)}%`;
                deductionProgress.textContent = `${deductionPercentage.toFixed(1)}%`;
            }
        }
        
        // Load analytics data
        function loadAnalytics() {
            const month = document.getElementById('analyticsMonth').value;
            const employeeId = document.getElementById('analyticsEmployee').value;
            
            if (!month) {
                alert('Please select a month');
                return;
            }
            
            // Calculate overall statistics
            calculateOverallStatistics(month, employeeId);
            
            // Generate analytics cards for each employee
            generateEmployeeAnalytics(month, employeeId);
            
            // Generate attendance trend chart
            generateAttendanceChart(month, employeeId);
        }
        
        // Calculate overall statistics
        function calculateOverallStatistics(month, filterEmployeeId = null) {
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const monthHolidays = holidays[month] || {};
            
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalLeave = 0;
            let totalHolidays = 0;
            let totalEmployees = 0;
            let totalDeductions = 0;
            
            const employeesToAnalyze = filterEmployeeId 
                ? employees.filter(t => t.id === parseInt(filterEmployeeId))
                : employees;
            
            employeesToAnalyze.forEach(employee => {
                const monthAttendance = attendanceRecords[employee.id]?.[month] || {};
                
                let presentCount = 0;
                let absentCount = 0;
                let leaveCount = 0;
                let holidayCount = 0;
                
                // Count all days in month (excluding Sundays and holidays)
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, monthNum - 1, day);
                    const dayOfWeek = date.getDay();
                    
                    // Skip Sundays
                    if (dayOfWeek === 0) continue;
                    
                    // Skip holidays
                    if (monthHolidays[day]) {
                        holidayCount++;
                        continue;
                    }
                    
                    const status = monthAttendance[day];
                    if (status === 'P') presentCount++;
                    else if (status === 'A') absentCount++;
                    else if (status === 'L') leaveCount++;
                }
                
                totalPresent += presentCount;
                totalAbsent += absentCount;
                totalLeave += leaveCount;
                totalHolidays += holidayCount;
                totalDeductions += absentCount * settings.deductionPerAbsent;
            });
            
            totalEmployees = employeesToAnalyze.length;
            const workingDays = daysInMonth - countSundaysInMonth(year, monthNum) - Object.keys(monthHolidays).length;
            const totalDays = totalEmployees * workingDays;
            
            // Calculate percentages
            const presentPercentage = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
            const absentPercentage = totalDays > 0 ? (totalAbsent / totalDays) * 100 : 0;
            const leavePercentage = totalDays > 0 ? (totalLeave / totalDays) * 100 : 0;
            
            // Update UI
            document.getElementById('avgPresent').textContent = `${presentPercentage.toFixed(1)}%`;
            document.getElementById('avgAbsent').textContent = `${absentPercentage.toFixed(1)}%`;
            document.getElementById('avgLeave').textContent = `${leavePercentage.toFixed(1)}%`;
            document.getElementById('totalDeductions').textContent = `₹${totalDeductions.toLocaleString()}`;
        }
        
        // Count Sundays in a month
        function countSundaysInMonth(year, month) {
            let count = 0;
            const daysInMonth = new Date(year, month, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);
                if (date.getDay() === 0) { // Sunday
                    count++;
                }
            }
            
            return count;
        }
        
        // Generate employee analytics cards
        function generateEmployeeAnalytics(month, filterEmployeeId = null) {
            const container = document.getElementById('employeeAnalyticsContainer');
            container.innerHTML = '';
            
            const employeesToAnalyze = filterEmployeeId 
                ? employees.filter(t => t.id === parseInt(filterEmployeeId))
                : employees;
            
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const monthHolidays = holidays[month] || {};
            
            employeesToAnalyze.forEach(employee => {
                const monthAttendance = attendanceRecords[employee.id]?.[month] || {};
                
                let presentCount = 0;
                let absentCount = 0;
                let leaveCount = 0;
                let holidayCount = 0;
                
                // Count all days in month (excluding Sundays and holidays)
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, monthNum - 1, day);
                    const dayOfWeek = date.getDay();
                    
                    // Skip Sundays
                    if (dayOfWeek === 0) continue;
                    
                    // Skip holidays
                    if (monthHolidays[day]) {
                        holidayCount++;
                        continue;
                    }
                    
                    const status = monthAttendance[day];
                    if (status === 'P') presentCount++;
                    else if (status === 'A') absentCount++;
                    else if (status === 'L') leaveCount++;
                }
                
                const workingDays = daysInMonth - countSundaysInMonth(year, monthNum) - Object.keys(monthHolidays).length;
                const attendancePercentage = workingDays > 0 ? (presentCount / workingDays) * 100 : 0;
                const deduction = absentCount * settings.deductionPerAbsent;
                
                const cardHTML = `
                    <div class="col-md-4 mb-4">
                        <div class="card analytics-card h-100">
                            <div class="card-header">
                                <h5 class="card-title mb-0">${employee.name}</h5>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-4 text-center">
                                        <h6 class="text-success">${presentCount}</h6>
                                        <small>Present</small>
                                    </div>
                                    <div class="col-4 text-center">
                                        <h6 class="text-danger">${absentCount}</h6>
                                        <small>Absent</small>
                                    </div>
                                    <div class="col-4 text-center">
                                        <h6 class="text-warning">${leaveCount}</h6>
                                        <small>Leave</small>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>Attendance: ${attendancePercentage.toFixed(1)}%</h6>
                                    <div class="progress">
                                        <div class="progress-bar bg-success" role="progressbar" 
                                            style="width: ${attendancePercentage}%">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>Salary Deduction: ₹${deduction.toLocaleString()}</h6>
                                    <div class="progress">
                                        <div class="progress-bar bg-danger" role="progressbar" 
                                            style="width: ${(deduction / employee.salary) * 100}%">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
        
        // Generate attendance trend chart
        function generateAttendanceChart(month, filterEmployeeId = null) {
            const ctx = document.getElementById('attendanceChart').getContext('2d');
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const monthHolidays = holidays[month] || {};
            
            // Prepare data for chart
            const days = [];
            const presentData = [];
            const absentData = [];
            const leaveData = [];
            const holidayData = [];
            
            // Only include working days (exclude Sundays and holidays)
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNum - 1, day);
                const dayOfWeek = date.getDay();
                
                // Skip Sundays
                if (dayOfWeek === 0) continue;
                
                // Skip holidays
                if (monthHolidays[day]) continue;
                
                days.push(day);
                presentData.push(0);
                absentData.push(0);
                leaveData.push(0);
                holidayData.push(0);
            }
            
            const employeesToAnalyze = filterEmployeeId 
                ? employees.filter(t => t.id === parseInt(filterEmployeeId))
                : employees;
            
            employeesToAnalyze.forEach(employee => {
                const monthAttendance = attendanceRecords[employee.id]?.[month] || {};
                
                let dayIndex = 0;
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, monthNum - 1, day);
                    const dayOfWeek = date.getDay();
                    
                    // Skip Sundays
                    if (dayOfWeek === 0) continue;
                    
                    // Skip holidays
                    if (monthHolidays[day]) continue;
                    
                    const status = monthAttendance[day];
                    if (status === 'P') presentData[dayIndex]++;
                    else if (status === 'A') absentData[dayIndex]++;
                    else if (status === 'L') leaveData[dayIndex]++;
                    
                    dayIndex++;
                }
            });
            
            // Destroy previous chart if it exists
            if (attendanceChart) {
                attendanceChart.destroy();
            }
            
            // Create new chart
            attendanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        {
                            label: 'Present',
                            data: presentData,
                            backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 2,
                            tension: 0.3
                        },
                        {
                            label: 'Absent',
                            data: absentData,
                            backgroundColor: 'rgba(231, 76, 60, 0.2)',
                            borderColor: 'rgba(231, 76, 60, 1)',
                            borderWidth: 2,
                            tension: 0.3
                        },
                        {
                            label: 'Leave',
                            data: leaveData,
                            backgroundColor: 'rgba(243, 156, 18, 0.2)',
                            borderColor: 'rgba(243, 156, 18, 1)',
                            borderWidth: 2,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Daily Attendance Trend'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Employees'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Day of Month'
                            }
                        }
                    }
                }
            });
        }
        
        // Load settings
        function loadSettings() {
            document.getElementById('deductionAmount').value = settings.deductionPerAbsent;
            document.getElementById('maxLeaves').value = settings.maxLeaves;
        }
        
        // Save settings
        function saveSettings() {
            const deduction = parseFloat(document.getElementById('deductionAmount').value);
            const maxLeaves = parseInt(document.getElementById('maxLeaves').value);
            
            if (isNaN(deduction) || deduction < 0) {
                alert('Please enter valid deduction amount');
                return;
            }
            
            if (isNaN(maxLeaves) || maxLeaves < 0) {
                alert('Please enter valid maximum leaves');
                return;
            }
            
            settings.deductionPerAbsent = deduction;
            settings.maxLeaves = maxLeaves;
            
            // Save to localStorage
            saveDataToStorage();
            
            alert('Settings saved successfully!');
        }
        
        // Add holiday
        function addHoliday() {
            const holidayDate = document.getElementById('holidayDate').value;
            const description = document.getElementById('holidayDescription').value.trim() || 'Holiday';
            
            if (!holidayDate) {
                alert('Please select a date');
                return;
            }
            
            const date = new Date(holidayDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = date.getDate();
            
            const monthKey = `${year}-${month}`;
            
            if (!holidays[monthKey]) {
                holidays[monthKey] = {};
            }
            
            // Check if this day is a Sunday
            if (date.getDay() === 0) {
                alert('Selected date is a Sunday, which is already a holiday');
                return;
            }
            
            // Add holiday
            holidays[monthKey][day] = description;
            
            // Save to localStorage
            saveDataToStorage();
            
            // Clear form
            document.getElementById('holidayDate').value = '';
            document.getElementById('holidayDescription').value = '';
            
            // Update holidays list
            renderHolidaysList();
            
            alert('Holiday added successfully!');
        }
        
        // Remove holiday
        function removeHoliday(monthKey, day) {
            if (!confirm('Are you sure you want to remove this holiday?')) {
                return;
            }
            
            if (holidays[monthKey] && holidays[monthKey][day]) {
                delete holidays[monthKey][day];
                
                // If no more holidays in this month, remove the month entry
                if (Object.keys(holidays[monthKey]).length === 0) {
                    delete holidays[monthKey];
                }
                
                // Save to localStorage
                saveDataToStorage();
                
                // Update holidays list
                renderHolidaysList();
                
                alert('Holiday removed successfully!');
            }
        }
        
        // Render holidays list
        function renderHolidaysList() {
            const container = document.getElementById('holidayList');
            container.innerHTML = '';
            
            if (Object.keys(holidays).length === 0) {
                container.innerHTML = '<div class="text-muted">No holidays added yet</div>';
                return;
            }
            
            // Sort months chronologically
            const sortedMonths = Object.keys(holidays).sort();
            
            sortedMonths.forEach(monthKey => {
                const [year, month] = monthKey.split('-');
                const monthNameStr = monthName(parseInt(month));
                
                const monthHeader = document.createElement('div');
                monthHeader.className = 'fw-bold mt-2';
                monthHeader.textContent = `${monthNameStr} ${year}`;
                container.appendChild(monthHeader);
                
                // Sort days numerically
                const sortedDays = Object.keys(holidays[monthKey]).sort((a, b) => a - b);
                
                sortedDays.forEach(day => {
                    const holidayItem = document.createElement('div');
                    holidayItem.className = 'd-flex justify-content-between align-items-center py-1';
                    
                    const holidayText = document.createElement('span');
                    holidayText.textContent = `${day} ${monthNameStr}: ${holidays[monthKey][day]}`;
                    
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'badge bg-danger holiday-badge';
                    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    removeBtn.addEventListener('click', () => removeHoliday(monthKey, day));
                    
                    holidayItem.appendChild(holidayText);
                    holidayItem.appendChild(removeBtn);
                    container.appendChild(holidayItem);
                });
            });
        }
        
        // Export all system data to a JSON file
        function exportData() {
            // Prepare all data to be exported
            const exportData = {
                employees: employees,
                attendanceRecords: attendanceRecords,
                settings: settings,
                holidays: holidays,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    system: "Employee Attendance System",
                    version: "1.0"
                }
            };

            // Create a JSON string
            const dataStr = JSON.stringify(exportData, null, 2);
            
            // Create a blob from the JSON string
            const blob = new Blob([dataStr], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employee_attendance_system_export_${new Date().toISOString().split('T')[0]}.json`;
            
            // Trigger the download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Show success message
            alert('Data exported successfully!');
        }

        // Import data from JSON file
        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!confirm('WARNING: Importing data will overwrite all current data. Continue?')) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate the imported data structure
                    if (!importedData.employees || !importedData.attendanceRecords || 
                        !importedData.settings || !importedData.holidays) {
                        throw new Error('Invalid data format');
                    }

                    // Replace current data with imported data
                    employees = importedData.employees;
                    attendanceRecords = importedData.attendanceRecords;
                    settings = importedData.settings;
                    holidays = importedData.holidays;

                    // Save to localStorage
                    saveDataToStorage();

                    // Refresh the UI
                    populateEmployeeDropdowns();
                    renderEmployeeTable();
                    renderHolidaysList();
                    loadSettings();

                    // Clear the file input
                    event.target.value = '';

                    alert('Data imported successfully!');
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Error importing data: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
        
        // Download attendance calendar as PDF
        function downloadAttendancePdf() {
            const month = document.getElementById('attendanceMonth').value;
            const employeeId = document.getElementById('attendanceEmployee').value;
            
            if (!month || !employeeId) {
                alert('Please load attendance data first');
                return;
            }
            
            const [year, monthNum] = month.split('-');
            const employee = employees.find(t => t.id === parseInt(employeeId));
            const employeeName = employee ? employee.name : 'Unknown Employee';
            const monthNameStr = monthName(parseInt(monthNum));
            
            // Create a new PDF document
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text(`Attendance Report - ${employeeName}`, 105, 15, { align: 'center' });
            doc.setFontSize(14);
            doc.text(`${monthNameStr} ${year}`, 105, 22, { align: 'center' });
            
            // Prepare calendar data for PDF
            const monthAttendance = attendanceRecords[employeeId]?.[month] || {};
            const monthHolidays = holidays[month] || {};
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            
            // Create table data
            const tableData = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Initialize week rows
            let currentWeek = [];
            
            // Add empty cells for days before the first day of the month
            const firstDayOfWeek = new Date(year, monthNum - 1, 1).getDay();
            for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push('');
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNum - 1, day);
                const dayOfWeek = date.getDay();
                
                // Start new row if it's Sunday
                if (dayOfWeek === 0 && currentWeek.length > 0) {
                    tableData.push(currentWeek);
                    currentWeek = [];
                }
                
                // Check if this is a holiday
                const isHoliday = monthHolidays[day];
                
                // Get attendance status
                let attendanceStatus = monthAttendance[day] || '';
                if (isHoliday) {
                    attendanceStatus = 'H';
                }
                
                let statusText = '';
                switch (attendanceStatus) {
                    case 'P': statusText = 'P'; break;
                    case 'A': statusText = 'A'; break;
                    case 'L': statusText = 'L'; break;
                    case 'H': statusText = 'H'; break;
                    default: statusText = '';
                }
                
                currentWeek.push(`${day}\n${statusText}`);
                
                // End of week or end of month
                if (dayOfWeek === 6 || day === daysInMonth) {
                    tableData.push(currentWeek);
                    currentWeek = [];
                }
            }
            
            // Add table to PDF
            doc.autoTable({
                head: [dayNames],
                body: tableData,
                startY: 30,
                styles: {
                    cellPadding: 5,
                    fontSize: 10,
                    valign: 'middle',
                    halign: 'center'
                },
                columnStyles: {
                    0: { fillColor: [240, 240, 240] }, // Sunday
                    6: { fillColor: [240, 240, 240] }  // Saturday
                },
                didDrawCell: function(data) {
                    if (data.section === 'body') {
                        const cellValue = data.cell.raw;
                        if (typeof cellValue === 'string') {
                            const dayNumber = cellValue.split('\n')[0];
                            const status = cellValue.split('\n')[1];
                            
                            // Set different background colors based on status
                            if (status === 'P') {
                                data.cell.styles.fillColor = [212, 237, 218]; // Present - green
                            } else if (status === 'A') {
                                data.cell.styles.fillColor = [248, 215, 218]; // Absent - red
                            } else if (status === 'L') {
                                data.cell.styles.fillColor = [255, 243, 205]; // Leave - yellow
                            } else if (status === 'H') {
                                data.cell.styles.fillColor = [232, 214, 240]; // Holiday - purple
                            }
                        }
                    }
                }
            });
            
            // Add summary
            const presentCount = parseInt(document.getElementById('presentDays').textContent) || 0;
            const absentCount = parseInt(document.getElementById('absentDays').textContent) || 0;
            const leaveCount = parseInt(document.getElementById('leaveDays').textContent) || 0;
            const deduction = document.getElementById('salaryDeduction').textContent;
            
            doc.setFontSize(12);
            doc.text(`Present: ${presentCount} days`, 20, doc.autoTable.previous.finalY + 15);
            doc.text(`Absent: ${absentCount} days`, 20, doc.autoTable.previous.finalY + 25);
            doc.text(`Leave: ${leaveCount} days`, 20, doc.autoTable.previous.finalY + 35);
            doc.text(`Salary Deduction: ${deduction}`, 20, doc.autoTable.previous.finalY + 45);
            
            // Save the PDF
            doc.save(`Attendance_${employeeName.replace(/ /g, '_')}_${monthNameStr}_${year}.pdf`);
        }
        
        // Reset all data
        function resetAllData() {
            // Reset all data structures
            employees = [];
            attendanceRecords = {};
            holidays = {};
            settings = {
                deductionPerAbsent: 500,
                maxLeaves: 1
            };
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            populateEmployeeDropdowns();
            renderEmployeeTable();
            document.getElementById('attendanceCalendar').innerHTML = `
                <div class="alert alert-info">
                    Please select a month and employee to view attendance.
                </div>
            `;
            
            // Reset analytics
            document.getElementById('employeeAnalyticsContainer').innerHTML = '';
            if (attendanceChart) {
                attendanceChart.destroy();
                attendanceChart = null;
            }
            
            // Reset holidays list
            renderHolidaysList();
            
            // Reset settings inputs
            loadSettings();
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('resetDataModal')).hide();
            
            alert('All data has been reset successfully!');
        }
        
        // Helper function to get employee name by ID
        function employeeNameById(employeeId) {
            const employee = employees.find(t => t.id === parseInt(employeeId));
            return employee ? employee.name : 'Unknown Employee';
        }
        
        // Helper function to get month name
        function monthName(monthNum) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return months[monthNum - 1] || '';
        }