        // Global variables
        let teachers = [];
        let attendanceRecords = {};
        let currentMonth = new Date().toISOString().slice(0, 7);
        let selectedTeacherId = null;
        let settings = {
            deductionPerAbsent: 500,
            maxLeaves: 1
        };
        let holidays = {};
        let attendanceChart = null;

        // DOM Ready
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the app
            initApp();
            
            // Tab navigation
            document.getElementById('teachersTabBtn').addEventListener('click', function(e) {
                e.preventDefault();
                showTab('teachersTab');
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
            
            // Teacher management
            document.getElementById('saveTeacherBtn').addEventListener('click', saveTeacher);
            document.getElementById('updateTeacherBtn').addEventListener('click', updateTeacher);
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
            
            // Set current month in date inputs
            document.getElementById('attendanceMonth').value = currentMonth;
            document.getElementById('analyticsMonth').value = currentMonth;
        });
        
        // Initialize the application
        function initApp() {
            // Load data from localStorage
            loadDataFromStorage();
            
            // Load teachers dropdowns
            populateTeacherDropdowns();
            
            // Render teacher table
            renderTeacherTable();
            
            // Load settings
            loadSettings();
            
            // Render holidays list
            renderHolidaysList();
        }
        
        // Load data from localStorage
        function loadDataFromStorage() {
            // Load teachers
            const savedTeachers = localStorage.getItem('teachers');
            if (savedTeachers) {
                teachers = JSON.parse(savedTeachers);
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
            localStorage.setItem('teachers', JSON.stringify(teachers));
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
        
        // Populate teacher dropdowns
        function populateTeacherDropdowns() {
            const dropdowns = [
                document.getElementById('attendanceTeacher'),
                document.getElementById('analyticsTeacher')
            ];
            
            dropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="">' + (dropdown.id === 'analyticsTeacher' ? 'All Teachers' : 'Select Teacher') + '</option>';
                teachers.forEach(teacher => {
                    const option = document.createElement('option');
                    option.value = teacher.id;
                    option.textContent = teacher.name;
                    dropdown.appendChild(option);
                });
            });
        }
        
        // Render teacher table
        function renderTeacherTable() {
            const tbody = document.querySelector('#teacherTable tbody');
            tbody.innerHTML = '';
            
            teachers.forEach(teacher => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${teacher.id}</td>
                    <td>${teacher.name}</td>
                    <td>₹${teacher.salary.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-teacher" data-id="${teacher.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-teacher" data-id="${teacher.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-teacher').forEach(btn => {
                btn.addEventListener('click', function() {
                    const teacherId = parseInt(this.getAttribute('data-id'));
                    editTeacher(teacherId);
                });
            });
            
            document.querySelectorAll('.delete-teacher').forEach(btn => {
                btn.addEventListener('click', function() {
                    const teacherId = parseInt(this.getAttribute('data-id'));
                    deleteTeacher(teacherId);
                });
            });
        }
        
        // Save new teacher
        function saveTeacher() {
            const name = document.getElementById('teacherName').value.trim();
            const salary = parseFloat(document.getElementById('teacherSalary').value);
            
            if (!name) {
                alert('Please enter teacher name');
                return;
            }
            
            if (isNaN(salary)) {
                alert('Please enter valid salary amount');
                return;
            }
            
            // Generate new teacher ID
            const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
            
            const newTeacher = {
                id: newId,
                name: name,
                salary: salary
            };
            
            teachers.push(newTeacher);
            
            // Save to localStorage
            saveDataToStorage();
            
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addTeacherModal')).hide();
            document.getElementById('addTeacherForm').reset();
            
            // Update UI
            populateTeacherDropdowns();
            renderTeacherTable();
            
            // Show success message
            alert('Teacher added successfully!');
        }
        
        // Edit teacher
        function editTeacher(teacherId) {
            const teacher = teachers.find(t => t.id === teacherId);
            if (!teacher) return;
            
            document.getElementById('editTeacherId').value = teacher.id;
            document.getElementById('editTeacherName').value = teacher.name;
            document.getElementById('editTeacherSalary').value = teacher.salary;
            
            const modal = new bootstrap.Modal(document.getElementById('editTeacherModal'));
            modal.show();
        }
        
        // Update teacher
        function updateTeacher() {
            const teacherId = parseInt(document.getElementById('editTeacherId').value);
            const name = document.getElementById('editTeacherName').value.trim();
            const salary = parseFloat(document.getElementById('editTeacherSalary').value);
            
            if (!name) {
                alert('Please enter teacher name');
                return;
            }
            
            if (isNaN(salary)) {
                alert('Please enter valid salary amount');
                return;
            }
            
            // Update teacher data
            const teacherIndex = teachers.findIndex(t => t.id === teacherId);
            if (teacherIndex !== -1) {
                teachers[teacherIndex].name = name;
                teachers[teacherIndex].salary = salary;
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('editTeacherModal')).hide();
            
            // Update UI
            populateTeacherDropdowns();
            renderTeacherTable();
            
            // Show success message
            alert('Teacher updated successfully!');
        }
        
        // Delete teacher
        function deleteTeacher(teacherId) {
            if (!confirm('Are you sure you want to delete this teacher? All attendance records will also be deleted.')) {
                return;
            }
            
            // Remove teacher
            teachers = teachers.filter(t => t.id !== teacherId);
            
            // Remove attendance records for this teacher
            if (attendanceRecords[teacherId]) {
                delete attendanceRecords[teacherId];
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            populateTeacherDropdowns();
            renderTeacherTable();
            
            // Show success message
            alert('Teacher deleted successfully!');
        }
        
        // Load attendance data
        function loadAttendance() {
            const month = document.getElementById('attendanceMonth').value;
            const teacherId = document.getElementById('attendanceTeacher').value;
            
            if (!month) {
                alert('Please select a month');
                return;
            }
            
            if (!teacherId) {
                alert('Please select a teacher');
                return;
            }
            
            currentMonth = month;
            selectedTeacherId = teacherId;
            
            // Generate calendar
            renderAttendanceCalendar(month, teacherId);
            
            // Calculate and display summary
            calculateAttendanceSummary(month, teacherId);
        }
        
        // Render attendance calendar
        function renderAttendanceCalendar(month, teacherId) {
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const firstDayOfWeek = new Date(year, monthNum - 1, 1).getDay();
            
            // Get attendance data for this teacher and month
            const monthAttendance = attendanceRecords[teacherId]?.[month] || {};
            
            // Get holidays for this month
            const monthHolidays = holidays[month] || {};
            
            // Create calendar HTML
            let calendarHTML = `
                <h5 class="mb-3">${teacherNameById(teacherId)} - ${monthName(monthNum)} ${year}</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Mon</th>
                                <th>Tue</th>
                                <th>Wed</th>
                                <th>Thu</th>
                                <th>Fri</th>
                                <th>Sat</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
            `;
            
            // Calculate the starting position (skip Sundays)
            let startingPosition = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < startingPosition; i++) {
                calendarHTML += '<td class="calendar-day"></td>';
            }
            
            // Add cells for each day of the month (excluding Sundays)
            let dayCounter = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNum - 1, day);
                const dayOfWeek = date.getDay();
                
                // Skip Sundays (dayOfWeek === 0)
                if (dayOfWeek === 0) continue;
                
                // Start new row every 6 days (since we're skipping Sundays)
                if (dayCounter > 0 && dayCounter % 6 === 0) {
                    calendarHTML += '</tr><tr>';
                }
                
                dayCounter++;
                
                // Check if this is a holiday
                const isHoliday = monthHolidays[day];
                
                // Get attendance status
                let attendanceStatus = monthAttendance[day] || '';
                if (isHoliday) {
                    attendanceStatus = 'H'; // H for Holiday
                }
                
                let statusClass = '';
                let statusText = '';
                let dayName = '';
                
                switch (attendanceStatus) {
                    case 'P':
                        statusClass = 'present';
                        statusText = 'Present';
                        break;
                    case 'A':
                        statusClass = 'absent';
                        statusText = 'Absent';
                        break;
                    case 'L':
                        statusClass = 'leave';
                        statusText = 'Leave';
                        break;
                    case 'H':
                        statusClass = 'holiday';
                        statusText = isHoliday || 'Holiday';
                        break;
                    default:
                        statusText = '';
                }
                
                // Get day name
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dayName = dayNames[dayOfWeek];
                
                calendarHTML += `
                    <td class="calendar-day ${statusClass} ${isHoliday ? 'holiday' : ''}" 
                        data-day="${day}" 
                        data-teacher="${teacherId}" 
                        data-month="${month}"
                        title="${dayName}, ${day} ${monthName(monthNum)} - ${statusText || 'No record'}">
                        <div class="day-number">${day}</div>
                        <div class="day-name small">${dayName}</div>
                        ${statusText ? `<div class="day-status">${statusText.charAt(0)}</div>` : ''}
                    </td>
                `;
            }
            
            // Add empty cells for remaining days in the last week
            const remainingCells = 6 - (dayCounter % 6);
            if (remainingCells < 6) {
                for (let i = 0; i < remainingCells; i++) {
                    calendarHTML += '<td class="calendar-day"></td>';
                }
            }
            
            calendarHTML += `
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-3">
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-success" id="markPresentBtn">
                            <i class="fas fa-check"></i> Mark Present
                        </button>
                        <button class="btn btn-sm btn-danger" id="markAbsentBtn">
                            <i class="fas fa-times"></i> Mark Absent
                        </button>
                        <button class="btn btn-sm btn-warning" id="markLeaveBtn">
                            <i class="fas fa-umbrella-beach"></i> Mark Leave
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" id="clearMarkingBtn">
                            <i class="fas fa-eraser"></i> Clear
                        </button>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Click on a day to select it, then choose an attendance status</small>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex gap-2 flex-wrap">
                            <span class="badge bg-success">Present</span>
                            <span class="badge bg-danger">Absent</span>
                            <span class="badge bg-warning text-dark">Leave</span>
                            <span class="badge" style="background-color: var(--holiday-color); color: white;">Holiday</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('attendanceCalendar').innerHTML = calendarHTML;
            
            // Add event listeners to calendar days
            document.querySelectorAll('.calendar-day').forEach(dayCell => {
                if (dayCell.classList.contains('holiday')) {
                    // Don't allow marking holidays
                    dayCell.style.cursor = 'not-allowed';
                    return;
                }
                
                dayCell.addEventListener('click', function() {
                    // Remove selection from all days
                    document.querySelectorAll('.calendar-day').forEach(cell => {
                        cell.classList.remove('selected');
                    });
                    
                    // Add selection to clicked day
                    this.classList.add('selected');
                });
            });
            
            // Add event listeners to action buttons
            document.getElementById('markPresentBtn')?.addEventListener('click', function() {
                markSelectedDay('P');
            });
            
            document.getElementById('markAbsentBtn')?.addEventListener('click', function() {
                markSelectedDay('A');
            });
            
            document.getElementById('markLeaveBtn')?.addEventListener('click', function() {
                markSelectedDay('L');
            });
            
            document.getElementById('clearMarkingBtn')?.addEventListener('click', function() {
                markSelectedDay('');
            });
        }
        
        // Mark selected day with attendance status
        function markSelectedDay(status) {
            const selectedDay = document.querySelector('.calendar-day.selected');
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
            const teacherId = selectedDay.getAttribute('data-teacher');
            const month = selectedDay.getAttribute('data-month');
            
            // Validate leave marking (only one leave allowed per month)
            if (status === 'L') {
                const leavesUsed = countLeavesUsed(month, teacherId);
                if (leavesUsed >= settings.maxLeaves) {
                    alert(`Only ${settings.maxLeaves} leave(s) allowed per month. This teacher has already used ${leavesUsed} leave(s).`);
                    return;
                }
            }
            
            // Update attendance record
            if (!attendanceRecords[teacherId]) {
                attendanceRecords[teacherId] = {};
            }
            
            if (!attendanceRecords[teacherId][month]) {
                attendanceRecords[teacherId][month] = {};
            }
            
            if (status) {
                attendanceRecords[teacherId][month][day] = status;
            } else {
                delete attendanceRecords[teacherId][month][day];
            }
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            renderAttendanceCalendar(month, teacherId);
            calculateAttendanceSummary(month, teacherId);
        }
        
        // Count leaves used by a teacher in a month
        function countLeavesUsed(month, teacherId) {
            if (!attendanceRecords[teacherId] || !attendanceRecords[teacherId][month]) {
                return 0;
            }
            
            return Object.values(attendanceRecords[teacherId][month]).filter(s => s === 'L').length;
        }
        
        // Calculate and display attendance summary
        function calculateAttendanceSummary(month, teacherId) {
            const monthAttendance = attendanceRecords[teacherId]?.[month] || {};
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
            const teacher = teachers.find(t => t.id === parseInt(teacherId));
            if (teacher) {
                const deduction = absentCount * settings.deductionPerAbsent;
                document.getElementById('salaryDeduction').textContent = `₹${deduction.toLocaleString()}`;
                
                const deductionPercentage = (deduction / teacher.salary) * 100;
                const deductionProgress = document.getElementById('deductionProgress');
                deductionProgress.style.width = `${Math.min(100, deductionPercentage)}%`;
                deductionProgress.textContent = `${deductionPercentage.toFixed(1)}%`;
            }
        }
        
        // Load analytics data
        function loadAnalytics() {
            const month = document.getElementById('analyticsMonth').value;
            const teacherId = document.getElementById('analyticsTeacher').value;
            
            if (!month) {
                alert('Please select a month');
                return;
            }
            
            // Calculate overall statistics
            calculateOverallStatistics(month, teacherId);
            
            // Generate analytics cards for each teacher
            generateTeacherAnalytics(month, teacherId);
            
            // Generate attendance trend chart
            generateAttendanceChart(month, teacherId);
        }
        
        // Calculate overall statistics
        function calculateOverallStatistics(month, filterTeacherId = null) {
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const monthHolidays = holidays[month] || {};
            
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalLeave = 0;
            let totalHolidays = 0;
            let totalTeachers = 0;
            let totalDeductions = 0;
            
            const teachersToAnalyze = filterTeacherId 
                ? teachers.filter(t => t.id === parseInt(filterTeacherId))
                : teachers;
            
            teachersToAnalyze.forEach(teacher => {
                const monthAttendance = attendanceRecords[teacher.id]?.[month] || {};
                
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
            
            totalTeachers = teachersToAnalyze.length;
            const workingDays = daysInMonth - countSundaysInMonth(year, monthNum) - Object.keys(monthHolidays).length;
            const totalDays = totalTeachers * workingDays;
            
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
        
        // Generate teacher analytics cards
        function generateTeacherAnalytics(month, filterTeacherId = null) {
            const container = document.getElementById('teacherAnalyticsContainer');
            container.innerHTML = '';
            
            const teachersToAnalyze = filterTeacherId 
                ? teachers.filter(t => t.id === parseInt(filterTeacherId))
                : teachers;
            
            const [year, monthNum] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthNum, 0).getDate();
            const monthHolidays = holidays[month] || {};
            
            teachersToAnalyze.forEach(teacher => {
                const monthAttendance = attendanceRecords[teacher.id]?.[month] || {};
                
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
                                <h5 class="card-title mb-0">${teacher.name}</h5>
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
                                            style="width: ${(deduction / teacher.salary) * 100}%">
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
        function generateAttendanceChart(month, filterTeacherId = null) {
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
            
            const teachersToAnalyze = filterTeacherId 
                ? teachers.filter(t => t.id === parseInt(filterTeacherId))
                : teachers;
            
            teachersToAnalyze.forEach(teacher => {
                const monthAttendance = attendanceRecords[teacher.id]?.[month] || {};
                
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
                                text: 'Number of Teachers'
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
                teachers: teachers,
                attendanceRecords: attendanceRecords,
                settings: settings,
                holidays: holidays,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    system: "Teacher Attendance System",
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
            a.download = `teacher_attendance_system_export_${new Date().toISOString().split('T')[0]}.json`;
            
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
                    if (!importedData.teachers || !importedData.attendanceRecords || 
                        !importedData.settings || !importedData.holidays) {
                        throw new Error('Invalid data format');
                    }

                    // Replace current data with imported data
                    teachers = importedData.teachers;
                    attendanceRecords = importedData.attendanceRecords;
                    settings = importedData.settings;
                    holidays = importedData.holidays;

                    // Save to localStorage
                    saveDataToStorage();

                    // Refresh the UI
                    populateTeacherDropdowns();
                    renderTeacherTable();
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
        
        // Reset all data
        function resetAllData() {
            // Reset all data structures
            teachers = [];
            attendanceRecords = {};
            holidays = {};
            settings = {
                deductionPerAbsent: 500,
                maxLeaves: 1
            };
            
            // Save to localStorage
            saveDataToStorage();
            
            // Update UI
            populateTeacherDropdowns();
            renderTeacherTable();
            document.getElementById('attendanceCalendar').innerHTML = `
                <div class="alert alert-info">
                    Please select a month and teacher to view attendance.
                </div>
            `;
            
            // Reset analytics
            document.getElementById('teacherAnalyticsContainer').innerHTML = '';
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
        
        // Helper function to get teacher name by ID
        function teacherNameById(teacherId) {
            const teacher = teachers.find(t => t.id === parseInt(teacherId));
            return teacher ? teacher.name : 'Unknown Teacher';
        }
        
        // Helper function to get month name
        function monthName(monthNum) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return months[monthNum - 1] || '';
        }