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
  Schema::create('campos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
    $table->string('nome');
    $table->string('localizacao')->nullable(); // pode ser endereço ou nome do lugar
    $table->timestamps();
});


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campos');
    }
};
