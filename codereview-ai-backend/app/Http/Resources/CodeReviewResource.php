<?php

// app/Http/Resources/CodeReviewResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CodeReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_name' => $this->user_name,
            'filename' => $this->filename,
            'language' => $this->language,
            'status' => $this->status,
            'original_code' => $this->original_code,
            'ai_analysis' => $this->ai_analysis,
            'total_issues' => $this->total_issues,
            'high_severity' => $this->high_severity,
            'medium_severity' => $this->medium_severity,
            'low_severity' => $this->low_severity,
            'suggestions_count' => $this->suggestions_count,
            'issues' => CodeIssueResource::collection($this->whenLoaded('issues')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}