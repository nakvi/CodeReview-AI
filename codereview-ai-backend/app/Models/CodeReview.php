<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CodeReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_name',
        'filename',
        'language',
        'original_code',
        'ai_analysis',
        'total_issues',
        'high_severity',
        'medium_severity',
        'low_severity',
        'suggestions_count',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function issues(): HasMany
    {
        return $this->hasMany(CodeIssue::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeForUser($query, $userName)
    {
        return $query->where('user_name', $userName);
    }
}
