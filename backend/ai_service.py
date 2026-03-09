import os
import json
from typing import List, Dict, Any

from openai import AsyncOpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


# ─────────────────────────────────────────
# Generate Excuses
# ─────────────────────────────────────────

async def generate_excuses(reason: str, recipient_type: str) -> List[Dict[str, Any]]:

    system_prompt = """
You are a professional communication assistant.

Your task:
Generate 3 professional "excuse messages" that someone can send the next morning.

Rules:
- Tone must be calm, professional and believable
- Never sound dramatic or emotional
- Avoid overexplaining
- Keep messages short and realistic
- Assume the sender wants to maintain professionalism

Output format MUST be JSON:

{
 "excuses":[
  {"label":"Safe","subject":"...","body":"..."},
  {"label":"Neutral","subject":"...","body":"..."},
  {"label":"Direct","subject":"...","body":"..."}
 ]
}
"""

    user_prompt = f"""
Reason: {reason}
Recipient type: {recipient_type}

Generate three message options.
"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.7,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)

    return data["excuses"]


# ─────────────────────────────────────────
# Analyze Message
# ─────────────────────────────────────────

async def analyze_message(text: str, recipient_type: str = "colleague") -> Dict[str, Any]:

    system_prompt = """
You are an expert in professional communication risk analysis.

Your task:
Analyze whether a message someone plans to send in the morning
sounds risky, emotional, or unprofessional.

Rules:
- Respond in the SAME LANGUAGE as the input text.
- Be concise and professional.
- Do NOT add greetings, names, signatures, or email formatting.
- Do NOT use placeholders like [Name] or [Your Name].
- Return ONLY the core message text.
- The application will add greeting and signature automatically.

Focus on:
- professionalism
- clarity
- believability
- emotional tone

Return JSON ONLY in this format:

{
 "risk_score": 1-4,
 "risk_label": "...",
 "risk_color": "green/orange/red",
 "characteristics":[
  {"name":"Professional","status":"...","type":"good/bad/neutral"},
  {"name":"Clear","status":"...","type":"good/bad/neutral"},
  {"name":"Believable","status":"...","type":"good/bad/neutral"},
  {"name":"Too emotional","status":"...","type":"good/bad/neutral"}
 ],
 "safer_version":{
  "subject":"...",
  "body":"..."
 },
 "shorter_version":{
  "subject":"...",
  "body":"..."
 }
}
"""

    user_prompt = f"""
Recipient type: {recipient_type}

Analyze this message:

{text}
"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
