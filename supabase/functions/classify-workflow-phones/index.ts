import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { prompt, phones } = await req.json();

    if (!prompt || !Array.isArray(phones)) {
      return new Response(
        JSON.stringify({ error: "Invalid payload. Use { prompt, phones[] }" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare compact list to keep token usage low
    const compactList = phones.map((p: any) => ({
      phone_number: String(p.phone_number || ""),
      contact_name: p.contact_name || null,
      last_status: p.last_status || null,
      total_calls: Number(p.total_calls || 0),
      total_duration: Number(p.total_duration || 0),
    }));

    const system = `You are an assistant that selects phone records that match a user rule. 
Only return valid JSON with the shape {\"matched\": [\"+123...\"]}. 
- Consider fields: contact_name, last_status, total_calls, total_duration (seconds). 
- Use commonsense but do not invent data. 
- Output only JSON, no extra text.`;

    const userMsg = `Rule (Romanian allowed): ${prompt}\n\nPhone records (JSON array):\n${JSON.stringify(compactList).slice(0, 120000)}\n`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.1,
      }),
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "{}";

    let matched: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.matched)) {
        matched = parsed.matched.map((s: any) => String(s));
      }
    } catch (_) {
      // Try to extract JSON block if model added text
      const m = content.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const parsed2 = JSON.parse(m[0]);
          if (Array.isArray(parsed2?.matched)) {
            matched = parsed2.matched.map((s: any) => String(s));
          }
        } catch (_) {}
      }
    }

    return new Response(JSON.stringify({ matched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("classify-workflow-phones error", error);
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
