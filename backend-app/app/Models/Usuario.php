<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    protected $fillable = ['nome', 'email', 'senha_hash', 'role'];

    // Relacionamento: reservas que o usuário cadastrou
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_usuario');
    }

    // Laravel usa senha padrão para autenticação
    protected $hidden = ['senha_hash'];
}
