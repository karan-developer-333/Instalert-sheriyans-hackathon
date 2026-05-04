import { ChatMistralAI } from '@langchain/mistralai';
import Incident from '../models/incident.model.js';
import Organization from '../models/organization.model.js';
import crypto from 'crypto';

const llm = new ChatMistralAI({
  model: 'mistral-small-latest',
  temperature: 0.1
});

const generateFingerprint = (errorMessage, stackTrace, endpoint) => {
  const content = `${errorMessage}:${stackTrace || ''}:${endpoint || ''}`;
  return crypto.createHash('sha256').update(content).digest('hex');
};

const enhanceIncident = async (rawError, organization) => {
  try {
    const org = await Organization.findById(organization?._id || organization).select('+customAiPrompt');
    const customPrompt = org?.customAiPrompt || '';

    const defaultPrompt = `You are an expert debugging assistant for developers. Analyze this error and return a JSON response.

REQUIRED OUTPUT FORMAT (return ONLY valid JSON, no markdown fences):
{
  "title": "Concise error title, max 80 chars, actionable (e.g., 'Database Connection Failed' not 'Error')",
  "description": "Full markdown description with sections: ## Summary, ## Stack Trace, ## Context, ## Root Cause, ## Fix",
  "severity": "low|medium|high|critical"
}

GUIDELINES:
1. Title should be actionable (e.g., "PostgreSQL Connection Failed" not "Error occurred")
2. Summary: 1-2 sentences explaining what went wrong in simple terms
3. Root Cause: Specific technical reason (e.g., "Redis server not running" not "server error")
4. Fix: Concrete steps with commands if applicable
5. Severity: low=cosmetic, medium=partial outage, high=major feature down, critical=full outage

ERROR DETAILS:
- Message: ${rawError.errorMessage}
- Stack Trace: ${rawError.stackTrace || 'N/A'}
- Server: ${rawError.serverName || 'N/A'}
- Endpoint: ${rawError.endpoint || 'N/A'}
- Method: ${rawError.method || 'N/A'}
- Status Code: ${rawError.statusCode || 'N/A'}
- Custom Metadata: ${JSON.stringify(rawError.metadata || {})}`;

    const prompt = customPrompt 
      ? `${customPrompt}\n\n---\nAnalyze this error:\n${JSON.stringify(rawError)}`
      : defaultPrompt;

    const response = await llm.invoke(prompt);
    
    // Clean markdown code blocks from LLM response
    let cleanJson = response.content.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const result = JSON.parse(cleanJson);
    return {
      title: result.title?.substring(0, 80) || rawError.errorMessage.substring(0, 80),
      description: result.description || `Auto-detected error on ${rawError.serverName}\n\n${rawError.stackTrace || ''}`,
      severity: ["low", "medium", "high", "critical"].includes(result.severity) ? result.severity : "medium"
    };
  } catch (error) {
    console.error('AI enhance incident error:', error);
    return {
      title: rawError.errorMessage.substring(0, 80),
      description: `Auto-detected error on ${rawError.serverName}\n\n${rawError.stackTrace || ''}`,
      severity: "medium"
    };
  }
};

const checkSimilarity = async (newError, organizationId) => {
  try {
    const existingIncidents = await Incident.find({
      organization: organizationId,
      source: 'auto-error'
    }).select('title description errorFingerprint _id').limit(50);

    if (existingIncidents.length === 0) return null;

    const incidentList = existingIncidents.map((inc, i) =>
      `${i}: ${inc.title} (ID: ${inc._id})`
    ).join('\n');

    const prompt = `Compare this new error to existing incidents and return the ID of the most similar one, or "NEW" if none are similar.

New Error:
Message: ${newError.errorMessage}
Stack: ${newError.stackTrace || 'N/A'}
Endpoint: ${newError.endpoint || 'N/A'}

Existing Incidents:
${incidentList}

Respond with ONLY the incident ID or "NEW".`;

    const response = await llm.invoke(prompt);
    const result = response.content.trim();

    if (result === 'NEW') return null;

    const matchedIncident = existingIncidents.find(inc => inc._id.toString() === result);
    return matchedIncident || null;
  } catch (error) {
    console.error('AI similarity check error:', error);
    return null;
  }
};

const generateFixSuggestion = async (currentError, similarIncident) => {
  try {
    const prompt = `Create a copy-pasteable prompt for any AI tool (ChatGPT, Claude, etc.) to fix this error.

CURRENT ERROR:
- Message: ${currentError.errorMessage}
- Stack: ${currentError.stackTrace || 'N/A'}
- Server: ${currentError.serverName || 'N/A'}
- Endpoint: ${currentError.endpoint || 'N/A'}
- Method: ${currentError.method || 'N/A'}

PAST SIMILAR INCIDENT (already solved):
Title: ${similarIncident.title}
Description: ${similarIncident.description || 'N/A'}

Generate a concise prompt (max 300 words) that:
1. Describes the current error clearly
2. References the past solution approach from similar incident
3. Asks for exact code/commands to fix the current error

Return ONLY the prompt text, ready to copy-paste into any AI tool.`;

    const response = await llm.invoke(prompt);
    return response.content.trim();
  } catch (error) {
    console.error('AI fix suggestion error:', error);
    return `Fix this error: ${currentError.errorMessage}\n\nStack Trace:\n${currentError.stackTrace || 'N/A'}\n\nPlease provide step-by-step fix instructions.`;
  }
};

const generateSolutionPrompt = async (currentError) => {
  try {
    const prompt = `Create a high-quality, professional prompt that a developer can copy-paste into an AI tool (like ChatGPT or Claude) to solve this specific error.

ERROR CONTEXT:
- Message: ${currentError.errorMessage}
- Stack: ${currentError.stackTrace || 'N/A'}
- Server: ${currentError.serverName || 'N/A'}
- Endpoint: ${currentError.endpoint || 'N/A'}
- Method: ${currentError.method || 'N/A'}
- Status: ${currentError.statusCode || 'N/A'}

The prompt you generate should:
1. Clearly explain the error to the recipient AI.
2. Ask for a root cause analysis.
3. Request specific, step-by-step code fixes or terminal commands.
4. Ask for prevention strategies.

Return ONLY the copy-pasteable prompt text.`;

    const response = await llm.invoke(prompt);
    return response.content.trim();
  } catch (error) {
    console.error('AI solution prompt error:', error);
    return `Fix this error: ${currentError.errorMessage}\n\nStack Trace:\n${currentError.stackTrace || 'N/A'}`;
  }
};

export default { checkSimilarity, generateFixSuggestion, generateFingerprint, enhanceIncident, generateSolutionPrompt };
