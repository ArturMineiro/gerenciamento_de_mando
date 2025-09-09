<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $fillable = ['cpf_cnpj', 'nome', 'telefone', 'email', 'usuario_id'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

        public function setCpfCnpjAttribute($value)
    {
        $this->attributes['cpf_cnpj'] = preg_replace('/\D+/', '', (string) $value);
    }
}

