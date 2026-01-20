<?php

// app/Jobs/AnalyzeCodeJob.php

namespace App\Jobs;

use App\Models\CodeReview;
use App\Models\CodeIssue;
use App\Services\ClaudeAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalyzeCodeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3; // Retry 3 times on failure

    public function __construct(
        public CodeReview $codeReview
    ) {}

    /**
     * Execute the job
     */
    public function handle(ClaudeAIService $claudeService): void
    {
        try {
            // Update status to processing
            $this->codeReview->update(['status' => 'processing']);

            Log::info('Starting code analysis', [
                'review_id' => $this->codeReview->id,
                'filename' => $this->codeReview->filename,
                'user_name' => $this->codeReview->user_name,
            ]);

            // Call Claude AI to analyze the code
            $analysis = $claudeService->analyzeCode(
                $this->codeReview->original_code,
                $this->codeReview->language,
                $this->codeReview->filename
            );

            DB::transaction(function () use ($analysis) {
                // Update code review with analysis summary
                $this->codeReview->update([
                    'ai_analysis' => $analysis['summary'],
                    'total_issues' => $analysis['total_issues'],
                    'high_severity' => $analysis['high_severity'],
                    'medium_severity' => $analysis['medium_severity'],
                    'low_severity' => $analysis['low_severity'],
                    'suggestions_count' => count($analysis['issues']),
                    'status' => 'completed',
                ]);

                // Store individual issues
                foreach ($analysis['issues'] as $issue) {
                    CodeIssue::create([
                        'code_review_id' => $this->codeReview->id,
                        'line_number' => $issue['line'] ?? 0,
                        'severity' => strtolower($issue['severity'] ?? 'low'),
                        'type' => $issue['type'] ?? 'General',
                        'message' => $issue['message'] ?? '',
                        'suggestion' => $issue['suggestion'] ?? '',
                        'code_snippet' => $issue['code_snippet'] ?? null,
                    ]);
                }
            });

            Log::info('Code analysis completed successfully', [
                'review_id' => $this->codeReview->id,
                'issues_found' => $analysis['total_issues'],
            ]);

        } catch (\Exception $e) {
            Log::error('Code analysis failed', [
                'review_id' => $this->codeReview->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Update status to failed
            $this->codeReview->update([
                'status' => 'failed',
                'ai_analysis' => 'Analysis failed: ' . $e->getMessage(),
            ]);

            // Re-throw to trigger job retry
            throw $e;
        }
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('AnalyzeCodeJob failed permanently', [
            'review_id' => $this->codeReview->id,
            'error' => $exception->getMessage(),
        ]);

        $this->codeReview->update([
            'status' => 'failed',
            'ai_analysis' => 'Analysis failed after multiple retries. Please try again.',
        ]);
    }
}