<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campo extends Model
{
protected $fillable = ['nome', 'localizacao'];


public function reservas()
{
    return $this->hasMany(Reserva::class, 'id_campo');  

}
}