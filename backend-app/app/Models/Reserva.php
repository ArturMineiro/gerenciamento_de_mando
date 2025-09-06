<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $fillable = ['cliente_id', 'campo_id', 'horario_id', 'usuario_id', 'data', 'status'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function campo()
    {
        return $this->belongsTo(Campo::class);
    }

    public function horario()
    {
        return $this->belongsTo(Horario::class);
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }
}
