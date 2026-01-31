# How to Add Employees in Frappe

Your authentication is working perfectly! The issue is simply that **you have 0 employees in your database**.

## Quick Way: Add Employees via Frappe Web Interface

### Step 1: Open Frappe
Go to: `http://localhost:8000`

### Step 2: Navigate to Employee List
1. Click the search bar (or press Ctrl+K / Cmd+K)
2. Type "Employee" and press Enter
3. You'll see the Employee List page

### Step 3: Create a New Employee
1. Click the **"+ New"** button (top right)
2. Fill in the required fields:
   - **First Name**: (e.g., "John")
   - **Last Name**: (e.g., "Doe")
   - **Gender**: Select Male/Female
   - **Date of Birth**: Pick any date
   - **Date of Joining**: Pick any date
   - **Company**: Select your company (or create one if needed)
3. Optional fields you can fill:
   - **Designation**: (e.g., "Software Engineer")
   - **Department**: (e.g., "Engineering")
   - **Status**: Keep as "Active"
4. Click **"Save"**

### Step 4: Create a Few More Employees
Repeat Step 3 to create 3-5 employees so you have some data to display.

### Step 5: Refresh Your HRhub Page
Go back to `http://localhost:3000` and refresh the page. You should now see your employees!

---

## Alternative: Quick SQL Insert (Advanced)

If you want to quickly add test data, run this in your terminal:

```bash
cd /Users/prajjwalrchuahna/newOne/HR/frappe-bench
bench --site localhost mariadb
```

Then paste this SQL:

```sql
INSERT INTO tabEmployee (name, employee_name, first_name, last_name, gender, date_of_birth, date_of_joining, company, status, creation, modified, owner, modified_by, docstatus)
VALUES 
('HR-EMP-00001', 'John Doe', 'John', 'Doe', 'Male', '1990-01-15', '2020-01-01', 'Test Company', 'Active', NOW(), NOW(), 'Administrator', 'Administrator', 0),
('HR-EMP-00002', 'Jane Smith', 'Jane', 'Smith', 'Female', '1992-05-20', '2021-03-15', 'Test Company', 'Active', NOW(), NOW(), 'Administrator', 'Administrator', 0),
('HR-EMP-00003', 'Mike Johnson', 'Mike', 'Johnson', 'Male', '1988-11-10', '2019-06-01', 'Test Company', 'Active', NOW(), NOW(), 'Administrator', 'Administrator', 0);
```

Then type `exit` and refresh your HRhub page!
