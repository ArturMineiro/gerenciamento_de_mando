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
    $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade'); // dono da reserva
    $table->foreignId('id_campo')->constrained('campos')->onDelete('cascade');
    $table->foreignId('id_horario')->constrained('horarios')->onDelete('cascade');
    $table->foreignId('id_cliente')->constrained('clientes')->onDelete('cascade');
    $table->date('data');
    $table->enum('status', ['reservado','cancelado','concluido'])->default('reservado');
    $table->timestamps();

    $table->unique(['id_campo', 'id_horario', 'data']); // garante não sobrepor
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
