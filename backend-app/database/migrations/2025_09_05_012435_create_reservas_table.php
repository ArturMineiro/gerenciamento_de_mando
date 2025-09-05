<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
  Schema::create('reservas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('id_campo')->constrained('campos');
    $table->foreignId('id_horario')->constrained('horarios');
    $table->foreignId('id_cliente')->constrained('clientes');
    $table->foreignId('id_usuario')->constrained('usuarios'); // quem cadastrou
    $table->date('data');
    $table->enum('status', ['reservado','cancelado','concluido'])->default('reservado');
    $table->timestamps();

    $table->unique(['id_campo', 'id_horario', 'data']); // impede conflito
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
