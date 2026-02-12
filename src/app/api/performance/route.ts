import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "cycles" or "appraisals"

    if (type === "cycles") {
      const endpoint = "/api/resource/Appraisal Cycle?fields=[\"name\",\"cycle_name\",\"start_date\",\"end_date\"]&order_by=creation desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "appraisals") {
      const endpoint = "/api/resource/Appraisal?fields=[\"name\",\"employee\",\"employee_name\",\"appraisal_cycle\",\"total_score\"]&order_by=creation desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: fetch both
    const [cyclesRes, appraisalsRes] = await Promise.all([
      fetchFromFrappe("/api/resource/Appraisal Cycle?fields=[\"name\",\"cycle_name\",\"start_date\",\"end_date\"]&order_by=creation desc"),
      fetchFromFrappe("/api/resource/Appraisal?fields=[\"name\",\"employee\",\"employee_name\",\"appraisal_cycle\",\"total_score\"]&order_by=creation desc")
    ]);

    return NextResponse.json({
      cycles: cyclesRes.data || [],
      appraisals: appraisalsRes.data || []
    });
  } catch (error: any) {
    console.error("PERF_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "cycle") {
      const endpoint = "/api/resource/Appraisal Cycle";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify({
          cycle_name: data.cycle_name,
          start_date: data.start_date,
          end_date: data.end_date,
          company: data.company || "Test-Prajjwal",
          status: "Not Started"
        })
      });
      return NextResponse.json(result.data);
    }

    if (type === "initiate_appraisals") {
      const { cycle_name } = data;
      if (!cycle_name) throw new Error("cycle_name is required");

      // 1. Ensure KRAs exist
      const names = ["Technical Skills", "Teamwork", "Professionalism"];
      for (const name of names) {
        const check = await fetchFromFrappe(`/api/resource/KRA/${name}`).catch(() => null);
        if (!check || !check.data) {
          console.log(`Creating KRA: ${name}...`);
          await fetchFromFrappe("/api/resource/KRA", {
            method: "POST",
            body: JSON.stringify({ title: name })
          }).catch(err => console.error(`Failed to create KRA ${name}:`, err.message));
        }
      }

      // 2. Ensure Employee Feedback Criteria exist
      for (const name of names) {
        const check = await fetchFromFrappe(`/api/resource/Employee Feedback Criteria/${name}`).catch(() => null);
        if (!check || !check.data) {
          console.log(`Creating criteria: ${name}...`);
          await fetchFromFrappe("/api/resource/Employee Feedback Criteria", {
            method: "POST",
            body: JSON.stringify({ criteria: name })
          }).catch(err => console.error(`Failed to create criteria ${name}:`, err.message));
        }
      }

      // 3. Ensure General Appraisal Template exists
      const templateName = "General Performance Template";
      const templateCheck = await fetchFromFrappe(`/api/resource/Appraisal Template/${templateName}`).catch(() => null);

      if (!templateCheck || !templateCheck.data) {
        console.log("Creating default Appraisal Template...");
        await fetchFromFrappe("/api/resource/Appraisal Template", {
          method: "POST",
          body: JSON.stringify({
            template_title: templateName,
            goals: [
              { key_result_area: "Technical Skills", per_weightage: 40 },
              { key_result_area: "Teamwork", per_weightage: 30 },
              { key_result_area: "Professionalism", per_weightage: 30 }
            ],
            rating_criteria: [
              { criteria: "Technical Skills", per_weightage: 40 },
              { criteria: "Teamwork", per_weightage: 30 },
              { criteria: "Professionalism", per_weightage: 30 }
            ]
          })
        });
      }

      // 4. Link designations without templates to this template
      const designationsRes = await fetchFromFrappe("/api/resource/Designation?fields=[\"name\",\"appraisal_template\"]");
      const designations = designationsRes.data || [];
      
      for (const des of designations) {
        if (!des.appraisal_template) {
          await fetchFromFrappe(`/api/resource/Designation/${des.name}`, {
            method: "PUT",
            body: JSON.stringify({ appraisal_template: templateName })
          });
        }
      }

      // 5. Trigger set_employees on Appraisal Cycle (Instance method)
      const setEmployeesRes = await fetchFromFrappe(`/api/method/run_doc_method`, {
        method: "POST",
        body: JSON.stringify({ 
          dt: "Appraisal Cycle",
          dn: cycle_name,
          method: "set_employees"
        })
      });

      // 6. Persist the appraisees back to the cycle
      // The set_employees method returns the doc with appraisees populated in memory
      if (setEmployeesRes.message && setEmployeesRes.message.appraisees) {
        // Ensure ALL appraisees have a template (fallback to general if designation had none)
        const fixedAppraisees = setEmployeesRes.message.appraisees.map((app: any) => ({
          ...app,
          appraisal_template: app.appraisal_template || templateName
        }));

        await fetchFromFrappe(`/api/resource/Appraisal Cycle/${cycle_name}`, {
          method: "PUT",
          body: JSON.stringify({ 
            appraisees: fixedAppraisees 
          })
        });
      }

      // 7. Trigger create_appraisals on Appraisal Cycle (Instance method)
      const createAppraisalsRes = await fetchFromFrappe(`/api/method/run_doc_method`, {
        method: "POST",
        body: JSON.stringify({ 
          dt: "Appraisal Cycle",
          dn: cycle_name,
          method: "create_appraisals"
        })
      });

      return NextResponse.json({ 
        message: "Initiation triggered successfully",
        details: { setEmployees: setEmployeesRes.message, createAppraisals: createAppraisalsRes.message }
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("PERF_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
