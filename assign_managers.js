// Script to assign multiple managers in Frappe

async function assignManagers() {
  const FRAPPE_URL = "http://167.71.197.132";
  const API_KEY = "0af0bd0489bee94";
  const API_SECRET = "2b67ba6b66aadb7";

  const headers = {
    'Authorization': `token ${API_KEY}:${API_SECRET}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const employees = [
    "EMP-020", "EMP-021", "EMP-022", "EMP-023", 
    "EMP-024", "EMP-025", "EMP-026", "EMP-027", "EMP-029"
  ];

  for (const empId of employees) {
      console.log(`Setting up managers for ${empId}...`);
      
      try {
        // In Frappe, the primary manager is 'reports_to', but you can add multiple managers 
        // using the 'Employee Internal Work History' child table if configured, but a simpler 
        // approach for Super Admins is to give the admins cross-company view rights. 
        // However, since the Team page strictly filters by 'manager_id', we will add 
        // both Nithesh and Prajjwal as managers. 
        
        // Wait, standard Frappe 'Employee' only has ONE direct 'reports_to' field. 
        // We cannot assign two managers directly in that single field.
        // Let's set Nithesh as primary 'reports_to', but then we will have to modify 
        // the `/api/team` code logic to show all employees to ANY Super Admin.
      } catch (e) {
         console.error(e);
      }
  }
}

assignManagers();
