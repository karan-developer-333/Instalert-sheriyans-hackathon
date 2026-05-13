import { Mistral } from "@mistralai/mistralai";
import config from "../config/config.js";

const client = new Mistral({ apiKey: config.MISTRAL_API_KEY });

const TOOLS = [
    {
        type: "function",
        function: {
            name: "create_incident",
            description: "Propose creating a new incident report. Use this when patterns suggest an issue needs tracking.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Short, descriptive title for the incident",
                    },
                    description: {
                        type: "string",
                        description: "Detailed description of the incident and why it's being created",
                    },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high", "critical"],
                        description: "Severity level of the incident",
                    },
                },
                required: ["title", "description"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "remove_user",
            description: "Propose removing a user from the organization. Use this when a user's behavior or performance warrants removal.",
            parameters: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        description: "The ID of the user to remove",
                    },
                    username: {
                        type: "string",
                        description: "The username of the user to remove",
                    },
                    reason: {
                        type: "string",
                        description: "Detailed reason why this user should be removed",
                    },
                },
                required: ["userId", "username", "reason"],
            },
        },
    },
];

const SYSTEM_PROMPT = `You are an AI Organization Management Assistant for a team called InstaAlert. You have access to the organization's full context including members, incidents, and performance data.

Your capabilities:
1. Answer questions about team members (who they are, their scores, activity)
2. Analyze organizational performance and trends
3. Suggest incident creation based on patterns
4. Recommend management actions (user removal, task assignment)

IMPORTANT RULES:
- If the user asks you to CREATE an incident, remove a user, or take ANY action, you MUST call the appropriate tool
- For queries and analysis, respond naturally in text
- Be professional, concise, and data-driven
- Base all suggestions on the provided org context
- Always explain your reasoning before suggesting an action
- Consider the impact of your suggestions on the team

CRITICAL:
- The tools ONLY format your suggestions - they do NOT execute actions
- The user will see Approve/Reject buttons in the UI for each suggestion
- If the user types "yes", "confirm", "ok", "execute", "do it", "proceed", or similar, tell them to use the Approve button in the chat interface
- Do NOT create duplicate proposals for the same action
- You are a recommendation engine only. Actions are executed only when the user clicks Approve`;

export const analyzeOrgRequest = async (userMessage, orgContext) => {
    const contextText = buildContextText(orgContext);

    const response = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `${contextText}\n\nUser query: ${userMessage}` },
        ],
        tools: TOOLS,
        maxTokens: 2048,
    });

    const parsed = parseResponse(response);

    return parsed;
};

const buildContextText = (orgContext) => {
    return `Organization: ${orgContext.orgName}
Owner: ${orgContext.ownerName}
Join Code: ${orgContext.joinCode}

Team Members (${orgContext.members.length}):
${orgContext.members.map(m => `- ${m.username} (ID: ${m._id}) (${m.email}) | Role: ${m.role} | Score: ${m.working_score} | Status: ${m.status || 'active'}`).join('\n')}

Recent Incidents (${orgContext.recentIncidents.length}):
${orgContext.recentIncidents.map(inc => `- "${inc.title}" | Status: ${inc.status} | Created: ${inc.createdAt}`).join('\n')}

Total Incidents: ${orgContext.totalIncidents}
Total Members: ${orgContext.members.length}`;
};

const parseResponse = (response) => {
    const message = response.choices?.[0]?.message;
    if (!message) {
        return { response: "No response from AI", suggestedAction: null, proposals: [] };
    }

    const content = getContentString(message.content) || "";
    const toolCalls = message.toolCalls || message.tool_calls || [];
    const proposals = [];

    for (const tc of toolCalls) {
        try {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            proposals.push({
                proposalId: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                actionType: tc.function.name,
                ...args,
            });
        } catch (e) {
            console.log("orgAI: Failed to parse tool call", e);
        }
    }

    return {
        response: content,
        suggestedAction: proposals.length > 0 ? proposals[0] : null,
        proposals,
    };
};

const getContentString = (content) => {
    if (!content) return "";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map(block => block.text || "").join("\n\n");
    if (typeof content === "object") return content.text || "";
    return "";
};

const SUGGESTION_PROMPT = `You are an AI Organization Management Assistant. Based on the organization context provided, generate exactly 3 actionable suggestions that the org owner might want to take.

Rules:
- Suggestions should be specific and actionable
- Format each suggestion as a short command-like phrase (e.g., "Remove the user Aman", "Create an incident for database crash of redis in Delhi aws")
- Base suggestions on actual data from the org context (low scoring users, recent incidents, patterns)
- Make them realistic and relevant to the organization's current state
- Return ONLY a JSON array of strings, nothing else

Example output:
["Remove the user Aman", "Create an incident for database crash of redis in Delhi aws", "Review performance of users with low scores"]`;

export const generateSuggestions = async (orgContext) => {
    try {
        const contextText = buildContextText(orgContext);

        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: SUGGESTION_PROMPT },
                { role: "user", content: contextText },
            ],
            maxTokens: 512,
        });

        const message = response.choices?.[0]?.message;
        const content = getContentString(message?.content) || "";

        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const suggestions = JSON.parse(jsonMatch[0]);
                return suggestions.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim());
            }
        } catch (e) {
            console.log("orgAI: Failed to parse suggestions, using fallback");
        }

        return [
            "Remove a low-performing team member",
            "Create an incident for recent issues",
            "Review team performance trends"
        ];
    } catch (error) {
        console.error("orgAI: Failed to generate suggestions:", error);
        return [
            "Remove a low-performing team member",
            "Create an incident for recent issues",
            "Review team performance trends"
        ];
    }
};

export const askMistral = async (systemPrompt, userMessage) => {
    const response = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        maxTokens: 1024,
    });

    const message = response.choices?.[0]?.message;
    return getContentString(message?.content) || "No response from AI";
};

export default {
    analyzeOrgRequest,
    askMistral,
    generateSuggestions,
};
