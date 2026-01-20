<?php

// app/Services/ClaudeAIService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeAIService
{
    private string $apiKey;
    private string $apiUrl = 'https://api.anthropic.com/v1/messages';
    private string $model = 'claude-sonnet-4-20250514';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    /**
     * Analyze code and return structured issues
     */
    public function analyzeCode(string $code, string $language, string $filename): array
    {
        $prompt = $this->buildPrompt($code, $language, $filename);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
            ])->timeout(120)->post($this->apiUrl, [
                'model' => $this->model,
                'max_tokens' => 4096,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::error('Claude API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Failed to analyze code with Claude API');
            }

            $data = $response->json();
            $content = $data['content'][0]['text'] ?? '';

            return $this->parseClaudeResponse($content);

        } catch (\Exception $e) {
            Log::error('Code Analysis Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Build the prompt for Claude
     */
    private function buildPrompt(string $code, string $language, string $filename): string
    {
        return <<<PROMPT
You are an expert code reviewer. Analyze the following {$language} code from file "{$filename}" and provide a detailed code review.

CODE:
```{$language}
{$code}
```

Please analyze this code and respond ONLY with a valid JSON object in this exact format (no markdown, no backticks, just raw JSON):

{
  "summary": "Brief overall analysis of the code quality and main concerns",
  "issues": [
    {
      "line": <line_number>,
      "severity": "high|medium|low",
      "type": "Security|Performance|Code Quality|Best Practices|Maintainability",
      "message": "Clear description of the issue",
      "suggestion": "Specific recommendation to fix the issue",
      "code_snippet": "The problematic code snippet if applicable"
    }
  ]
}

Focus on:
1. Security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
2. Performance problems (N+1 queries, inefficient algorithms, memory leaks)
3. Code quality issues (naming conventions, code duplication, complexity)
4. Best practices violations (error handling, validation, design patterns)
5. Maintainability concerns (documentation, testability, modularity)

Severity levels:
- HIGH: Critical security vulnerabilities, data loss risks, performance bottlenecks
- MEDIUM: Important issues that should be addressed but aren't critical
- LOW: Minor improvements, style issues, optional optimizations

Provide at least 3-10 issues if found. Be thorough but practical.
PROMPT;
    }

    /**
     * Parse Claude's JSON response
     */
    private function parseClaudeResponse(string $content): array
    {
        // Remove markdown code blocks if present
        $content = preg_replace('/```json\s*/', '', $content);
        $content = preg_replace('/```\s*$/', '', $content);
        $content = trim($content);

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            // Validate structure
            if (!isset($data['summary']) || !isset($data['issues'])) {
                throw new \Exception('Invalid response structure from Claude');
            }

            // Ensure issues is an array
            if (!is_array($data['issues'])) {
                $data['issues'] = [];
            }

            // Calculate counts
            $counts = [
                'high' => 0,
                'medium' => 0,
                'low' => 0,
            ];

            foreach ($data['issues'] as $issue) {
                $severity = strtolower($issue['severity'] ?? 'low');
                if (isset($counts[$severity])) {
                    $counts[$severity]++;
                }
            }

            return [
                'summary' => $data['summary'],
                'issues' => $data['issues'],
                'total_issues' => count($data['issues']),
                'high_severity' => $counts['high'],
                'medium_severity' => $counts['medium'],
                'low_severity' => $counts['low'],
            ];

        } catch (\JsonException $e) {
            Log::error('Failed to parse Claude response', [
                'content' => $content,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Failed to parse AI response');
        }
    }

    /**
     * Test API connection
     */
    public function testConnection(): bool
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
            ])->timeout(10)->post($this->apiUrl, [
                'model' => $this->model,
                'max_tokens' => 50,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => 'Say "API connection successful"',
                    ],
                ],
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Claude API Connection Test Failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}