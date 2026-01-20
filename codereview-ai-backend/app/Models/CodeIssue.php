<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_review_id',
        'line_number',
        'severity',
        'type',
        'message',
        'suggestion',
        'code_snippet',
    ];

    public function codeReview(): BelongsTo
    {
        return $this->belongsTo(CodeReview::class);
    }

    public function scopeHighSeverity($query)
    {
        return $query->where('severity', 'high');
    }

    public function scopeMediumSeverity($query)
    {
        return $query->where('severity', 'medium');
    }

    public function scopeLowSeverity($query)
    {
        return $query->where('severity', 'low');
    }
}
