<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Cadastro
    public function register(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|unique:usuarios,email',
            'senha' => 'required|string|min:6',
            'role' => 'in:admin,gerenciador'
        ]);

        $usuario = Usuario::create([
            'nome' => $request->nome,
            'email' => $request->email,
            'senha_hash' => Hash::make($request->senha),
            'role' => $request->role ?? 'gerenciador'
        ]);

        return response()->json([
            'message' => 'Usuário registrado com sucesso!',
            'usuario' => $usuario
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'senha' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario || !Hash::check($request->senha, $usuario->senha_hash)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        // 🔑 se for API, usa token (Passport, Sanctum, JWT)
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'usuario' => $usuario,
            'token' => $token
        ]);
    }

    // Logout
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logout realizado com sucesso'
    ]);
}

}
