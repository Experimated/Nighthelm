"""
AI Service — NightHelm
======================
Currently running in MOCK mode.

To enable real OpenAI integration:
1. Set OPENAI_API_KEY in backend/.env
2. Replace the body of `generate_excuses` and `analyze_message`
   with OpenAI API calls (see comments below).
3. Restart the backend.

Planned model: gpt-4o-mini (cost-efficient, fast)
"""

import os
import asyncio
from typing import List, Dict, Any

# OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
# Uncomment below when ready to enable real AI:
# from openai import AsyncOpenAI
# openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# ─── Mock Excuse Data ────────────────────────────────────────────────────────

MOCK_EXCUSES: Dict[str, List[Dict]] = {
    "not feeling well": [
        {"label": "Safe", "subject": "Quick update on tomorrow", "body": "I wanted to let you know I'm not feeling my best tonight. I'll follow up first thing in the morning to reschedule."},
        {"label": "Neutral", "subject": "Regarding our plans", "body": "I'm dealing with a minor health matter this evening. I'll be in touch tomorrow morning to discuss next steps."},
        {"label": "Direct", "subject": "Rescheduling request", "body": "I'm under the weather tonight. Could we connect tomorrow to rearrange things?"},
    ],
    "family issue": [
        {"label": "Safe", "subject": "Family matter – brief delay", "body": "I have an unexpected family situation to attend to tonight. I'll reach out in the morning once things settle down."},
        {"label": "Neutral", "subject": "Regarding tomorrow", "body": "A personal family matter has come up this evening. I'll be fully available from the morning onward."},
        {"label": "Direct", "subject": "Family situation", "body": "I need to handle a family matter tonight. Happy to reconnect first thing tomorrow."},
    ],
    "transport problem": [
        {"label": "Safe", "subject": "Transport issue – quick update", "body": "I'm experiencing some unexpected transport difficulties this evening. I'll confirm all details first thing tomorrow morning."},
        {"label": "Neutral", "subject": "Logistics update", "body": "I've run into transport complications tonight. I'll sort this out and reconnect with you in the morning."},
        {"label": "Direct", "subject": "Travel issue tonight", "body": "I'm stuck dealing with a transport problem right now. Let's talk tomorrow to finalise things."},
    ],
    "need to reschedule": [
        {"label": "Safe", "subject": "Rescheduling request", "body": "Something has come up on my end this evening. I'd love to find a better time — I'll reach out in the morning to reschedule."},
        {"label": "Neutral", "subject": "Can we shift our time?", "body": "I need to request a reschedule due to an unexpected development tonight. I'll get in touch tomorrow."},
        {"label": "Direct", "subject": "Reschedule needed", "body": "I need to move our meeting. I'll send over some alternative times tomorrow morning."},
    ],
    "unexpected situation": [
        {"label": "Safe", "subject": "Brief delay – unexpected development", "body": "An unexpected situation has come up that requires my attention tonight. I'll be back in touch first thing tomorrow morning."},
        {"label": "Neutral", "subject": "Something came up", "body": "I've been pulled into an unplanned situation this evening. I'll follow up with you tomorrow."},
        {"label": "Direct", "subject": "Unexpected event tonight", "body": "Something unexpected has come up. Let's connect tomorrow to sort everything out."},
    ],
    "running late": [
        {"label": "Safe", "subject": "Running behind – quick note", "body": "I wanted to give you advance notice that I'm running later than expected. I'll update you on timing first thing tomorrow."},
        {"label": "Neutral", "subject": "Timing update", "body": "I'm running behind this evening and wanted to give you a heads-up. I'll be in touch tomorrow morning."},
        {"label": "Direct", "subject": "Running late tonight", "body": "I'm running late. I'll reach out tomorrow to catch up properly."},
    ],
    "personal matter": [
        {"label": "Safe", "subject": "Personal matter – brief delay", "body": "I have a personal matter to attend to tonight. I'll be fully focused and back in touch with you tomorrow morning."},
        {"label": "Neutral", "subject": "Following up tomorrow", "body": "Something personal has come up this evening. I'll be in touch from tomorrow morning."},
        {"label": "Direct", "subject": "Personal matter tonight", "body": "I have something personal to deal with tonight. Let's catch up tomorrow."},
    ],
}

