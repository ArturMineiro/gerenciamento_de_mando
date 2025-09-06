<?php

// database/migrations/2025_09_06_000000_create_horarios_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->timestamps();

            // Evita duplicar o MESMO intervalo para o MESMO usuário
            $table->unique(['usuario_id','hora_inicio','hora_fim']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};
