<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CodeIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'line_number' => $this->line_number,
            'severity' => $this->severity,
            'type' => $this->type,
            'message' => $this->message,
            'suggestion' => $this->suggestion,
            'code_snippet' => $this->code_snippet,
        ];
    }
}