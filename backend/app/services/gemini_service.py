import json
import re
import logging
from typing import Optional, Tuple
from google import genai
from google.genai import types
from google.genai.errors import APIError

from backend.app.config import settings
from backend.app.schemas import (
    DiagnosisReport,
    ReevaluationReport,
    Hypothesis
)
from backend.app.prompts.diagnosis_prompts import (
    DIAGNOSIS_SYSTEM_INSTRUCTION,
    build_diagnosis_prompt
)
from backend.app.prompts.reevaluation_prompts import (
    REEVALUATION_SYSTEM_INSTRUCTION,
    build_reevaluation_prompt
)

logger = logging.getLogger("faultforge.gemini")

class GeminiServiceError(Exception):
    """Custom exception for Gemini API related errors."""
    def __init__(self, message: str, status_code: int = 500, is_retryable: bool = False):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.is_retryable = is_retryable


def extract_json_from_text(text: str) -> dict:
    """Extract and parse JSON object from raw LLM text output."""
    cleaned = text.strip()
    # Strip markdown backticks if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()
    return json.loads(cleaned)


def get_demo_fallback_diagnosis(symptoms: str, code: Optional[str] = None) -> DiagnosisReport:
    """Explicitly labeled sample diagnosis for mentor demo when no API key is set."""
    is_arduino_led = "led" in symptoms.lower() or (code and "led" in code.lower())
    
    if is_arduino_led:
        return DiagnosisReport(
            problem_summary="[DEMO SAMPLE DATA] Arduino digital output fails to illuminate the connected LED circuit.",
            hypotheses=[
                Hypothesis(
                    id="H1",
                    rank=1,
                    title="Reversed LED Polarity (Anode/Cathode Inversion)",
                    description="The LED is connected backwards. Current can only flow when the longer anode lead connects to the positive pin (through resistor) and cathode to GND.",
                    likelihood="HIGH",
                    confidence_score=0.82,
                    supporting_evidence=[
                        "Physical symptom: LED stays completely dark despite output being driven HIGH.",
                        "Standard diode behavior: Inverted LEDs block current flow entirely."
                    ]
                ),
                Hypothesis(
                    id="H2",
                    rank=2,
                    title="Software Pin Mismatch or Missing pinMode(OUTPUT)",
                    description="The pin configuration in sketch setup does not match the physical header connection, or is left in high-impedance INPUT mode.",
                    likelihood="MEDIUM",
                    confidence_score=0.65,
                    supporting_evidence=[
                        "Code check: Pin numbers in digitalWrite() must match pinMode() and physical jumper."
                    ]
                ),
                Hypothesis(
                    id="H3",
                    rank=3,
                    title="Incorrect Current-Limiting Resistor Value",
                    description="Excessively high resistance (e.g. 100kΩ instead of 220Ω-330Ω) starves the LED of sufficient forward current.",
                    likelihood="LOW",
                    confidence_score=0.35,
                    supporting_evidence=[
                        "Resistor check: High resistance causes negligible current flow, appearing dark."
                    ]
                )
            ],
            recommended_test="Safely reverse the LED orientation on the breadboard (swap anode and cathode legs) or measure DC voltage between the digital pin and GND.",
            expected_observation="If H1 is correct, reversing the LED legs will cause it to illuminate. If voltage is 0V on the pin, H2 is the root cause.",
            additional_checks=[
                "Verify ground jumper wire connects to Arduino GND rail.",
                "Inspect LED internal die for signs of overcurrent burnout."
            ],
            safety_warning="Ensure USB cable or 5V power is disconnected before reseating components on the breadboard.",
            follow_up_question="What value is marked or color-coded on the current limiting resistor?"
        )
    
    return DiagnosisReport(
        problem_summary=f"[DEMO SAMPLE DATA] Circuit malfunction identified for: {symptoms[:100]}",
        hypotheses=[
            Hypothesis(
                id="H1",
                rank=1,
                title="Open Circuit / Floating Ground Reference",
                description="The circuit lacks a common ground return path between microcontroller and load.",
                likelihood="HIGH",
                confidence_score=0.75,
                supporting_evidence=["Reported symptoms indicate failure of current loop completion."]
            ),
            Hypothesis(
                id="H2",
                rank=2,
                title="Firmware Configuration or Pin Mode Fault",
                description="Microcontroller firmware is not driving the control pin or baud rate is mismatched.",
                likelihood="MEDIUM",
                confidence_score=0.60,
                supporting_evidence=["Microcontroller logic state not confirmed."]
            )
        ],
        recommended_test="Use a digital multimeter in DC voltage mode to check for 5V/3.3V at the output pin relative to GND.",
        expected_observation="A reading of 0V indicates code/pin configuration error; 5V indicates load/wiring defect.",
        additional_checks=["Verify USB power connection"],
        safety_warning="Do not short power rails directly to ground.",
        follow_up_question="Does the power indicator LED on your board stay solidly lit?"
    )


