<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campo extends Model
{
    protected $fillable = ['nome', 'localizacao', 'usuario_id'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
