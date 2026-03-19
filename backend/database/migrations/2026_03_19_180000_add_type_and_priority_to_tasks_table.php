<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('type', 100)->nullable()->after('description');
            $table->unsignedTinyInteger('priority')->default(0)->after('type');
            $table->index(['type', 'priority'], 'idx_tasks_type_priority');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_type_priority');
            $table->dropColumn(['type', 'priority']);
        });
    }
};
