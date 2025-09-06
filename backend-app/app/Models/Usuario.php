<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    protected $fillable = ['nome', 'email', 'senha_hash', 'role'];
    protected $hidden = ['senha_hash'];

    // Faz o Laravel entender que 'senha_hash' é o password
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }

    // Relacionamentos
    public function campos()
    {
        return $this->hasMany(Campo::class);
    }

    public function clientes()
    {
        return $this->hasMany(Cliente::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