DEFAULT_EXCUSES = [
    {"label": "Safe", "subject": "Following up tomorrow", "body": "Something has come up tonight on my end. I'll be in touch tomorrow morning to address everything properly."},
    {"label": "Neutral", "subject": "Brief delay – update tomorrow", "body": "I have an unexpected matter to deal with this evening. I'll follow up with you first thing in the morning."},
    {"label": "Direct", "subject": "Getting back to you tomorrow", "body": "I'm tied up tonight. Let's connect tomorrow to sort everything out."},
]

# ─── Mock Analysis Data ──────────────────────────────────────────────────────

ANALYSIS_RISKY = {
    "risk_score": 4,
    "risk_label": "High risk",
    "risk_color": "red",
    "characteristics": [
        {"name": "Professional", "status": "Needs fix", "type": "bad"},
        {"name": "Clear", "status": "Unclear", "type": "bad"},
        {"name": "Believable", "status": "Questionable", "type": "neutral"},
        {"name": "Too emotional", "status": "Too strong", "type": "bad"},
    ],
    "safer_version": {"subject": "Following up on tomorrow", "body": "I wanted to give you a heads-up that I won't be able to make it tomorrow morning. Something unexpected has come up. Let's reconnect soon to reschedule."},
    "shorter_version": {"subject": "Tomorrow – quick update", "body": "Something has come up — I won't be available tomorrow morning. Will reach out to reschedule."},
}

ANALYSIS_MODERATE = {
    "risk_score": 3,
    "risk_label": "Moderate risk",
    "risk_color": "orange",
    "characteristics": [
        {"name": "Professional", "status": "Needs fix", "type": "bad"},
        {"name": "Clear", "status": "Good", "type": "good"},
        {"name": "Believable", "status": "Good", "type": "good"},
        {"name": "Too emotional", "status": "Moderate", "type": "neutral"},
    ],
    "safer_version": {"subject": "Update on tomorrow", "body": "I wanted to let you know that I won't be available tomorrow morning. Something personal has come up. I'll follow up to find a better time."},
    "shorter_version": {"subject": "Tomorrow – brief update", "body": "Something personal has come up and I won't be available tomorrow morning. Happy to reschedule soon."},
}

ANALYSIS_SAFE = {
    "risk_score": 1,
    "risk_label": "Looks safe",
    "risk_color": "green",
    "characteristics": [
        {"name": "Professional", "status": "Good", "type": "good"},
        {"name": "Clear", "status": "Good", "type": "good"},
        {"name": "Believable", "status": "Good", "type": "good"},
        {"name": "Too emotional", "status": "Calm", "type": "good"},
    ],
    "safer_version": {"subject": "Quick note", "body": "I wanted to reach out with a brief update. I'll have more details for you first thing tomorrow morning."},
    "shorter_version": {"subject": "Quick note", "body": "Brief update coming tomorrow morning — just wanted to flag in advance."},
}


# ─── Functions ────────────────────────────────────────────────────────────────

async def generate_excuses(reason: str, recipient_type: str) -> List[Dict[str, Any]]:
    """
    Generate professional excuses for a given situation.

    MOCK MODE: Returns pre-written responses with a simulated delay.

    To enable real OpenAI:
    ─────────────────────
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional communication assistant..."},
            {"role": "user", "content": f"Generate 3 excuses for: {reason}. Recipient type: {recipient_type}"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)["excuses"]
    """
    await asyncio.sleep(1.5)
    return MOCK_EXCUSES.get(reason.lower(), DEFAULT_EXCUSES)


async def analyze_message(text: str, recipient_type: str = "colleague") -> Dict[str, Any]:
    """
    Analyze a message for professional risk.

    MOCK MODE: Uses simple keyword heuristics to classify risk.

    To enable real OpenAI:
    ─────────────────────
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional communication risk analyzer..."},
            {"role": "user", "content": f"Analyze this message: {text}"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
    """
    await asyncio.sleep(1.5)

    text_lower = text.lower()
    emotional_words = ["sorry", "can't", "won't", "please", "urgent", "asap", "desperate", "!!!"]
    risky_words = ["drunk", "tired", "sick", "angry", "frustrated", "stressed", "hate", "miss you"]

    risky_count = sum(1 for w in risky_words if w in text_lower)
    emotional_count = sum(1 for w in emotional_words if w in text_lower)

    if risky_count >= 1 or emotional_count >= 3:
        return ANALYSIS_RISKY
    elif emotional_count >= 1:
        return ANALYSIS_MODERATE
    else:
        return ANALYSIS_SAFE
