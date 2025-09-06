<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $fillable = ['hora_inicio', 'hora_fim']; // usuario_id será setado pelo controller

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function reservas()
    {
        // reserva referencia o horário via horario_id
        return $this->hasMany(Reserva::class, 'horario_id');
    }
}
