<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
protected $fillable = ['hora_inicio', 'hora_fim'];

public function reservas()
{
    return $this->hasMany(Reserva::class, 'id_cliente');
}  
}
