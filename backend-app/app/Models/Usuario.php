<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = ['nome', 'email', 'senha_hash', 'role'];
    protected $hidden  = ['senha_hash', 'remember_token'];

    // Diz ao Laravel qual campo é a senha
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }

    // Relacionamentos
    public function campos(){ return $this->hasMany(Campo::class); }
    public function clientes(){ return $this->hasMany(Cliente::class); }
    public function reservas(){ return $this->hasMany(Reserva::class); }
}
