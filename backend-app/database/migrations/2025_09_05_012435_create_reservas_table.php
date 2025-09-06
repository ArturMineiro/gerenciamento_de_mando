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
    $table->foreignId('campo_id')->constrained('campos')->onDelete('cascade');
    $table->foreignId('horario_id')->constrained('horarios')->onDelete('cascade');
    $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
    $table->date('data');
    $table->enum('status', ['reservado','cancelado','concluido'])->default('reservado');
    $table->timestamps();

    $table->unique(['campo_id', 'horario_id', 'data']); // garante não sobrepor
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
