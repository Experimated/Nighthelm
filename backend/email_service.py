"""
Email Service Abstraction — NightHelm
======================================
Currently running in SIMULATION mode.

Architecture is designed for easy extension to:
  - Resend (transactional email via API)
  - Gmail OAuth (send as user's personal Gmail)

To enable Resend:
  1. pip install resend && pip freeze > requirements.txt
  2. Set RESEND_API_KEY=your_key in backend/.env
  3. Set SENDER_EMAIL=noreply@yourdomain.com in backend/.env
  4. Set SENDER_MODE=resend in backend/.env
  5. Implement _send_via_resend() below

To enable Gmail OAuth:
  1. Create Google OAuth credentials at console.cloud.google.com
  2. Enable Gmail API
  3. Set SENDER_MODE=gmail in backend/.env
  4. Implement OAuth flow + token storage
  5. Implement _send_via_gmail() below
"""

import os
import logging

logger = logging.getLogger(__name__)

SENDER_MODE = os.environ.get('SENDER_MODE', 'simulation')


async def send_email(
    to: str,
    subject: str,
    body: str,
    reply_to: str = None,
    mode: str = None
) -> dict:
    """
    Send an email via the configured sender.

    Args:
        to: Recipient email address
        subject: Email subject line
        body: Plain text email body
        reply_to: Optional reply-to address
        mode: Override default sender mode

    Returns:
        dict with status, message_id, and metadata
    """
    effective_mode = mode or SENDER_MODE

    if effective_mode == 'simulation':
        return await _simulate_send(to, subject, body, reply_to)
    elif effective_mode == 'resend':
        return await _send_via_resend(to, subject, body, reply_to)
    elif effective_mode == 'gmail':
        return await _send_via_gmail(to, subject, body, reply_to)
    else:
        logger.warning(f"Unknown sender mode '{effective_mode}'. Falling back to simulation.")
        return await _simulate_send(to, subject, body, reply_to)


async def _simulate_send(to, subject, body, reply_to=None):
    """Simulate sending — logs the email, no real delivery."""
    logger.info(f"[SIMULATION] To: {to} | Subject: {subject}")
    logger.info(f"[SIMULATION] Body preview: {body[:80]}...")
    return {
        "status": "simulated",
        "message_id": f"sim_{hash(subject + to)}",
        "to": to,
        "subject": subject,
        "mode": "simulation",
    }


async def _send_via_resend(to, subject, body, reply_to=None):
    """
    Send via Resend API.

    Implementation template:
    ─────────────────────────
    import resend
    resend.api_key = os.environ['RESEND_API_KEY']
    sender_email = os.environ['SENDER_EMAIL']

    params = {
        "from": f"NightHelm <{sender_email}>",
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if reply_to:
        params["reply_to"] = reply_to

    response = resend.Emails.send(params)
    return {"status": "sent", "message_id": response["id"], "mode": "resend"}
    """
    raise NotImplementedError(
        "Resend integration not configured. "
        "Set RESEND_API_KEY and SENDER_EMAIL in backend/.env."
    )


async def _send_via_gmail(to, subject, body, reply_to=None):
    """
    Send via user Gmail (OAuth).

    Requires: google-auth, google-auth-oauthlib, google-api-python-client
    Full OAuth flow implementation needed before use.
    """
    raise NotImplementedError(
        "Gmail OAuth integration not configured. "
        "Implement OAuth flow and token storage first."
    )
