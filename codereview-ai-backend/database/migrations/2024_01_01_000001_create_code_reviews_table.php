<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('code_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('user_name'); // Simple name field instead of user_id
            $table->string('filename');
            $table->string('language');
            $table->longText('original_code');
            $table->longText('ai_analysis')->nullable();
            $table->integer('total_issues')->default(0);
            $table->integer('high_severity')->default(0);
            $table->integer('medium_severity')->default(0);
            $table->integer('low_severity')->default(0);
            $table->integer('suggestions_count')->default(0);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamps();
            
            $table->index(['user_name', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('code_reviews');
    }
};
