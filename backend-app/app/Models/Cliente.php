<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
protected $fillable = ['cpf_cnpj', 'nome', 'telefone', 'email'];

public function reservas()
{
    return $this->hasMany(Reserva::class, 'id_cliente');  
}
}
