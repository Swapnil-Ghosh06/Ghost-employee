import json
import logging
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure the Gemini API securely
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

VALID_TOOLS = {
    "reply_slack",
    "run_sql",
    "write_code",
    "create_github_issue",
    "search_past_tasks",
    "ask_clarification",
}

_TOOL_LIST = ", ".join(sorted(VALID_TOOLS))
_JSON_INSTRUCTIONS = (
    "You must respond ONLY with valid JSON in this exact format:\n"
    '{"tool": "<name>", "params": {...}}\n'
    f"Valid tool names: {_TOOL_LIST}\n"
    "Do not include any explanation, markdown, or text outside the JSON object."
)


def run_agent(
    role_description: str,
    incoming_message: str,
    thread_context: list[str],
) -> dict:
    """
    Call Gemini and return a tool-dispatch dict: {"tool": "<name>", "params": {...}}.
    Falls back to ask_clarification if the response is not valid JSON.
    """
    context_block = ""
    if thread_context:
        lines = "\n".join(f"  [{i + 1}] {msg}" for i, msg in enumerate(thread_context))
        context_block = f"\n\nThread context (last {len(thread_context)} messages):\n{lines}"

    user_content = (
        f"Incoming message:\n{incoming_message}"
        f"{context_block}\n\n"
        "Choose the right tool and respond with ONLY the JSON object."
    )

    full_system_instruction = f"{role_description}\n\n{_JSON_INSTRUCTIONS}"

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=full_system_instruction,
        )
        response = model.generate_content(
            user_content,
            generation_config={"response_mime_type": "application/json"},
        )
        raw = response.text.strip()
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        return {
            "tool": "ask_clarification",
            "params": {"reason": f"API error: {exc}"},
        }

    try:
        decision = json.loads(raw)
        tool = decision.get("tool")
        if tool not in VALID_TOOLS:
            raise ValueError(f"Unknown tool '{tool}'")
        if not isinstance(decision.get("params"), dict):
            raise ValueError("'params' must be a JSON object")
        return decision
    except (json.JSONDecodeError, ValueError, AttributeError) as exc:
        logger.warning("Invalid agent response (%s): %r", exc, raw)
        return {
            "tool": "ask_clarification",
            "params": {
                "reason": f"Could not parse agent response: {exc}",
                "raw_response": raw,
            },
        }

