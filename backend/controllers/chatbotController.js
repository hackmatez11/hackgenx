import { GeminiService } from "../services/geminiService.js";
import { SupabaseService } from "../services/supabaseService.js";
import { supabase } from "../db/supabaseClient.js"; // Add this import

const geminiService = new GeminiService();
const supabaseService = new SupabaseService();

export const processChatbotQuery = async (req, res, next) => {
  try {
    const { query, tokenNumber } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`Processing query: "${query}" with token: ${tokenNumber}`);

    // Generate SQL from natural language
    let sqlQuery;
    try {
      sqlQuery = await geminiService.generateSQLQuery(query, tokenNumber);
      console.log(`Generated SQL: ${sqlQuery}`);
    } catch (sqlError) {
      console.error("Error generating SQL:", sqlError);
      return res.status(500).json({ 
        error: "Failed to generate SQL query. Please try rephrasing your question.",
        details: sqlError.message 
      });
    }

    // Execute the query
    let data;
    try {
      data = await supabaseService.executeQuery(sqlQuery);
      console.log(`Query executed successfully. Results:`, data);
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      // If query fails, try to use pre-defined functions
      try {
        data = await handleSpecialQueries(query, tokenNumber);
        console.log(`Used special query handler. Results:`, data);
      } catch (specialError) {
        console.error("Special query handler also failed:", specialError);
        return res.status(500).json({ 
          error: "Failed to execute query. Please check your token number or try a different query.",
          details: dbError.message 
        });
      }
    }

    // Generate natural language response
    let response;
    try {
      response = await geminiService.generateNaturalLanguageResponse(
        data,
        query
      );
      console.log(`Generated response: ${response}`);
    } catch (responseError) {
      console.error("Error generating natural language response:", responseError);
      // Fallback to basic response
      response = data && data.length > 0 
        ? `Query executed successfully. Found ${data.length} result(s).`
        : "No results found for your query.";
    }

    res.json({
      success: true,
      data,
      response,
      sql: sqlQuery, // Optional: for debugging
    });
  } catch (error) {
    console.error("Unexpected error in processChatbotQuery:", error);
    next(error);
  }
};

export const getPatientSummary = async (req, res, next) => {
  try {
    const { tokenNumber } = req.params;

    // Get comprehensive patient data
    const history = await supabaseService.getPatientHistory(tokenNumber);

    if (!history || history.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Use Gemini to generate a summary
    const summary = await geminiService.generateNaturalLanguageResponse(
      history,
      "Provide a comprehensive summary of this patient's medical history"
    );

    res.json({
      success: true,
      summary,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// Special handlers for common queries
async function handleSpecialQueries(query, tokenNumber) {
  const queryLower = query.toLowerCase();

  if (queryLower.includes("appointment") && queryLower.includes("status")) {
    const { data } = await supabase
      .from("appointments")
      .select(
        `
        *,
        opd_queue(queue_position, status)
      `
      )
      .eq("token_number", tokenNumber)
      .order("created_at", { ascending: false })
      .limit(1);

    return data;
  }

  if (queryLower.includes("bed") || queryLower.includes("admission")) {
    const { data } = await supabase
      .from("bed_queue")
      .select(
        `
        *,
        beds(*),
        daily_rounds(*)
      `
      )
      .eq("token_number", tokenNumber);

    return data;
  }

  if (queryLower.includes("report") || queryLower.includes("test")) {
    const { data } = await supabase
      .from("medical_reports")
      .select(
        `
        *,
        daily_rounds(*)
      `
      )
      .eq(
        "bed_queue_id",
        supabase.from("bed_queue").select("id").eq("token_number", tokenNumber)
      );

    return data;
  }

  return [];
}
