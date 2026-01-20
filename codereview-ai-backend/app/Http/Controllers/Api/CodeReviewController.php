<?php

// app/Http/Controllers/Api/CodeReviewController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitCodeRequest;
use App\Http\Resources\CodeReviewResource;
use App\Jobs\AnalyzeCodeJob;
use App\Models\CodeReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CodeReviewController extends Controller
{
    /**
     * Get all code reviews for a user (by name)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'user_name' => 'required|string',
        ]);

        $reviews = CodeReview::where('user_name', $request->user_name)
            ->with('issues')
            ->recent()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => CodeReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    /**
     * Submit code for review
     */
    public function store(SubmitCodeRequest $request): JsonResponse
    {
        $review = CodeReview::create([
            'user_name' => $request->user_name,
            'filename' => $request->filename,
            'language' => $request->language,
            'original_code' => $request->code,
            'status' => 'pending',
        ]);

        // Dispatch job to analyze code asynchronously
        AnalyzeCodeJob::dispatch($review);

        return response()->json([
            'success' => true,
            'message' => 'Code submitted successfully. Analysis in progress.',
            'data' => new CodeReviewResource($review),
        ], 201);
    }

    /**
     * Get single code review with all issues
     */
    public function show(CodeReview $codeReview): JsonResponse
    {
        $codeReview->load('issues');

        return response()->json([
            'success' => true,
            'data' => new CodeReviewResource($codeReview),
        ]);
    }

    /**
     * Delete a code review
     */
    public function destroy(CodeReview $codeReview): JsonResponse
    {
        $codeReview->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ]);
    }

    /**
     * Get review statistics for a user
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'user_name' => 'required|string',
        ]);

        $userName = $request->user_name;

        $totalReviews = CodeReview::where('user_name', $userName)->count();
        
        $totalIssues = CodeReview::where('user_name', $userName)
            ->sum('total_issues');
        
        $avgIssuesPerReview = $totalReviews > 0 
            ? round($totalIssues / $totalReviews, 1) 
            : 0;

        $issuesByType = CodeReview::where('user_name', $userName)
            ->selectRaw('
                SUM(high_severity) as high,
                SUM(medium_severity) as medium,
                SUM(low_severity) as low
            ')
            ->first();

        // Get most common issues
        $commonIssues = \DB::table('code_issues')
            ->join('code_reviews', 'code_issues.code_review_id', '=', 'code_reviews.id')
            ->where('code_reviews.user_name', $userName)
            ->select('code_issues.type', \DB::raw('count(*) as count'))
            ->groupBy('code_issues.type')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_reviews' => $totalReviews,
                'total_issues' => $totalIssues,
                'avg_issues_per_review' => $avgIssuesPerReview,
                'issues_by_severity' => [
                    'high' => $issuesByType->high ?? 0,
                    'medium' => $issuesByType->medium ?? 0,
                    'low' => $issuesByType->low ?? 0,
                ],
                'common_issues' => $commonIssues,
            ]
        ]);
    }
}