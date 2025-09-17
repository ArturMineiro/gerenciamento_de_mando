<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class PasswordController extends Controller
{
    // Passo 1: usuário informa email -> geramos token e mandamos link por email (via EmailJS)
    public function forgot(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email'
        ]);

        $user = Usuario::where('email', $data['email'])->first();

        // Sempre responde igual para não vazar se o email existe
        if (!$user) {
            return response()->json(['message' => 'Se o email existir, enviaremos instruções.'], 200);
        }

        // Gera token e grava na tabela password_reset_tokens (hash internamente)
        $token = Password::createToken($user);

        // Monta o link para a página do frontend
        $resetUrl = rtrim(config('app.frontend_url'), '/')
            . '/reset-password?token=' . urlencode($token)
            . '&email=' . urlencode($user->email);

        // Envia com EmailJS (ajuste as variáveis para bater com seu Template)
        $payload = [
            'service_id'      => config('services.emailjs.service_id'),
            'template_id'     => config('services.emailjs.template_id'),
            'user_id'         => config('services.emailjs.public_key'),   // Public Key
            'accessToken'     => config('services.emailjs.private_key'),  // Private Key (se ativada)
            'template_params' => [
                'to_email'   => $user->email,
                'to_name'    => $user->nome ?? 'usuário',
                'subject'    => 'Redefinição de senha',
                'reset_link' => $resetUrl,
            ],
        ];

        Http::asJson()->post('https://api.emailjs.com/api/v1.0/email/send', $payload);

        return response()->json(['message' => 'Se o email existir, enviaremos instruções.'], 200);
    }

    // Passo 2: usuário envia token + nova senha -> validamos e atualizamos senha
    public function reset(Request $request)
    {
        $cred = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:6|confirmed', // precisa de password_confirmation
        ]);

        $status = Password::reset(
            [
                'email'                 => $cred['email'],
                'token'                 => $cred['token'],
                'password'              => $cred['password'],
                'password_confirmation' => $request->password_confirmation,
            ],
            function ($user) use ($cred) {
                // seu campo de senha é "senha_hash"
                $user->senha_hash = Hash::make($cred['password']);
                $user->save();

                // (opcional) invalida tokens de acesso atuais (Sanctum)
                if (method_exists($user, 'tokens')) {
                    $user->tokens()->delete();
                }
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Senha redefinida com sucesso.'], 200);
        }

        // Possíveis erros: token inválido/expirado, email não bate, etc.
        return response()->json(['message' => __($status)], 422);
    }
}
