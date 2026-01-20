<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('code_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('code_review_id')->constrained()->onDelete('cascade');
            $table->integer('line_number');
            $table->enum('severity', ['high', 'medium', 'low']);
            $table->string('type'); // Security, Performance, Code Quality, etc.
            $table->text('message');
            $table->text('suggestion');
            $table->text('code_snippet')->nullable();
            $table->timestamps();
            
            $table->index(['code_review_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('code_issues');
    }
};
