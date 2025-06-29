
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('VITE_GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_SYSTEM_PROMPT = `You are an AI agent for a to-do list app. Always respond in JSON format only. Do not explain your answer.

Supported actions:
- create_task: Create a new task
- update_task: Update existing task details
- delete_task: Delete a specific task by title
- delete_all_tasks: Delete all tasks
- delete_all_completed_tasks: Delete only completed tasks
- mark_task_complete: Mark a task as completed
- mark_task_incomplete: Mark a task as incomplete/todo
- set_task_priority: Change task priority (high/medium/low)
- estimate_task_time: Provide time estimation for a task
- give_task_tip: Give productivity tips
- list_tasks: List or filter tasks
- get_task_count: Get count of tasks
- search_tasks: Search for tasks
- set_reminder: Set reminder for a task
- clear_reminder: Remove reminder from a task

For create_task, include:
- title (required)
- description (optional)
- priority: "high", "medium", or "low"
- due_date: ISO string format like "2025-06-30T10:00:00Z"
- status: "todo", "in-progress", or "completed"

For update_task, include:
- target_title: current task title to find
- title: new title (optional)
- description: new description (optional)
- priority: new priority (optional)
- due_date: new due date (optional)
- status: new status (optional)

For delete_task, include:
- target_title: task title to delete

For mark_task_complete/incomplete, include:
- target_title: task title to update

For productivity tips or estimates, include:
- response: the helpful text response

Examples:

Input: "Create a task to attend meeting tomorrow at 10 AM with high priority"
Output:
{
  "action": "create_task",
  "title": "Attend meeting",
  "priority": "high",
  "due_date": "2025-06-30T10:00:00Z",
  "status": "todo"
}

Input: "Mark the presentation task as complete"
Output:
{
  "action": "mark_task_complete",
  "target_title": "presentation"
}

Input: "What's the best way to stay organized?"
Output:
{
  "action": "give_task_tip",
  "response": "Break large tasks into smaller chunks, use priority levels, and review your tasks daily to stay organized."
}

Always respond with valid JSON only. No explanations.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      throw new Error('No message provided');
    }

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Sending request to Gemini with message:', message);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${GEMINI_SYSTEM_PROMPT}\n\nUser Input: "${message}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      }),
    });

    console.log('Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
      } else {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Gemini response received successfully');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Try to parse JSON response from Gemini
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', aiResponse);
      // Fallback for non-JSON responses
      parsedResponse = {
        action: 'give_task_tip',
        response: aiResponse
      };
    }

    return new Response(JSON.stringify({ response: parsedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    let errorMessage = 'Failed to get AI response';
    if (error.message.includes('Rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.message.includes('Invalid API key')) {
      errorMessage = 'Invalid API key. Please check your Gemini API configuration.';
    } else if (error.message.includes('Gemini API key not configured')) {
      errorMessage = 'Gemini API key is not configured.';
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