def get_demo_fallback_reevaluation(user_observation: str) -> ReevaluationReport:
    """Explicitly labeled sample reevaluation for mentor demo when no API key is set."""
    obs_lower = user_observation.lower()
    led_reversed_failed = "reverse" in obs_lower or "swapped" in obs_lower or "0v" in obs_lower
    
    if led_reversed_failed:
        return ReevaluationReport(
            delta_explanation="[DEMO SAMPLE DATA] Based on your observation, reversing the LED did not illuminate it, and pin voltage was measured at 0V. This weakens the polarity hypothesis (H1) and strongly supports a firmware pin configuration fault (H2).",
            hypotheses=[
                Hypothesis(
                    id="H2",
                    rank=1,
                    title="Software Pin Mismatch or Missing pinMode(OUTPUT)",
                    description="The firmware is not driving the expected pin HIGH. The physical pin remains at 0V.",
                    likelihood="HIGH",
                    confidence_score=0.92,
                    supporting_evidence=[
                        "Observation: Voltage reading at pin is 0V, confirming output is not being driven high.",
                        "Reversing LED did not resolve the issue."
                    ],
                    status="SUPPORTED",
                    status_reason="0V measurement directly confirms signal pin is inactive."
                ),
                Hypothesis(
                    id="H1",
                    rank=2,
                    title="Reversed LED Polarity (Anode/Cathode Inversion)",
                    description="Original hypothesis that LED was backwards.",
                    likelihood="LOW",
                    confidence_score=0.15,
                    supporting_evidence=["Tested and ruled out by user."],
                    status="WEAKENED",
                    status_reason="User verified orientation swap failed to light the LED."
                )
            ],
            recommended_test="Check the source code setup() function for pinMode(pin, OUTPUT) and confirm the pin integer matches your physical breadboard wire.",
            expected_observation="Correcting the pin definition in code should produce 5V on the pin and light the LED.",
            additional_checks=["Ensure digital pin header on board is not bent or loose."],
            safety_warning="Disconnect USB cable before re-flashing or moving jumper wires.",
            follow_up_question="Which digital pin number is the jumper wire physically plugged into?"
        )
    
    return ReevaluationReport(
        delta_explanation=f"[DEMO SAMPLE DATA] Reevaluated against observation: '{user_observation}'. Hypotheses updated accordingly.",
        hypotheses=[
            Hypothesis(
                id="H1",
                rank=1,
                title="Confirmed Hardware/Software Root Cause",
                description="Observation provides differential evidence isolating the defect.",
                likelihood="HIGH",
                confidence_score=0.88,
                supporting_evidence=[f"User observed: {user_observation}"],
                status="SUPPORTED",
                status_reason="Observation confirms defect pattern."
            )
        ],
        recommended_test="Apply recommended fix and verify normal operation.",
        expected_observation="Normal system operation restored.",
        additional_checks=[],
        safety_warning="Always handle components with power disconnected.",
        follow_up_question=None
    )


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._client: Optional[genai.Client] = None
        
        if self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Google Gen AI Client: {e}")
                self._client = None

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self._client)

    async def diagnose_fault(
        self,
        symptoms: str,
        expected_behavior: Optional[str] = None,
        actual_behavior: Optional[str] = None,
        source_code: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None
    ) -> Tuple[DiagnosisReport, bool]:
        """
        Diagnose circuit fault using Google Gemini API.
        Returns: (DiagnosisReport, is_demo_fallback)
        """
        if not self.is_configured:
            logger.warning("Gemini API key is not configured. Falling back to explicit demo sample mode.")
            return get_demo_fallback_diagnosis(symptoms, source_code), True

        user_prompt = build_diagnosis_prompt(
            symptoms=symptoms,
            expected_behavior=expected_behavior,
            actual_behavior=actual_behavior,
            source_code=source_code,
            has_image=bool(image_bytes)
        )

        contents = [user_prompt]
        if image_bytes and image_mime_type:
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type
            )
            contents.append(image_part)

        try:
            config = types.GenerateContentConfig(
                system_instruction=DIAGNOSIS_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.2,
            )

            # Invoke Gemini API
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
            )

            if not response.text:
                raise GeminiServiceError("Gemini returned an empty response.", status_code=502)

            data = extract_json_from_text(response.text)
            report = DiagnosisReport.model_validate(data)
            return report, False

        except APIError as e:
            logger.error(f"Gemini APIError encountered: {e}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise GeminiServiceError(
                    "Google Gemini API quota exceeded or rate-limited. Please check your quota.",
                    status_code=429,
                    is_retryable=True
                )
            raise GeminiServiceError(f"Gemini API error: {e.message if hasattr(e, 'message') else str(e)}", status_code=502)

        except Exception as e:
            logger.error(f"Error during Gemini diagnosis: {e}")
            if isinstance(e, GeminiServiceError):
                raise e
            raise GeminiServiceError(f"Diagnostic inference failed: {str(e)}", status_code=500)

    async def reevaluate_hypotheses(
        self,
        symptoms: str,
        previous_hypotheses_json: str,
        recommended_test: str,
        user_observation: str,
        expected_behavior: Optional[str] = None,
        actual_behavior: Optional[str] = None,
        source_code: Optional[str] = None
    ) -> Tuple[ReevaluationReport, bool]:
        """
        Reevaluate prior hypotheses against user observation.
        Returns: (ReevaluationReport, is_demo_fallback)
        """
        if not self.is_configured:
            logger.warning("Gemini API key is not configured. Falling back to explicit demo sample mode.")
            return get_demo_fallback_reevaluation(user_observation), True

        user_prompt = build_reevaluation_prompt(
            symptoms=symptoms,
            previous_hypotheses_json=previous_hypotheses_json,
            recommended_test=recommended_test,
            user_observation=user_observation,
            expected_behavior=expected_behavior,
            actual_behavior=actual_behavior,
            source_code=source_code
        )

        try:
            config = types.GenerateContentConfig(
                system_instruction=REEVALUATION_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.2,
            )

            response = self._client.models.generate_content(
                model=self.model_name,
                contents=[user_prompt],
                config=config
            )

            if not response.text:
                raise GeminiServiceError("Gemini returned an empty reevaluation response.", status_code=502)

            data = extract_json_from_text(response.text)
            report = ReevaluationReport.model_validate(data)
            return report, False

        except APIError as e:
            logger.error(f"Gemini APIError during reevaluation: {e}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise GeminiServiceError("Gemini API quota exceeded.", status_code=429, is_retryable=True)
            raise GeminiServiceError(f"Gemini API error: {str(e)}", status_code=502)

        except Exception as e:
            logger.error(f"Error during Gemini reevaluation: {e}")
            if isinstance(e, GeminiServiceError):
                raise e
            raise GeminiServiceError(f"Reevaluation inference failed: {str(e)}", status_code=500)

# Global service instance
gemini_service = GeminiService()
